import React, { useState } from "react";
import './index.css'; // Use your main CSS

// Icon for Budget Analyzer
const BudgetIcon = () => (
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
    className="budget-icon"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

const BudgetAnalyzer = () => {
  // Load from LocalStorage if available
  const [income, setIncome] = useState(() => {
    const saved = localStorage.getItem("budget_income");
    return saved ? JSON.parse(saved) : "";
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem("budget_expenses");
    return saved ? JSON.parse(saved) : [{ name: "", amount: "" }];
  });

  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem("budget_balance");
    return saved ? JSON.parse(saved) : null;
  });

  // Save to LocalStorage whenever values change
  const updateLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const handleExpenseChange = (index, field, value) => {
    const updatedExpenses = [...expenses];
    updatedExpenses[index][field] = value;
    setExpenses(updatedExpenses);
    updateLocalStorage("budget_expenses", updatedExpenses);
  };

  const addExpense = () => {
    const updatedExpenses = [...expenses, { name: "", amount: "" }];
    setExpenses(updatedExpenses);
    updateLocalStorage("budget_expenses", updatedExpenses);
  };

  const calculateBudget = () => {
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const netBalance = parseFloat(income || 0) - totalExpenses;
    setBalance(netBalance);
    updateLocalStorage("budget_balance", netBalance);
  };

  const deleteExpense = (index) => {
  const updatedExpenses = expenses.filter((_, i) => i !== index);
  setExpenses(updatedExpenses);
  updateLocalStorage("budget_expenses", updatedExpenses);
};

const handleIncomeChange = (value) => {
    setIncome(value);
    updateLocalStorage("budget_income", value);
  };


  return (
    <div className="page-container">
      <div className="tool-card calculator-card">
        <h2><BudgetIcon /> Budget Analyzer</h2>

        <div className="form-group">
          <label>Total Income (₹):</label>
          <input
            type="number"
            value={income}
            onChange={(e) => handleIncomeChange(e.target.value)}
          />
        </div>

        <h3>Expenses:</h3>
        {expenses.map((expense, index) => (
          <div key={index} className="form-group expense-group">
            <input
              type="text"
              placeholder="Expense Name"
              value={expense.name}
              onChange={(e) => handleExpenseChange(index, "name", e.target.value)}
            />
            <input
              type="number"
              placeholder="Amount (₹)"
              value={expense.amount}
              onChange={(e) => handleExpenseChange(index, "amount", e.target.value)}
            />
             <button
                type="button"
                className="btn-delete"
                onClick={() => deleteExpense(index)}
            >
                Delete
            </button>
          </div>
        ))}

        <div className="budget-buttons" >
            <button className="btn-add" onClick={addExpense}>Add Expense</button>
            <button className="btn-calc" onClick={calculateBudget}>Calculate</button>
        </div>

        {balance !== null && (
          <div className="result mt-4" style={{ marginTop: '16px' }}>
            Your remaining balance: <strong>₹{balance}</strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetAnalyzer;
