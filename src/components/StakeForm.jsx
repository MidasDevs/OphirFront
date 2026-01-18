// src/components/StakeForm.jsx
import React, { useState } from 'react';

function StakeForm({ onStake }) {
  const [amount, setAmount] = useState('');
  const [days, setDays] = useState('');

  const handleStake = () => {
    if (amount && days) {
      onStake(amount, days);
      setAmount('');
      setDays('');
    }
  };

  return (
    <section className="stake-section">
      <h2>Start a New Stake</h2>
      <div className="stake-form">
        <input
          type="number"
          placeholder="Amount (OPHIR)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="stake-input"
        />
        <input
          type="number"
          placeholder="Days (1-8357)"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="stake-input"
        />
        <button className="stake-btn" onClick={handleStake}>
          Stake OPHIR
        </button>
      </div>
    </section>
  );
}

export default StakeForm;