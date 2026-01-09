# FinBot - Financial Assistant Chatbot

A smart financial assistant chatbot created by Anchal Gupta. FinBot helps users with personal finance, budgeting, savings, investments, loans, and taxes.

## 🚀 Features

- 💬 **Intelligent Chat Interface** - Ask questions about personal finance
- 🧠 **Conversation Memory** - Remembers previous messages and context
- 🎨 **Modern UI** - Beautiful React frontend with dark/light mode
- 🔄 **Auto Retry Logic** - Handles errors and rate limits gracefully
- 🆓 **Free Option Available** - Use Ollama for unlimited free requests

## 📋 Prerequisites

- **Python 3.9+** (Python 3.10+ recommended)
- **Node.js 16+** and npm
- **Google Gemini API Key** (for Gemini backend) OR **Ollama** (for free backend)

## 🛠️ Installation

### 1. Clone/Navigate to Project

**macOS/Linux:**
```bash
cd "/Users/ajaykumar/Downloads/Anchal Project/finbot-project"
```

**Windows:**
```cmd
cd "C:\Users\YourName\Downloads\Anchal Project\finbot-project"
```

### 2. Backend Setup

#### Option A: Using Gemini API (Has Rate Limits)

**macOS/Linux:**
```bash
cd finbot-backend

# Create virtual environment
python3 -m venv venv_mac
source venv_mac/bin/activate

# Install dependencies
pip install flask flask-cors google-generativeai requests

# Set your API key
export GEMINI_API_KEY="YOUR_API_KEY_HERE"
```

**Windows:**
```cmd
cd finbot-backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install flask flask-cors google-generativeai requests

# Set your API key (PowerShell)
$env:GEMINI_API_KEY="YOUR_API_KEY_HERE"

# OR (Command Prompt)
set GEMINI_API_KEY=YOUR_API_KEY_HERE
```

#### Option B: Using Ollama (FREE, No Rate Limits) ⭐ Recommended

**macOS/Linux:**
```bash
# Install Ollama from https://ollama.ai
# OR use Homebrew:
brew install ollama

# Start Ollama (keep this running)
ollama serve

# In a new terminal, download a model
ollama pull llama3.2

# Install Python dependencies
cd finbot-backend
python3 -m venv venv_mac
source venv_mac/bin/activate
pip install flask flask-cors requests
```

**Windows:**
```cmd
# Install Ollama from https://ollama.ai (download .exe installer)

# Start Ollama (keep this running in a terminal)
ollama serve

# In a new terminal, download a model
ollama pull llama3.2

# Install Python dependencies
cd finbot-backend
python -m venv venv
venv\Scripts\activate
pip install flask flask-cors requests
```

### 3. Frontend Setup

```bash
cd finbot-frontend

# Install dependencies
npm install

# Fix permissions (macOS)
chmod +x node_modules/.bin/*
```

## 🏃 Running the Project

### Method 1: Run Both Together (Recommended)

**macOS/Linux:**
```bash
cd finbot-frontend
npm run dev              # Uses Gemini by default
# OR
npm run dev:ollama       # Uses Ollama
```

**Windows:**
```cmd
cd finbot-frontend
npm run dev              # Uses Gemini by default
# OR
npm run dev:ollama       # Uses Ollama
```

This automatically starts both frontend and backend.

### Method 2: Run Separately

**Terminal 1 - Backend:**

**macOS/Linux:**
```bash
cd finbot-backend
source venv_mac/bin/activate

# For Gemini:
export GEMINI_API_KEY="YOUR_API_KEY_HERE"
python app.py

# OR for Ollama (free):
python app_ollama.py
```

**Windows:**
```cmd
cd finbot-backend
venv\Scripts\activate

# For Gemini (PowerShell):
$env:GEMINI_API_KEY="YOUR_API_KEY_HERE"
python app.py

# OR (Command Prompt):
set GEMINI_API_KEY=YOUR_API_KEY_HERE
python app.py

# OR for Ollama (free):
python app_ollama.py
```

