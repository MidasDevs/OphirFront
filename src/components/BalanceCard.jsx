// src/components/BalanceCard.jsx
import React from 'react';

const formatNum = (num) => {
  const n = Number(num);
  return n.toLocaleString('en-US', { maximumFractionDigits: 8 });
};

function BalanceCard({ balance }) {
  return (
    <section className="balance-section">
      <div className="balance-card">
        <h2>Your OPHIR Balance</h2>
        <div className="balance-value">{formatNum(balance)} OPHIR</div>
      </div>
    </section>
  );
}

export default BalanceCard;