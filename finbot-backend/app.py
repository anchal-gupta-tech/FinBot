import os
import sys
import time
import traceback
import datetime
import random
import warnings
from flask import Flask, request, jsonify
import google.generativeai as genai

# Suppress harmless warnings
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", message=".*urllib3.*")

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

# ------------------------- Model Configuration -------------------------
model = None
model_name = None
current_model_name = None
fallback_model_name = "models/gemini-1.5-flash"
last_quota_error_time = 0
COOLDOWN_SECONDS = 60  # Retry main model after 60 seconds

try:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise EnvironmentError("GEMINI_API_KEY environment variable not set.")
    
    # Suppress importlib.metadata warnings (compatibility issue with Python 3.9)
    import warnings
    warnings.filterwarnings("ignore", category=FutureWarning)
    
    genai.configure(api_key=api_key)

    available_models = [m.name for m in genai.list_models()]
    preferred_models = [
        "models/gemini-2.5-pro",
        "models/gemini-2.0-pro-exp",
        "models/gemini-1.5-flash"
    ]
    for candidate in preferred_models:
        if candidate in available_models:
            model_name = candidate
            break
    else:
        model_name = fallback_model_name

    model = genai.GenerativeModel(model_name)
    current_model_name = model_name
    safe_print(f"Gemini model '{model_name}' configured successfully.")
    log_to_file("Model Init", f"Configured model: {model_name}")

except Exception as e:
    # Don't print importlib.metadata errors - they're harmless compatibility warnings
    if "importlib.metadata" not in str(e) and "packages_distributions" not in str(e):
        safe_print("[ERROR] Gemini configuration failed:", e)
        log_to_file("Model Init Error", f"{e}\n{traceback.format_exc()}")
    model = None

def extract_response_text(response_obj):
    if response_obj is None:
        return ""
    if hasattr(response_obj, "text") and response_obj.text:
        return str(response_obj.text)
    if hasattr(response_obj, "candidates") and response_obj.candidates:
        try:
            cand = response_obj.candidates[0]
            if hasattr(cand, "content") and hasattr(cand.content, "parts") and cand.content.parts:
                part = cand.content.parts[0]
                if hasattr(part, "text"):
                    return str(part.text)
        except Exception:
            pass
    try:
        return str(response_obj)
    except Exception:
        return ""

@app.before_request
def restore_main_model_if_ready():
    global model, current_model_name, last_quota_error_time
    if current_model_name != model_name:
        if time.time() - last_quota_error_time > COOLDOWN_SECONDS:
            try:
                safe_print(f"Cooldown complete. Restoring main model: {model_name}")
                model = genai.GenerativeModel(model_name)
                current_model_name = model_name
            except Exception as e:
                safe_print(f"Failed to restore main model: {e}")

