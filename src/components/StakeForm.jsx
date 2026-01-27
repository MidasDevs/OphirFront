// src/components/StakeForm.jsx (full fixed preview + validation)
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ABI, CONTRACT_ADDRESS, DECIMALS } from '../abi/ophirAbi';

const formatNum = (num) => Number(num).toLocaleString('en-US', { maximumFractionDigits: 8 });

function StakeForm({ onStake }) {
  const [amount, setAmount] = useState('');
  const [days, setDays] = useState('');
  const [preview, setPreview] = useState('0');

  useEffect(() => {
    const calc = async () => {
      const numDays = Number(days);
      if (!amount || !days || numDays > 8357 || numDays < 1) {
        setPreview('0');
        return;
      }
      try {
        const provider = new ethers.JsonRpcProvider('https://rpc.pulsechain.com');
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        const interest = await contract.calculateInterest(ethers.parseUnits(amount, DECIMALS), numDays);
        setPreview(ethers.formatUnits(interest, DECIMALS));
      } catch {
        setPreview('0');
      }
    };
    calc();
  }, [amount, days]);

  const handleStake = () => {
    const numDays = Number(days);
    if (!amount || !days || numDays > 8357 || numDays < 1) {
      alert('Enter valid amount and days 1-8357');
      return;
    }
    onStake(amount, days);
    setAmount('');
    setDays('');
    setPreview('0');
  };

  return (
    <section className="stake-section">
      <h2>Start a New Stake</h2>
      <div className="stake-form">
        <input type="number" placeholder="Amount (OPHIR)" value={amount} onChange={e => setAmount(e.target.value)} className="stake-input" />
        <input type="number" placeholder="Days (1-8357)" value={days} onChange={e => setDays(e.target.value)} className="stake-input" />
        <button className="stake-btn" onClick={handleStake}>Stake OPHIR</button>
      </div>
      {preview !== '0' && <p>Estimated Yield: {formatNum(preview)} OPHIR</p>}
    </section>
  );
}

export default StakeForm;