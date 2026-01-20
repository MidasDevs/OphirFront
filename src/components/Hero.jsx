// src/components/Hero.jsx
import React from 'react';

function Hero({ onConnect }) {
  return (
    <section className="hero">
      <h1 className="hero-title">Unlocking abundance to fuel generosity</h1>
      <p className="hero-subtitle">Community frontend fix for OPHIR staking – not official</p>
      <button className="connect-btn" onClick={onConnect}>Connect Wallet to Begin</button>
    </section>
  );
}

export default Hero;