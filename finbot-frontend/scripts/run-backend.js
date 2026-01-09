const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const isWindows = os.platform() === 'win32';
const backendType = process.argv[2] || 'gemini'; // 'gemini' or 'ollama'

const backendDir = path.resolve(__dirname, '..','..', 'finbot-backend');
console.log("Resolved backendDir:", backendDir);
const venvName = isWindows ? 'venv' : 'venv_mac';
const pythonPath = isWindows 
  ? path.join(backendDir, venvName, 'Scripts', 'python.exe')
  : path.join(backendDir, venvName, 'bin', 'python');

const appFile = backendType === 'ollama' ? 'app_ollama.py' : 'app.py';
const scriptPath = path.join(backendDir, appFile);

// Check if virtual environment exists
const venvExists = fs.existsSync(path.dirname(pythonPath));
if (!venvExists) {
  console.error(`\n❌ Virtual environment not found: ${venvName}`);
  console.error(`\nPlease create it first:`);
  if (isWindows) {
    console.error(`  cd finbot-backend`);
    console.error(`  python -m venv venv`);
    console.error(`  venv\\Scripts\\activate`);
    console.error(`  pip install flask flask-cors google-generativeai requests`);
  } else {
    console.error(`  cd finbot-backend`);
    console.error(`  python3 -m venv venv_mac`);
    console.error(`  source venv_mac/bin/activate`);
    console.error(`  pip install flask flask-cors google-generativeai requests`);
  }
  process.exit(1);
}

// Check if script exists
if (!fs.existsSync(scriptPath)) {
  console.error(`\n❌ Backend script not found: ${appFile}`);
  process.exit(1);
}

console.log(`\n🚀 Starting ${backendType} backend...`);
console.log(`📁 Backend directory: ${backendDir}`);
console.log(`🐍 Python: ${pythonPath}`);
console.log(`📄 Script: ${appFile}\n`);

const pythonProcess = spawn(
  pythonPath,
  [scriptPath],
  {
    cwd: backendDir,
    stdio: 'inherit',
    shell: isWindows
  }
);

pythonProcess.on('error', (error) => {
  console.error(`\n❌ Failed to start backend: ${error.message}`);
  console.error(`\n💡 Make sure:`);
  console.error(`   1. Virtual environment is created: ${venvName}`);
  console.error(`   2. Dependencies are installed`);
  if (backendType === 'ollama') {
    console.error(`   3. Ollama is running: ollama serve`);
  } else {
    console.error(`   3. API key is set: GEMINI_API_KEY`);
  }
  process.exit(1);
});

pythonProcess.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`\n⚠️  Backend exited with code ${code}`);
  }
});

