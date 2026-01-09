import React, { useState, useEffect, useRef } from 'react';
// We import the CSS file here!
import './index.css'; 
import SavingsGoalCalculator from "./SavingsGoalCalculator";
//import { CurrencyIcon, CalculatorIcon, BarChartIcon, LandmarkIcon } from "./Icons";

import BudgetAnalyzer from './BudgetAnalyzer.jsx'; // Import at the top
//import SendIcon from "./SendIcon";
import { exportChatToPDF } from "./exportPdf.jsx";   // <-- Add this at top

// --- SVG Icons ---
// (These are unchanged)
const BotIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17.5 3c-1.5 0-2.75 1.06-4 1.06C8.5 4.06 2 12.22 2 16.34a4.91 4.91 0 0 0 4.5 4.68A4.91 4.91 0 0 0 8 20.94Z" />
    <path d="M16 8h2" />
    <path d="M6 8h2" />
    <path d="M12 8v2" />
    <path d="M12 16v2" />
    <path d="M12 12v2" />
  </svg>
);

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="m22 2-11 11" />
  </svg>
);

const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const CalculatorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <line x1="8" x2="16" y1="6" y2="6" />
    <line x1="16" x2="16" y1="14" y2="18" />
    <path d="M16 10h.01" />
    <path d="M12 10h.01" />
    <path d="M8 10h.01" />
    <path d="M12 14h.01" />
    <path d="M8 14h.01" />
    <path d="M12 18h.01" />
    <path d="M8 18h.01" />
  </svg>
);

const BarChartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" x2="12" y1="20" y2="10" />
    <line x1="18" x2="18" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="16" />
  </svg>
);

const LandmarkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" x2="21" y1="22" y2="22" />
    <line x1="6" x2="6" y1="18" y2="11" />
    <line x1="10" x2="10" y1="18" y2="11" />
    <line x1="14" x2="14" y1="18" y2="11" />
    <line x1="18" x2="18" y1="18" y2="11" />
    <polygon points="12 2 20 7 4 7" />
  </svg>
);

const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m4.93 19.07 1.41-1.41" />
    <path d="m17.66 6.34 1.41-1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const CurrencyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="8" />
    <line x1="3" x2="6" y1="3" y2="6" />
    <line x1="21" x2="18" y1="3" y2="6" />
    <line x1="3" x2="6" y1="21" y2="18" />
    <line x1="21" x2="18" y1="21" y2="18" />
  </svg>
);

// --- Navbar Component ---
const Navbar = ({ page, setPage }) => {
  const [isOpen, setIsOpen] = useState(false);

  const NavLink = ({ name, pageName }) => (
    <button
      onClick={() => {
        setPage(pageName);
        setIsOpen(false);
      }}
      className={`nav-link ${page === pageName ? 'active' : ''}`}
    >
      {name}
    </button>
  );

  return (
    <nav id="navbar">
      <div className="navbar-content">
        <div className="flex items-center">
          <button onClick={() => setPage('home')} className="navbar-logo">
            <span>
              <BotIcon />
            </span>
            FinBot
          </button>
        </div>
        <div className="navbar-links">
          <NavLink name="Home" pageName="home" />
          <NavLink name="Tools" pageName="tools" />
          <NavLink name="About" pageName="about" />
          <NavLink name="Settings" pageName="settings" />
          <div className="navbar-auth">
            <NavLink name="Sign In" pageName="signin" />
            <button
              onClick={() => setPage('signup')}
              className="btn-signup"
            >
              Sign Up
            </button>
          </div>
        </div>
        <div className="navbar-mobile-toggle">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="nav-link"
          >
            {isOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {isOpen && (
        <div className="navbar-mobile-menu">
          <NavLink name="Home" pageName="home" />
          <NavLink name="Tools" pageName="tools" />
          <NavLink name="About" pageName="about" />
          <NavLink name="Settings" pageName="settings" />
          <NavLink name="Sign In" pageName="signin" />
          <button
            onClick={() => {
              setPage('signup');
              setIsOpen(false);
            }}
            className="btn-signup"
          >
            Sign Up
          </button>
        </div>
      )}
    </nav>
  );
};

// --- Footer Component ---
const Footer = () => {
  return (
    <footer>
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} FinBot. All rights reserved.</p>
        <p>
          Disclaimer: FinBot provides automated financial suggestions. Not financial advice.
        </p>
      </div>
    </footer>
  );
};

