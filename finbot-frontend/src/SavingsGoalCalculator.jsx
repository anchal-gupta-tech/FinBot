import React, { useState, useEffect } from "react";
import './index.css';

const PiggyBankIcon = () => (
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
    className="piggy-bank-icon"
  >
    <path d="M20 13v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="12" r="8" />
    <path d="M12 12h.01" />
  </svg>
);

const SavingsGoalCalculator = () => {
  // Load saved values from LocalStorage if available
  const [goalAmount, setGoalAmount] = useState(() => {
    const saved = localStorage.getItem("sg_goalAmount");
    return saved ? JSON.parse(saved) : "";
  });
  const [monthlySaving, setMonthlySaving] = useState(() => {
    const saved = localStorage.getItem("sg_monthlySaving");
    return saved ? JSON.parse(saved) : "";
  });
  const [interestRate, setInterestRate] = useState(() => {
    const saved = localStorage.getItem("sg_interestRate");
    return saved ? JSON.parse(saved) : "";
  });
  const [result, setResult] = useState(() => {
    const saved = localStorage.getItem("sg_result");
    return saved ? JSON.parse(saved) : null;
  });

  // Save to LocalStorage whenever values change
  useEffect(() => {
    localStorage.setItem("sg_goalAmount", JSON.stringify(goalAmount));
  }, [goalAmount]);

  useEffect(() => {
    localStorage.setItem("sg_monthlySaving", JSON.stringify(monthlySaving));
  }, [monthlySaving]);

  useEffect(() => {
    localStorage.setItem("sg_interestRate", JSON.stringify(interestRate));
  }, [interestRate]);

  useEffect(() => {
    localStorage.setItem("sg_result", JSON.stringify(result));
  }, [result]);

  const calculateSavings = () => {
    const P = parseFloat(monthlySaving);
    const r = parseFloat(interestRate) / 100 / 12;
    const n = parseFloat(goalAmount);

    if (!P || !r || !n) {
      alert("Please enter valid numbers");
      return;
    }

    const months = Math.log((n * r / P) + 1) / Math.log(1 + r);
    const years = months / 12;

    const res = `You will reach your goal in approximately ${years.toFixed(1)} years (${Math.ceil(months)} months).`;
    setResult(res);
  };

  return (
    <div className="page-container">
      <div className="tool-card calculator-card">
        <h2><PiggyBankIcon /> Savings Goal Calculator</h2>

        <div className="form-group">
          <label>Goal Amount (₹):</label>
          <input
            type="number"
            value={goalAmount}
            onChange={(e) => setGoalAmount(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Monthly Saving (₹):</label>
          <input
            type="number"
            value={monthlySaving}
            onChange={(e) => setMonthlySaving(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Expected Annual Interest Rate (%):</label>
          <input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
          />
        </div>

        <button onClick={calculateSavings} className="btn-signup">Calculate</button>

        {result && <div className="result mt-4">{result}</div>}
      </div>
    </div>
  );
};

export default SavingsGoalCalculator;
