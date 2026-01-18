// src/components/BalanceCard.jsx
import React from 'react';

const formatNum = (num) => Number(num).toLocaleString('en-US', {maximumFractionDigits: 2});

function BalanceCard({ balance }) {
  return (
    <section className="balance-section">
      <div className="balance-card">
        <h2>Your OPHIR Balance</h2>
        <div className="balance-value">{balance} OPHIR</div>
      </div>
    </section>
  );
}

export default BalanceCard;