// --- Page Components ---
// 1. Home Page (Chat Interface)

const HomePage = () => {
  const [activeChat, setActiveChat] = useState("main");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // TTS state & reference
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const speechRef = useRef(null);

  // --- MESSAGE STATES ---
  const [mainMessages, setMainMessages] = useState(() => {
    const saved = localStorage.getItem("mainChatHistory");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            sender: "bot",
            text: "Hello! I am FinBot. How can I help you today?",
            time: getCurrentTime(),
          },
        ];
  });

  const [newMessages, setNewMessages] = useState(() => {
    const saved = localStorage.getItem("newChatHistory");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            sender: "bot",
            text: "Welcome to Investment Tips Chat!",
            time: getCurrentTime(),
          },
        ];
  });

  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  // --- TIME FORMAT ---
  function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [mainMessages, newMessages]);

  // Save chats
  useEffect(() => {
    localStorage.setItem("mainChatHistory", JSON.stringify(mainMessages));
  }, [mainMessages]);

  useEffect(() => {
    localStorage.setItem("newChatHistory", JSON.stringify(newMessages));
  }, [newMessages]);

  // --- TTS FUNCTION ---
  const speakText = (text) => {
    if (!ttsEnabled || !text) return;

    // Stop any previous TTS
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    utter.lang = "en-US";

    speechRef.current = utter;
    window.speechSynthesis.speak(utter);
  };

  // --- SEND MESSAGE ---
  const handleSend = async (msgInput = input) => {
    if (msgInput.trim() === "" || isLoading) return;

    const isMain = activeChat === "main";
    const messages = isMain ? mainMessages : newMessages;
    const setMessages = isMain ? setMainMessages : setNewMessages;

    if (abortControllerRef.current) abortControllerRef.current.abort();

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: msgInput,
      time: getCurrentTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Temporary "Thinking..."
    const loadID = `load-${Date.now()}`;
    setMessages((prev) => [...prev, { id: loadID, sender: "bot", text: "Thinking...", time: getCurrentTime() }]);

    abortControllerRef.current = new AbortController();
    const controller = abortControllerRef.current;
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const cleanHistory = messages
        .filter((m) => !m.id.toString().startsWith("load-"))
        .map((m) => ({ sender: m.sender, text: m.text }));

      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: msgInput,
          history: cleanHistory,
          mode: localStorage.getItem("finbot_mode") || "friendly",
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      setMessages((prev) => prev.filter((m) => m.id !== loadID));

      const data = await res.json();

      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: data.response || "No response received",
        time: getCurrentTime(),
      };

      setMessages((prev) => [...prev, botMessage]);

      // TTS
      speakText(botMessage.text);

    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== loadID));

      if (err.name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 2,
            sender: "bot",
            text: "Sorry, something went wrong. Please try again.",
            time: getCurrentTime(),
          },
        ]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // --- VOICE INPUT ---
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Your browser does not support Voice Input");

    const recog = new SpeechRecognition();
    recog.lang = "en-US";

    recog.start();

    recog.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setInput(text);
      handleSend(text);
    };
  };

  // --- START FRESH ---
  const handleNewChat = () => {
    if (activeChat === "main") {
      setMainMessages([
        { id: 1, sender: "bot", text: "Hello! I am FinBot. How can I help you today?", time: getCurrentTime() },
      ]);
      localStorage.removeItem("mainChatHistory");
    } else {
      setNewMessages([
        { id: 1, sender: "bot", text: "Welcome to Investment Tips Chat!", time: getCurrentTime() },
      ]);
      localStorage.removeItem("newChatHistory");
    }
  };

  // --- EXPORT CHAT PDF ---
  const handleExportPDF = () => {
    const messagesToExport = activeChat === "main" ? mainMessages : newMessages;
    exportChatToPDF(messagesToExport, activeChat === "main" ? "FinBot_Chat" : "New_Chat");
  };

  return (
    <div className="chat-page">

      {/* TABS */}
      <div className="chat-tabs">
        <button className={activeChat === "main" ? "active-tab" : ""} onClick={() => setActiveChat("main")}>
          FinBot Chat
        </button>
        <button className={activeChat === "new" ? "active-tab" : ""} onClick={() => setActiveChat("new")}>
          New Chat
        </button>
      </div>

      {/* MESSAGES */}
      <div className="chat-area">
        {(activeChat === "main" ? mainMessages : newMessages).map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.sender}`}>
            <div className="chat-message-avatar">{msg.sender === "user" ? "U" : "F"}</div>
            <div className="chat-message-bubble">
              {msg.text}
              <span className="chat-message-time">{msg.time}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT SECTION */}
      <div className="chat-input-area">
        <form
          className="chat-input-form relative"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            type="text"
            value={input}
            disabled={isLoading}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLoading ? "FinBot is thinking..." : "Ask something..."}
          />

          <button type="button" className="chat-input-mic-btn" onClick={handleVoiceInput}>
            🎤
          </button>

          <button
            type="button"
            className="chat-input-tts-btn"
            onClick={() => {
              window.speechSynthesis.cancel();
              setTtsEnabled(!ttsEnabled);
            }}
          >
            {ttsEnabled ? "Voice ON" : "Voice OFF"}
          </button>

          <button type="submit" className="chat-input-send-btn" disabled={isLoading || input.trim() === ""}>
            <SendIcon />
          </button>

          {/* Bottom Buttons */}
          <div className="bottom-action-buttons">
            <button type="button" className="start-fresh-btn" onClick={handleNewChat}>
              Start Fresh
            </button>

            <button type="button" className="export-chat-btn" onClick={handleExportPDF}>
              Export Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};



// 2. Tools Page
const ToolsPage = () => {
  const tools = [
    {
      name: 'Currency Converter',
      desc: 'Check the latest foreign exchange rates.',
      link: 'https://www.xe.com/', // Example link
      icon: <CurrencyIcon />,
    },
    {
      name: 'Compound Interest',
      desc: 'Calculate the future value of your investments.',
      link: 'https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator', // Example link
      icon: <CalculatorIcon />,
    },
    {
      name: 'Simple Interest',
      desc: 'Calculate simple interest on your loans or savings.',
      link: 'https://www.calculator.net/simple-interest-calculator.html', // Example link
      icon: <CalculatorIcon />,
    },
    {
      name: 'Mutual Funds',
      desc: 'Explore and compare mutual fund performance.',
      link: 'https://www.moneycontrol.com/mutual-funds/', // Example link
      icon: <BarChartIcon />,
    },
    {
      name: 'Fixed Deposit (FD)',
      desc: 'Find the best FD rates from various banks.',
      link: 'https://www.bankbazaar.com/fixed-deposit.html', // Example link
      icon: <LandmarkIcon />,
    },
    {
      name: 'Recurring Deposit (RD)',
      desc: 'Plan your savings with recurring deposits.',
      link: 'https://www.bankbazaar.com/recurring-deposit.html', // Example link
      icon: <LandmarkIcon />
    },
  ];

  return (
    <div className="page-container">
      <h1 className="page-title">
        Financial Tools
      </h1>
      <p className="page-subtitle">
        Here are some useful links to help you manage your finances. These are
        external websites and FinBot is not responsible for their content.
      </p>
      <div className="tools-grid">
        {tools.map((tool) => (
          <a
            key={tool.name}
            href={tool.link}
            target="_blank"
            rel="noopener noreferrer"
            className="tool-card"
          >
            <div className="tool-card-header">
              <span>{tool.icon}</span>
              <h2>
                {tool.name}
              </h2>
            </div>
            <p>{tool.desc}</p>
          </a>
        ))}
      </div>
      {/* Add Savings Goal Calculator here */}
      <div className="mt-8">
        <SavingsGoalCalculator />
        <div className="mt-8">
          <BudgetAnalyzer />
        </div>
      </div>
    </div>
  );
};
// 3. About Page
const AboutPage = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">
        About FinBot
      </h1>
      <div className="about-content">
        <p>
          FinBot is an intelligent, AI-powered chatbot designed to provide
          personalized financial guidance. My goal is to make managing personal
          finances accessible, understandable, and less challenging for everyone.
        </p>
        <p>
          Whether you have questions about budgeting, investments, savings
          strategies, or debt management, I'm here to help you understand your
          finances and make better decisions.
        </p>
        <p>
          This project utilizes advanced Natural Language Processing (NLP) to
          understand your questions and provide accurate, relevant information in
          real-time.
        </p>
        <h2>
          Our Mission
        </h2>
        <p>
          To empower individuals to achieve financial literacy and stability by
          providing an intelligent, accessible, and cost-effective financial
          guidance solution.
        </p>
        <h2>
          Disclaimer
        </h2>
        <p>
          FinBot is an automated service and its suggestions do not constitute
          official financial advice. All financial decisions should be made
          in consultation with a qualified human financial advisor.
        </p>
      </div>
    </div>
  );
};

// 4. Settings Page
const SettingsPage = ({ theme, toggleTheme }) => {
  // --- NEW: Personality Mode state ---
  const [mode, setMode] = useState(localStorage.getItem("finbot_mode") || "friendly");

  // Save selected mode to localStorage
  useEffect(() => {
    localStorage.setItem("finbot_mode", mode);
  }, [mode]);

  // Optional: Save theme to localStorage (in addition to App.js)
  const [localTheme, setLocalTheme] = useState(theme);

  useEffect(() => {
    localStorage.setItem("theme", localTheme);
  }, [localTheme]);

  const handleToggleTheme = () => {
    toggleTheme();
    setLocalTheme(localTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="page-container">
      <h1 className="page-title">
        Settings
      </h1>
      <div className="settings-card">
        <div className="settings-row">
          <div>
              <h2>Personality Mode</h2>
              <p>Choose the bot's tone.</p>
          </div>
          <select value={mode} onChange={e => setMode(e.target.value)}>
            <option value="friendly">Friendly</option>
            <option value="professional">Professional</option>
            <option value="beginner">Beginner</option>
            <option value="strict">Strict</option>
          </select>
        </div>
        <div className="settings-row">
          <div>
            <h2>Appearance</h2>
            <p>Toggle between light and dark mode.</p>
          </div>
          <button
            onClick={handleToggleTheme}
            className="theme-toggle"
            title={localTheme === 'dark' ? 'Activate light mode' : 'Activate dark mode'}
          >
            <span className="theme-toggle-icon sun">
              <SunIcon width={16} height={16} />
            </span>
            <span className="theme-toggle-switch" />
            <span className="theme-toggle-icon moon">
              <MoonIcon width={16} height={16} />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

// 5. Sign In Page
const SignInPage = () => {
  return (
    <div className="form-container-wrapper">
      <div className="form-container">
        <h1>
          Sign In
        </h1>
        <form className="space-y-6">
          <div className="form-group">
            <label htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            onClick={(e) => e.preventDefault()}
            className="form-submit-btn"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

// 6. Sign Up Page
const SignUpPage = () => {
  return (
    <div className="form-container-wrapper">
      <div className="form-container">
        <h1>
          Create Account
        </h1>
        <form>
          <div className="form-group">
            <label htmlFor="name">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Anchal Gupta"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            onClick={(e) => e.preventDefault()}
            className="form-submit-btn"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [page, setPage] = useState('home');
  const [theme, setTheme] = useState('light');

  // This effect hook sets the theme on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }, []);

  // This effect hook updates the <html> tag and localStorage
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage />;
      case 'tools':
        return <ToolsPage />;
      case 'about':
        return <AboutPage />;
      case 'settings':
        return <SettingsPage theme={theme} toggleTheme={toggleTheme} />;
      case 'signin':
        return <SignInPage />;
      case 'signup':
        return <SignUpPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="app-container">
      <Navbar page={page} setPage={setPage} />
      <main>{renderPage()}</main>
      {/* Footer is hidden on chat page for better layout */}
      {page === 'home' ? null : <Footer />} 
    </div>
  );
}