**Terminal 2 - Frontend:**

```bash
cd finbot-frontend
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://127.0.0.1:5000

## 📁 Project Structure

```
finbot-project/
├── finbot-backend/
│   ├── app.py              # Gemini API backend
│   ├── app_ollama.py       # Ollama (free) backend
│   ├── venv/               # Python virtual environment (Windows)
│   ├── venv_mac/           # Python virtual environment (macOS/Linux)
│   └── logs/               # Backend logs
├── finbot-frontend/
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   └── index.css       # Styles
│   ├── scripts/
│   │   └── run-backend.js  # Cross-platform backend runner
│   ├── package.json
│   └── vite.config.js      # Vite configuration
└── README.md
```

## 🔧 Configuration

### Backend Options

**Gemini Backend (`app.py`):**
- Requires `GEMINI_API_KEY` environment variable
- Free tier: 2 requests/minute
- Paid tier: Higher limits

**Ollama Backend (`app_ollama.py`):**
- No API key needed
- Unlimited requests
- Runs locally
- Default model: `llama3.2`

### Change Ollama Model

Edit `app_ollama.py`:
```python
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")  # Change this
```

Available models:
- `llama3.2` (2GB) - Fast, recommended
- `llama3.1` (4GB) - Better quality
- `mistral` (4GB) - Good alternative

## 🐛 Troubleshooting

### Backend Issues

**"Ollama is not available"**
- Make sure `ollama serve` is running
- Check: `curl http://localhost:11434/api/tags`
- Ensure you've pulled a model: `ollama pull llama3.2`

**"Rate limit exceeded" (Gemini)**
- Wait 1-2 minutes between requests
- Check your quota: https://makersuite.google.com/app/apikey
- Consider switching to Ollama backend

**"Permission denied" (macOS/Linux)**
```bash
chmod +x node_modules/.bin/*
```

**Windows-specific Issues:**

**"python is not recognized"**
- Make sure Python is installed and added to PATH
- Use `py` instead of `python` if needed: `py -m venv venv`

**"npm is not recognized"**
- Install Node.js from https://nodejs.org
- Restart terminal after installation

**Virtual environment activation fails**
- Use: `venv\Scripts\activate` (not `venv\Scripts\activate.bat`)
- If PowerShell blocks scripts, run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Frontend Issues

**"Cannot connect to backend"**
- Ensure backend is running on port 5000
- Check CORS settings
- Verify proxy configuration in `vite.config.js`

**"Module not found"**
```bash
cd finbot-frontend
rm -rf node_modules package-lock.json
npm install
```

## 📝 API Endpoints

### POST `/chat`
Send a chat message to FinBot.

**Request:**
```json
{
  "prompt": "How do I save money?",
  "history": [
    {"sender": "user", "text": "Hello"},
    {"sender": "bot", "text": "Hi! How can I help?"}
  ]
}
```

**Response:**
```json
{
  "response": "Here are some tips to save money..."
}
```

### GET `/`
Check backend status.

## 🎯 Features Explained

### Conversation Memory
- FinBot remembers the last 10 messages
- Can reference previous questions and answers
- Maintains context throughout the conversation

### Auto Retry
- Automatically retries failed requests
- Exponential backoff for rate limits
- Falls back to alternative models when needed

### Error Handling
- User-friendly error messages
- Automatic fallback mechanisms
- Detailed logging for debugging

## 📚 Additional Resources

- **Ollama Setup**: See `QUICK_START_OLLAMA.txt` in `finbot-backend/`
- **Gemini API**: https://makersuite.google.com/app/apikey
- **Ollama Models**: https://ollama.ai/library

## 🤝 Support

If you encounter issues:
1. Check the logs in `finbot-backend/logs/`
2. Verify all prerequisites are installed
3. Ensure ports 5000 and 5173 are available
4. Check environment variables are set correctly

## 📄 License

This project was created by Anchal Gupta for educational purposes.

---

**Happy FinBotting! 💰**

