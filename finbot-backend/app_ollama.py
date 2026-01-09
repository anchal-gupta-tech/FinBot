import os
import sys
import time
import traceback
import datetime
import requests
from flask import Flask, request, jsonify

# Suppress harmless warnings
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

app = Flask(__name__) 

@app.after_request
def _add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({})
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
        return response

LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)

def safe_print(*args, **kwargs):
    try:
        print(*args, **kwargs)
    except UnicodeEncodeError:
        text = " ".join(str(a) for a in args)
        sys.stdout.buffer.write((text + "\n").encode("utf-8", "replace"))

def log_to_file(title: str, body: str):
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {title}\n{body}\n{'-'*70}\n"
    with open(os.path.join(LOG_DIR, "backend.log"), "a", encoding="utf-8") as f:
        f.write(line)

# ------------------------- Ollama Configuration -------------------------
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")  # Default model - lightweight and fast

def check_ollama_available():
    """Check if Ollama is running and accessible"""
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=2)
        if response.status_code == 200:
            return True
    except Exception:
        pass
    return False

def get_available_models():
    """Get list of available Ollama models"""
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        if response.status_code == 200:
            data = response.json()
            return [model['name'] for model in data.get('models', [])]
    except Exception as e:
        safe_print(f"[WARNING] Could not fetch Ollama models: {e}")
    return []

# Check Ollama availability on startup
ollama_available = check_ollama_available()
if ollama_available:
    available_models = get_available_models()
    safe_print(f"[INFO] Ollama is available at {OLLAMA_BASE_URL}")
    safe_print(f"[INFO] Available models: {', '.join(available_models) if available_models else 'None found'}")
    
    # Try to use a good model, fallback to default
    preferred_models = ["llama3.2", "llama3.1", "mistral", "llama3", "llama2"]
    model_to_use = OLLAMA_MODEL
    for pref in preferred_models:
        if any(pref in model for model in available_models):
            model_to_use = next((m for m in available_models if pref in m), OLLAMA_MODEL)
            break
    
    OLLAMA_MODEL = model_to_use
    safe_print(f"[INFO] Using model: {OLLAMA_MODEL}")
    log_to_file("Ollama Init", f"Ollama available. Using model: {OLLAMA_MODEL}")
else:
    safe_print("[WARNING] Ollama is not available. Please install and start Ollama.")
    safe_print("[INFO] Install from: https://ollama.ai")
    safe_print("[INFO] Then run: ollama pull llama3.2")
    log_to_file("Ollama Init", "Ollama not available")

