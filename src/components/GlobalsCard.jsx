// src/components/GlobalsCard.jsx (keep 2 decimals for big stats)
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { ABI, CONTRACT_ADDRESS, DECIMALS } from '../abi/ophirAbi';

const formatNum = (num) => Number(num).toLocaleString('en-US', { maximumFractionDigits: 2 });

function GlobalsCard() {
  const [globals, setGlobals] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const provider = new ethers.JsonRpcProvider('https://rpc.pulsechain.com');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const g = await contract.reportGlobals();
      setGlobals({
        currentDay: Number(g.current_day),
        totalStaked: ethers.formatUnits(g.staked_stars, DECIMALS),
        charity: ethers.formatUnits(g.penalized_stars, DECIMALS),
        endowment: ethers.formatUnits(g.endowment_supply, DECIMALS),
      });
    };
    fetch();
  }, []);

  if (!globals) return null;

  return (
    <section className="globals-section balance-card">
      <h2>Network Stats</h2>
      <div><strong>Current Day:</strong> {globals.currentDay.toLocaleString()}</div>
      <div><strong>Total Staked:</strong> {formatNum(globals.totalStaked)} OPHIR</div>
      <div><strong>Charity Pool:</strong> {formatNum(globals.charity)} OPHIR</div>
      <div><strong>Endowment Pool:</strong> {formatNum(globals.endowment)} OPHIR</div>
    </section>
  );
}

export default GlobalsCard;