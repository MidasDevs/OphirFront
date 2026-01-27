// src/components/Header.jsx
import React from 'react';

function Header() {
  return (
    <header className="header">
      <div className="logo">
        <span className="logo-star">✦</span> Ophir – Mining Hearts of Gold
      </div>
      <p className="tagline">Unlocking abundance to fuel generosity</p>
      <p className="credit">
        Community frontend by{' '}
        <a href="https://linktr.ee/EmpowerDev" target="_blank" rel="noopener">
          EmpowerDev
        </a>
      </p>
    </header>
  );
}

export default Header;