# ------------------------- Chat Endpoint -------------------------
@app.route("/chat", methods=["POST"])
def chat():
    global ollama_available
    
    safe_print("\n--- /chat called ---")
    request_ts = datetime.datetime.now().isoformat()

    try:
        data = request.get_json(force=True, silent=False)
        log_to_file("Incoming Request", f"Time: {request_ts}\nPayload: {data}")
    except Exception as e:
        return jsonify({"error": "Invalid JSON format", "details": str(e)}), 400

     # ---- Extract data ----
    user_prompt = (data.get("prompt") or "").strip()
    conversation_history = data.get("history", []) or []

    safe_print("DEBUG history received:", conversation_history)

    # ---- NEW: Extract personality mode ----
    mode = data.get("mode", "friendly")
    safe_print("DEBUG Personality Mode:", mode)

    if not user_prompt:
        return jsonify({"error": "Missing or empty prompt"}), 400

    if not ollama_available:
        # Recheck if Ollama became available
        ollama_available = check_ollama_available()
        if not ollama_available:
            return jsonify({
                "error": "Ollama is not running. Please install Ollama from https://ollama.ai and run 'ollama pull llama3.2'"
            }), 503

    system_prompt = (
    f"You are FinBot — a smart financial assistant created by Anchal Gupta. "
    f"Your current personality mode is: {mode}. "
    f"Respond in this tone:\n\n"
    
    "friendly: Warm, simple, supportive.\n"
    "professional: Formal, precise, expert financial tone.\n"
    "beginner: Very simple explanations, easy words, step-by-step.\n"
    "strict: Short, serious, disciplined, no unnecessary emojis.\n\n"

    "You help users with personal finance, budgeting, savings, investments, loans, and taxes. "
    "If asked who created you, say: 'I was created by Anchal Gupta to help people make smarter financial decisions.' "
    "Never mention that you are an AI model or LLM. "
    "You remember previous conversations and can reference them naturally."
)


    try:
        safe_print(f"Calling Ollama model: {OLLAMA_MODEL}")
        
        # Build messages array with conversation history
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history (last 10 messages to avoid token limits)
        # Add conversation history (last 10 messages)
        for msg in conversation_history[-10:]:
            if not isinstance(msg, dict):
                continue
            
            text = msg.get("text", "").strip()
            sender = msg.get("sender", "")

            # Skip empty messages
            if not text:
                continue

            # Skip default greeting
            if text.startswith("Hello! I am FinBot"):
                continue

            role = "user" if sender == "user" else "assistant"

            messages.append({
                "role": role,
                "content": text
            })
        # Add current user's message at the end
        messages.append({"role": "user", "content": user_prompt})
        # Use chat API for better context handling
        payload = {
            "model": OLLAMA_MODEL,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
            }
        }
        
        # Try chat API first (better for conversation), fallback to generate
        try:
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/chat",
                json=payload,
                timeout=120  # 2 minute timeout
            )
        except Exception:
            # Fallback to generate API if chat not available
            safe_print("[INFO] Chat API not available, using generate API")
            payload_generate = {
                "model": OLLAMA_MODEL,
                "prompt": user_prompt,
                "context": conversation_history[-5:] if conversation_history else None,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9,
                }
            }
            response = requests.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json=payload_generate,
                timeout=120
            )
        
        if response.status_code != 200:
            error_msg = f"Ollama API error: {response.status_code} - {response.text}"
            safe_print(f"[ERROR] {error_msg}")
            log_to_file("Ollama Error", error_msg)
            return jsonify({
                "error": "Failed to get response from Ollama",
                "details": error_msg
            }), 500
        
        result = response.json()
        # Handle both chat and generate API responses
        bot_text = result.get("message", {}).get("content", "") or result.get("response", "")
        bot_text = bot_text.strip()
        
        if not bot_text:
            log_to_file("Empty Ollama Response", f"Request: {user_prompt}\nResponse: {result}")
            return jsonify({"error": "Empty response from model"}), 500

        log_to_file("Ollama Response", f"Prompt: {user_prompt}\nResponse: {bot_text[:500]}")
        return jsonify({"response": bot_text}), 200

    except requests.exceptions.Timeout:
        error_msg = "Request to Ollama timed out"
        safe_print(f"[ERROR] {error_msg}")
        log_to_file("Ollama Timeout", f"Prompt: {user_prompt}")
        return jsonify({
            "error": "The request took too long. Please try again with a shorter question."
        }), 504
        
    except requests.exceptions.ConnectionError:
        ollama_available = False
        error_msg = "Cannot connect to Ollama. Is it running?"
        safe_print(f"[ERROR] {error_msg}")
        log_to_file("Ollama Connection Error", error_msg)
        return jsonify({
            "error": "Cannot connect to Ollama. Please make sure Ollama is running.",
            "details": "Install from https://ollama.ai and run 'ollama pull llama3.2'"
        }), 503
        
    except Exception as e:
        err_msg = str(e)
        tb = traceback.format_exc()
        safe_print(f"[ERROR] Ollama call failed: {err_msg}")
        log_to_file("Ollama Exception", f"Error: {e}\nTrace:\n{tb}\nPrompt: {user_prompt}")
        return jsonify({
            "error": "Sorry, I'm having a temporary issue processing that. Please try again in a moment.",
            "details": err_msg[:200] if len(err_msg) > 200 else err_msg
        }), 500

# ------------------------- Root -------------------------
@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "status": "Backend running",
        "provider": "Ollama",
        "model": OLLAMA_MODEL,
        "ollama_url": OLLAMA_BASE_URL,
        "ollama_available": ollama_available,
        "purpose": "Finance-focused chatbot providing budgeting, investment, and savings guidance."
    })

if __name__ == "__main__":
    safe_print("Starting Flask backend with Ollama on http://127.0.0.1:5000 ...")
    if not ollama_available:
        safe_print("[WARNING] Ollama is not available. Please install and start it.")
        safe_print("[INFO] Install: https://ollama.ai")
        safe_print("[INFO] Then run: ollama pull llama3.2")
    app.run(debug=True, port=5000)

