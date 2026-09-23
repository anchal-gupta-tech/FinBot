import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

# Gemini SDK
import google.generativeai as genai


# ============================================================
# Flask setup
# ============================================================

app = Flask(__name__)

CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=False
)


# ============================================================
# Configuration
# ============================================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

GEMINI_MODEL = "models/gemini-3.6-flash"

OLLAMA_URL = "http://localhost:11434/api/chat"
OLLAMA_MODEL = "llama3.2:latest"


# ============================================================
# Gemini configuration
# ============================================================

gemini_model = None

if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)

        gemini_model = genai.GenerativeModel(GEMINI_MODEL)

        print(f"Gemini model '{GEMINI_MODEL}' configured successfully.")

    except Exception as e:
        print(f"[WARNING] Gemini configuration failed: {e}")

else:
    print("[WARNING] GEMINI_API_KEY is not set.")


# ============================================================
# System prompt
# ============================================================

SYSTEM_PROMPT = """
You are FinBot, a friendly AI financial assistant.

Your job is to help users understand personal finance in simple,
clear and practical language.

You can help with:
- Budgeting
- Saving
- Expense tracking
- Savings goals
- Personal finance concepts
- Basic investment concepts
- Financial planning
- Money management

Important rules:

1. Give clear and easy-to-understand answers.
2. Use examples when useful.
3. Do not claim to be a certified financial advisor.
4. Do not guarantee financial returns.
5. For investments, explain risks clearly.
6. Do not ask unnecessary questions.
7. Keep responses reasonably concise.
8. Use headings and bullet points when helpful.
"""


# ============================================================
# Build conversation prompt
# ============================================================

def build_prompt(user_prompt, history, mode):
    """
    Creates one unified prompt that works with both
    Gemini and Ollama.
    """

    personality = {
        "friendly": "Be warm, friendly and encouraging.",
        "professional": "Be professional, precise and structured.",
        "concise": "Keep the answer short and direct."
    }.get(mode, "Be warm, friendly and helpful.")

    conversation = ""

    if isinstance(history, list):
        # Keep only recent messages
        recent_history = history[-8:]

        for message in recent_history:
            if not isinstance(message, dict):
                continue

            role = message.get("role", "")
            content = message.get("content", "")

            if not content:
                continue

            if role == "user":
                conversation += f"\nUser: {content}"

            elif role == "assistant":
                conversation += f"\nFinBot: {content}"

    final_prompt = f"""
{SYSTEM_PROMPT}

Personality instruction:
{personality}

Previous conversation:
{conversation}

Current user message:
User: {user_prompt}

Respond as FinBot.
"""

    return final_prompt


# ============================================================
# Gemini request
# ============================================================

def ask_gemini(prompt):
    """
    Ask Gemini first.

    Returns:
        response text if successful
        None if Gemini fails or quota is exhausted
    """

    if gemini_model is None:
        print("[Gemini] Model unavailable.")
        return None

    try:
        print(f"[Gemini] Sending request to {GEMINI_MODEL}...")

        response = gemini_model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.7,
                "max_output_tokens": 700,
            }
        )

        if response and getattr(response, "text", None):
            print("[Gemini] Response received successfully.")
            return response.text.strip()

        print("[Gemini] Empty response received.")
        return None

    except Exception as e:
        error_text = str(e)

        print(f"[Gemini] Request failed: {error_text}")

        # Gemini Free Tier quota / rate limit
        if "429" in error_text or "quota" in error_text.lower():
            print("[Gemini] Free Tier quota/rate limit detected.")
            print("[Gemini] Switching to Ollama...")

        return None


# ============================================================
# Ollama request
# ============================================================

def ask_ollama(prompt):
    """
    Local Ollama fallback.
    """

    try:
        print(f"[Ollama] Using local model: {OLLAMA_MODEL}")

        payload = {
            "model": OLLAMA_MODEL,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "stream": False,
            "options": {
                "temperature": 0.7
            }
        }

        response = requests.post(
            OLLAMA_URL,
            json=payload,
            timeout=60
        )

        response.raise_for_status()

        data = response.json()

        message = data.get("message", {})
        content = message.get("content", "")

        if content:
            print("[Ollama] Response received successfully.")
            return content.strip()

        print("[Ollama] Empty response received.")
        return None

    except requests.exceptions.ConnectionError:
        print(
            "[Ollama] Could not connect to Ollama. "
            "Make sure Ollama is running."
        )

        return None

    except requests.exceptions.Timeout:
        print("[Ollama] Request timed out.")
        return None

    except Exception as e:
        print(f"[Ollama] Request failed: {e}")
        return None


# ============================================================
# Chat endpoint
# ============================================================

@app.route("/chat", methods=["POST"])
def chat():

    print("\n--- /chat called ---")

    try:
        data = request.get_json(silent=True) or {}

        user_prompt = str(data.get("prompt", "")).strip()
        history = data.get("history", [])
        mode = data.get("mode", "friendly")

        if not user_prompt:
            return jsonify({
                "response": "Please enter a message."
            }), 400

        print(f"User prompt: {user_prompt[:100]}")

        prompt = build_prompt(
            user_prompt=user_prompt,
            history=history,
            mode=mode
        )

        # ----------------------------------------------------
        # STEP 1: Try Gemini
        # ----------------------------------------------------

        gemini_response = ask_gemini(prompt)

        if gemini_response:
            return jsonify({
                "response": gemini_response,
                "provider": "gemini"
            }), 200

        # ----------------------------------------------------
        # STEP 2: Gemini failed → Ollama fallback
        # ----------------------------------------------------

        print("[Fallback] Gemini unavailable. Trying Ollama...")

        ollama_response = ask_ollama(prompt)

        if ollama_response:
            return jsonify({
                "response": ollama_response,
                "provider": "ollama"
            }), 200

        # ----------------------------------------------------
        # Both failed
        # ----------------------------------------------------

        return jsonify({
            "response": (
                "I'm unable to respond right now. "
                "Please make sure Ollama is running and try again."
            )
        }), 503

    except Exception as e:

        print(f"[ERROR] /chat failed: {e}")

        return jsonify({
            "response": "Something went wrong. Please try again."
        }), 500


# ============================================================
# Health check
# ============================================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "online",
        "service": "FinBot Backend",
        "gemini_model": GEMINI_MODEL,
        "ollama_model": OLLAMA_MODEL
    })


# ============================================================
# Start Flask
# ============================================================

if __name__ == "__main__":

    port = int(os.environ.get("PORT", 5000))

    print()
    print("======================================")
    print("        FinBot Backend Starting")
    print("======================================")
    print(f"Gemini: {GEMINI_MODEL}")
    print(f"Ollama: {OLLAMA_MODEL}")
    print("Fallback: Gemini → Ollama")
    print(f"Port: {port}")
    print("======================================")
    print()

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )