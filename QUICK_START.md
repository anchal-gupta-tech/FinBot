# 🚀 Quick Start Guide

## Fastest Way to Run (Ollama - FREE)

### Step 1: Install Ollama
```bash
# Visit https://ollama.ai and download for macOS
# OR
brew install ollama
```

### Step 2: Start Ollama & Download Model
```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Download model (takes 2-5 minutes)
ollama pull llama3.2
```

### Step 3: Run the Project
```bash
# Navigate to project
cd "/Users/ajaykumar/Downloads/Anchal Project/finbot-project/finbot-frontend"

# Start everything (backend + frontend)
npm run dev
```

### Step 4: Open Browser
Go to: **http://localhost:5173**

That's it! 🎉

---

## Alternative: Using Gemini API

### Step 1: Get API Key
1. Visit: https://makersuite.google.com/app/apikey
2. Create/get your API key

### Step 2: Set Environment Variable
```bash
export GEMINI_API_KEY="YOUR_API_KEY_HERE"
```

### Step 3: Run Backend
```bash
cd finbot-backend
source venv_mac/bin/activate
python app.py
```

### Step 4: Run Frontend (New Terminal)
```bash
cd finbot-frontend
npm run dev
```

### Step 5: Open Browser
Go to: **http://localhost:5173**

---

## Troubleshooting

**"Ollama not available"**
- Make sure `ollama serve` is running
- Run: `ollama pull llama3.2`

**"Rate limit" (Gemini)**
- Wait 1-2 minutes
- Or switch to Ollama (free, unlimited)

**"Permission denied"**
```bash
chmod +x node_modules/.bin/*
```

---

For detailed instructions, see [README.md](README.md)