# ------------------------- Chat Endpoint -------------------------
@app.route("/chat", methods=["POST"])
def chat():
    global model, current_model_name, last_quota_error_time

    safe_print("\n--- /chat called ---")
    request_ts = datetime.datetime.now().isoformat()

    try:
        data = request.get_json(force=True, silent=False)
        log_to_file("Incoming Request", f"Time: {request_ts}\nPayload: {data}")
    except Exception as e:
        return jsonify({"error": "Invalid JSON format", "details": str(e)}), 400

    user_prompt = ""
    conversation_history = []
    if isinstance(data, dict):
        user_prompt = (data.get("prompt") or data.get("message") or data.get("input") or "").strip()
        # Get conversation history if provided
        conversation_history = data.get("history", []) or []

    if not user_prompt:
        return jsonify({"error": "Missing or empty prompt"}), 400

    if model is None:
        return jsonify({"error": "Gemini model not initialized on server"}), 500

    system_prompt = (
        "You are FinBot — a smart financial assistant created by Anchal Gupta. "
        "You help users with personal finance, budgeting, savings, investments, loans, and taxes. "
        "If asked who created you, say: 'I was created by Anchal Gupta to help people make smarter financial decisions.' "
        "Never mention Google, Gemini, or that you are an AI model. "
        "You remember previous conversations and can reference them naturally."
    )
    
    # Build conversation history for Gemini
    chat_history = []
    if conversation_history:
        # Convert history to Gemini format (last 10 messages to avoid token limits)
        for msg in conversation_history[-10:]:
            if isinstance(msg, dict):
                role = "user" if msg.get("sender") == "user" else "model"
                content = msg.get("text", msg.get("content", ""))
                if content:
                    chat_history.append({"role": role, "parts": [content]})
    
    # Add current user message
    chat_history.append({"role": "user", "parts": [user_prompt]})

    # Retry logic with exponential backoff
    max_retries = 3
    retry_delays = [2, 5, 10]  # seconds - longer delays for rate limits
    last_error = None
    was_rate_limit = False
    
    for attempt in range(max_retries):
        try:
            safe_print(f"Using model: {current_model_name} (attempt {attempt + 1}/{max_retries})")
            
            # Configure generation with timeout
            generation_config = {
                "temperature": 0.7,
                "top_p": 0.95,
                "top_k": 40,
            }
            
            # Use chat with history if available, otherwise use simple prompt
            if chat_history and len(chat_history) > 1:
                # Use chat interface for conversation history
                chat = model.start_chat(history=chat_history[:-1] if len(chat_history) > 1 else [])
                response_obj = chat.send_message(user_prompt, generation_config=generation_config)
            else:
                # Fallback to simple generation
                full_prompt = f"{system_prompt}\n\nUser Query: {user_prompt}"
                response_obj = model.generate_content(
                    full_prompt,
                    generation_config=generation_config
                )
            bot_text = extract_response_text(response_obj).strip()

            if not bot_text:
                log_to_file("Empty Gemini Response", f"Request: {user_prompt}\nResponse obj: {repr(response_obj)}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delays[attempt])
                    continue
                return jsonify({"error": "Empty response from model"}), 500

            log_to_file("Gemini Response", f"Prompt: {user_prompt}\nResponse: {bot_text[:500]}")
            return jsonify({"response": bot_text}), 200

        except Exception as e:
            last_error = e
            err_msg = str(e)
            tb = traceback.format_exc()
            log_to_file("Gemini Call Exception", f"Error: {e}\nTrace:\n{tb}\nPrompt: {user_prompt}\nAttempt: {attempt + 1}")

            # QUOTA / RATE LIMIT - retry with backoff
            if "429" in err_msg or "quota" in err_msg.lower() or "rate" in err_msg.lower() or "resource_exhausted" in err_msg.lower():
                was_rate_limit = True
                if attempt < max_retries - 1:
                    # Longer delay for rate limits with exponential backoff
                    delay = retry_delays[attempt] + random.uniform(0, 2)  # Add jitter
                    safe_print(f"[WARNING] Rate limit hit. Retrying in {delay:.1f}s... (attempt {attempt + 1}/{max_retries})")
                    time.sleep(delay)
                    continue
                # If all retries failed, try fallback model
                last_quota_error_time = time.time()
                safe_print(f"[WARNING] Quota exceeded after retries. Switching to fallback model...")
                break  # Exit retry loop to try fallback
            
            # For other errors, retry if not last attempt
            if attempt < max_retries - 1:
                delay = retry_delays[attempt]
                safe_print(f"[WARNING] Error occurred. Retrying in {delay}s...")
                time.sleep(delay)
                continue
    
    # If we exhausted retries and it was a rate limit, try fallback with delay
    if was_rate_limit:
        try:
            safe_print(f"[WARNING] Quota exceeded for {current_model_name}. Waiting 5s before trying fallback model...")
            time.sleep(5)  # Wait before trying fallback
            
            safe_print(f"[INFO] Trying fallback model: {fallback_model_name}")
            fallback_model = genai.GenerativeModel(fallback_model_name)
            model = fallback_model  # Update global model
            current_model_name = fallback_model_name
            generation_config = {"temperature": 0.7, "top_p": 0.95, "top_k": 40}
            
            # Use chat with history if available
            if chat_history and len(chat_history) > 1:
                chat = fallback_model.start_chat(history=chat_history[:-1] if len(chat_history) > 1 else [])
                response_obj = chat.send_message(user_prompt, generation_config=generation_config)
            else:
                full_prompt = f"{system_prompt}\n\nUser Query: {user_prompt}"
                response_obj = fallback_model.generate_content(full_prompt, generation_config=generation_config)
            bot_text = extract_response_text(response_obj).strip()

            if not bot_text:
                raise Exception("Empty fallback response")

            log_to_file("Fallback Success", f"Prompt: {user_prompt}\nResponse: {bot_text[:500]}")
            return jsonify({"response": bot_text}), 200

        except Exception as e2:
            err_msg2 = str(e2)
            log_to_file("Fallback Failed", f"{e2}\n{traceback.format_exc()}")
            
            # Check if fallback also hit rate limit
            if "429" in err_msg2 or "quota" in err_msg2.lower() or "rate" in err_msg2.lower() or "resource_exhausted" in err_msg2.lower():
                return jsonify({
                    "response": "I'm experiencing high demand right now. Your API key may have reached its rate limit. Please wait 1-2 minutes before trying again, or check your API quota at https://makersuite.google.com/app/apikey"
                }), 429
            else:
                return jsonify({
                    "response": "I'm currently handling too many requests. Please wait a moment and try again. If this persists, your API key may have reached its rate limit."
                }), 429

    # OTHER ERRORS - return user-friendly message
    error_msg = str(last_error) if last_error else "Unknown error"
    return jsonify({
        "response": "Sorry, I'm having a temporary issue processing that. Please try again in a moment.",
        "error_details": error_msg[:200] if len(error_msg) > 200 else error_msg
    }), 500

# ------------------------- Root -------------------------
@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "status": "Backend running",
        "current_model": current_model_name,
        "main_model": model_name,
        "fallback_model": fallback_model_name,
        "cooldown_seconds": COOLDOWN_SECONDS,
        "package": "google-generativeai==0.8.5",
        "purpose": "Finance-focused chatbot providing budgeting, investment, and savings guidance."
    })

if __name__ == "__main__":
    safe_print("Starting Flask backend on http://127.0.0.1:5000 ...")
    app.run(debug=True, port=5000)
