// src/App.jsx (fixed + full functions)
import { useEffect, useState, useCallback } from 'react';
import { createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { ethers } from 'ethers';
import Header from './components/Header';
import Hero from './components/Hero';
import BalanceCard from './components/BalanceCard';
import StakeForm from './components/StakeForm';
import StakesList from './components/StakesList';
import './App.css';
import { ABI, CONTRACT_ADDRESS, DECIMALS } from './abi/ophirAbi';
import GlobalsCard from './components/GlobalsCard';

const pulsechain = {
  id: 369,
  name: 'PulseChain',
  nativeCurrency: { name: 'Pulse', symbol: 'PLS', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.pulsechain.com'] } },
  blockExplorers: { default: { name: 'PulseScan', url: 'https://scan.pulsechain.com' } },
};

const projectId = 'e2a947ed8aeaa32d8eca35cb1c7a5c4c';
const metadata = {
  name: 'Ophir Community Frontend',
  description: 'Simple access to OPHIR staking',
  url: 'https://ophir-front.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const modal = createAppKit({
  adapters: [new EthersAdapter()],
  projectId,
  networks: [pulsechain],
  metadata,
  features: { analytics: true, email: false, socials: false },
});

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('0');
  const [stakes, setStakes] = useState([]);
  const [currentDay, setCurrentDay] = useState(0);
  const [wrongChain, setWrongChain] = useState(false);

  const updateConnection = useCallback(async () => {
    const walletProvider = modal.getWalletProvider();
    if (walletProvider) {
      const provider = new ethers.BrowserProvider(walletProvider);
      try {
        const network = await provider.getNetwork();
        if (network.chainId !== 369n) {
          setWrongChain(true); setAccount(null); setBalance('0'); setStakes([]); setCurrentDay(0); return;
        }
        setWrongChain(false);
        const signer = await provider.getSigner();
        const addr = await signer.getAddress();
        if (addr !== account) {
          setAccount(addr);
          await fetchData(provider, addr);
        }
      } catch (e) {
        console.error(e);
        setAccount(null);
      }
    } else {
      setAccount(null); setBalance('0'); setStakes([]); setCurrentDay(0); setWrongChain(false);
    }
  }, [account]);

  const fetchData = async (prov, addr) => {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, prov);
    try {
      const bal = await contract.balanceOf(addr).catch(() => 0n);
      setBalance(ethers.formatUnits(bal || 0n, DECIMALS));

      const day = await contract.currentDay();
      setCurrentDay(Number(day));

      const count = await contract.countStakes(addr);
      const list = [];
      for (let i = 0; i < Number(count); i++) {
        const s = await contract.Stakes(addr, i);
        list.push({
          id: s.stakeId.toString(),
          amount: ethers.formatUnits(s.stakedPrinciple, DECIMALS),
          days: s.stakedDays.toString(),
          startDay: Number(s.startDay),
          unlockedDay: Number(s.startDay) + Number(s.stakedDays),
          scraped: ethers.formatUnits(s.scrapedInterest, DECIMALS),
        });
      }
      setStakes(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    updateConnection();
    const handleChange = () => updateConnection();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleChange);
      window.ethereum.on('chainChanged', handleChange);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleChange);
        window.ethereum.removeListener('chainChanged', handleChange);
      }
    };
  }, [updateConnection]);

  const connect = async () => { await modal.open(); updateConnection(); };
  const disconnect = async () => { await modal.disconnect(); updateConnection(); };
  await updateConnection();

  const startStake = async (amount, days) => {
    if (!amount || !days) return;
    const walletProvider = modal.getWalletProvider();
    if (!walletProvider) return;
    const provider = new ethers.BrowserProvider(walletProvider);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    const tx = await contract.startStake(ethers.parseUnits(amount, DECIMALS), days);
    await tx.wait();
    updateConnection();
  };

  const endStake = async (idx, id) => {
    const walletProvider = modal.getWalletProvider();
    if (!walletProvider) return;
    const provider = new ethers.BrowserProvider(walletProvider);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    const tx = await contract.endStake(idx, id);
    await tx.wait();
    updateConnection();
  };

  const scrapeStake = async (idx, id) => {
    const walletProvider = modal.getWalletProvider();
    if (!walletProvider) return;
    const provider = new ethers.BrowserProvider(walletProvider);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    const tx = await contract.scrapeStake(idx, id);
    await tx.wait();
    updateConnection();
  };

  return (
    <div className="app-container">
      <Header />
      {!account ? (
        <Hero onConnect={connect} />
      ) : wrongChain ? (
        <section className="hero"><p className="hero-subtitle">Switch to PulseChain (369)</p></section>
      ) : (
        <>
          <div className="connected-header">
            <p className="connected-text">Connected: <strong>{account.slice(0,6)}...{account.slice(-4)}</strong></p>
            <button className="disconnect-btn" onClick={disconnect}>Disconnect</button>
          </div>
          <BalanceCard balance={balance} />
          <StakeForm onStake={startStake} />
          <StakesList stakes={stakes} currentDay={currentDay} onEnd={endStake} onScrape={scrapeStake} />
		  <GlobalsCard />
        </>
      )}
      <footer className="footer">
        <p>Use at own risk • Test small amounts • Verify on scan.pulsechain.com</p>
      </footer>
    </div>
  );
}

export default App;