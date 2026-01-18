function StakesList({ stakes, currentDay, onEnd, onScrape }) {
  if (stakes.length === 0) return <section className="stakes-section"><h2>Your Active Stakes</h2><p className="no-stakes">No active stakes found.</p></section>;

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
              <div><strong>Start Day:</strong> {s.startDay}</div>
              <div><strong>End Day:</strong> {s.unlockedDay}</div>
              <div><strong>Status:</strong> {currentDay >= s.unlockedDay ? 'Mature' : 'Active'}</div>
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