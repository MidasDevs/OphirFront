import { useEffect, useState, useCallback } from 'react';
import { createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { ethers } from 'ethers';
import './App.css';

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
  url: 'https://ophirfront.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const modal = createAppKit({
  adapters: [new EthersAdapter()],
  projectId,
  networks: [pulsechain],
  metadata,
  features: { analytics: true, email: false, socials: false },
});

const CONTRACT_ADDRESS = '0xc59be55d22cb7967ee95e5be0770e263ee014f78';

const ABI = [
  {"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"type":"function"},
  {"constant":true,"inputs":[],"name":"currentDay","outputs":[{"name":"","type":"uint256"}],"type":"function"},
  {"constant":false,"inputs":[{"name":"newStakedHearts","type":"uint256"},{"name":"newStakedDays","type":"uint256"}],"name":"stakeStart","outputs":[],"type":"function"},
  {"constant":false,"inputs":[{"name":"stakeIndex","type":"uint256"},{"name":"stakeIdParam","type":"uint40"}],"name":"stakeEnd","outputs":[],"type":"function"},
  {"constant":true,"inputs":[{"name":"stakerAddr","type":"address"}],"name":"stakeCount","outputs":[{"name":"","type":"uint256"}],"type":"function"},
  {"constant":true,"inputs":[{"name":"stakerAddr","type":"address"},{"name":"stakeIndex","type":"uint256"}],"name":"stakeLists","outputs":[{"name":"stakeId","type":"uint40"},{"name":"stakedHearts","type":"uint256"},{"name":"stakeShares","type":"uint256"},{"name":"lockedDay","type":"uint16"},{"name":"stakedDays","type":"uint16"},{"name":"unlockedDay","type":"uint16"},{"name":"isAutoStake","type":"bool"}],"type":"function"},
];

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState('0');
  const [stakes, setStakes] = useState([]);
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakeDays, setStakeDays] = useState('');
  const [wrongChain, setWrongChain] = useState(false);

  const updateConnection = useCallback(async () => {
    const walletProvider = modal.getWalletProvider();
    if (walletProvider) {
      const provider = new ethers.BrowserProvider(walletProvider);
      try {
        const network = await provider.getNetwork();
        if (network.chainId !== 369n) {
          setWrongChain(true);
          setAccount(null);
          setBalance('0');
          setStakes([]);
          return;
        }
        setWrongChain(false);
        const signer = await provider.getSigner();
        const addr = await signer.getAddress();
        if (addr !== account) {
          setAccount(addr);
          fetchData(provider, addr);
        }
      } catch (e) {
        console.error(e);
        setAccount(null);
      }
    } else {
      setAccount(null);
      setBalance('0');
      setStakes([]);
      setWrongChain(false);
    }
  }, [account]);

  const fetchData = async (prov, addr) => {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, prov);
    try {
      const bal = await contract.balanceOf(addr);
      setBalance(ethers.formatUnits(bal, 8));

      const count = await contract.stakeCount(addr);
      const list = [];
      for (let i = 0; i < Number(count); i++) {
        const stake = await contract.stakeLists(addr, i);
        list.push({
          id: stake.stakeId.toString(),
          amount: ethers.formatUnits(stake.stakedHearts, 8),
          days: stake.stakedDays.toString(),
          lockedDay: stake.lockedDay.toString(),
          unlockedDay: stake.unlockedDay.toString()
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

  const connect = async () => {
    await modal.open();
    updateConnection();
  };

  const disconnect = async () => {
    await modal.disconnect();
    updateConnection();
  };

  const startStake = async () => {
    if (!account || !stakeAmount || !stakeDays) return;
    const walletProvider = modal.getWalletProvider();
    if (!walletProvider) return;
    const provider = new ethers.BrowserProvider(walletProvider);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    const tx = await contract.stakeStart(ethers.parseUnits(stakeAmount, 8), stakeDays);
    await tx.wait();
    updateConnection();
  };

  const endStake = async (idx, id) => {
    if (!account) return;
    const walletProvider = modal.getWalletProvider();
    if (!walletProvider) return;
    const provider = new ethers.BrowserProvider(walletProvider);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    const tx = await contract.stakeEnd(idx, id);
    await tx.wait();
    updateConnection();
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">
          <span className="logo-star">✦</span> Ophir – Mining Hearts of Gold
        </div>
        <p className="tagline">Unlocking abundance to fuel generosity</p>
      </header>

      {!account ? (
        <section className="hero">
          <h1 className="hero-title">Unlocking abundance to fuel generosity</h1>
          <p className="hero-subtitle">Community tool for OPHIR staking – not official</p>
          <button className="connect-btn" onClick={connect}>Connect Wallet to Begin</button>
        </section>
      ) : wrongChain ? (
        <section className="hero">
          <p className="hero-subtitle">Please switch to PulseChain network (Chain ID 369)</p>
        </section>
      ) : (
        <>
          <div className="connected-header">
            <p className="connected-text">Connected as <strong>{account.slice(0,6)}...{account.slice(-4)}</strong></p>
            <button className="disconnect-btn" onClick={disconnect}>Disconnect</button>
          </div>

          <section className="balance-section">
            <div className="balance-card">
              <h2>Your OPHIR Balance</h2>
              <div className="balance-value">{balance} OPHIR</div>
            </div>
          </section>

          <section className="stake-section">
            <h2>Start a New Stake</h2>
            <div className="stake-form">
              <input type="number" placeholder="Amount (OPHIR)" value={stakeAmount} onChange={e => setStakeAmount(e.target.value)} className="stake-input" />
              <input type="number" placeholder="Days (1-5555)" value={stakeDays} onChange={e => setStakeDays(e.target.value)} className="stake-input" />
              <button className="stake-btn" onClick={startStake}>Stake OPHIR</button>
            </div>
          </section>

          <section className="stakes-section">
            <h2>Your Active Stakes</h2>
            {stakes.length > 0 ? (
              <div className="stakes-grid">
                {stakes.map((stake, idx) => (
                  <div key={idx} className="stake-card">
                    <div className="stake-details">
                      <div><strong>ID:</strong> {stake.id}</div>
                      <div><strong>Amount:</strong> {stake.amount}</div>
                      <div><strong>Days:</strong> {stake.days}</div>
                      <div><strong>Locked:</strong> Day {stake.lockedDay}</div>
                      <div><strong>Unlocked:</strong> Day {stake.unlockedDay}</div>
                    </div>
                    <button className="end-btn" onClick={() => endStake(idx, stake.id)}>End Stake</button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-stakes">No active stakes found.</p>
            )}
          </section>
        </>
      )}

      <footer className="footer">
        <p>Use at your own risk • Test small amounts • Verify on scan.pulsechain.com</p>
      </footer>
    </div>
  );
}

export default App;