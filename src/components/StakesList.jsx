// src/components/StakesList.jsx (scraped + mature status)
import React from 'react';

const formatNum = (num) => Number(num).toLocaleString('en-US', {maximumFractionDigits: 2});

function StakesList({ stakes, currentDay, onEnd, onScrape }) {
  if (stakes.length === 0) return <section className="stakes-section"><h2>Your Active Stakes</h2><p>No active stakes</p></section>;

  return (
    <section className="stakes-section">
      <h2>Your Active Stakes</h2>
      <div className="stakes-grid">
        {stakes.map((s, idx) => (
          <div key={idx} className="stake-card">
            <div className="stake-details">
              <div><strong>ID:</strong> {s.id}</div>
              <div><strong>Amount:</strong> {s.amount} OPHIR</div>
              <div><strong>Days:</strong> {s.days}</div>
              <div><strong>Start:</strong> Day {s.startDay}</div>
              <div><strong>End:</strong> Day {s.unlockedDay}</div>
              <div><strong>Scraped Yield:</strong> {s.scraped} OPHIR</div>
              <div><strong>Status:</strong> {currentDay >= s.unlockedDay ? 'Mature (full payout)' : 'Active'}</div>
            </div>
            <button className="end-btn" onClick={() => onEnd(idx, s.id)}>End Stake</button>
            {currentDay > s.startDay && <button className="scrape-btn" onClick={() => onScrape(idx, s.id)}>Scrape Yield (Early + Charity)</button>}
          </div>
        ))}
      </div>
    </section>
  );
}

export default StakesList;