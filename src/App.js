import React, { useState, useEffect } from 'react';
import { createAppKit } from '@reown/appkit';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { ethers } from 'ethers';

// Customize PulseChain chain
const pulsechain = {
  id: 369,
  name: 'PulseChain',
  nativeCurrency: { name: 'Pulse', symbol: 'PLS', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.pulsechain.com'] }, public: { http: ['https://rpc.pulsechain.com'] } },
  blockExplorers: { default: { name: 'PulseScan', url: 'https://scan.pulsechain.com' } },
};

// Wagmi config
const config = createConfig({
  chains: [pulsechain],
  transports: { [pulsechain.id]: http() },
});

// Reown AppKit setup
const queryClient = new QueryClient();
const projectId = 'e2a947ed8aeaa32d8eca35cb1c7a5c4c'; // Your ID

const metadata = {
  name: 'Ophir Community Frontend',
  description: 'Simple access to OPHIR staking',
  url: 'http://localhost:3000', // Change to deploy URL later
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const modal = createAppKit({
  adapters: [new EthersAdapter()],
  projectId,
  networks: [pulsechain],
  metadata,
  features: { analytics: true, email: false, socials: false, emailLogin: false },
  themeVariables: { '--w3m-accent': '#00d1b2' }
});

// Contract details
const CONTRACT_ADDRESS = '0xc59be55d22cb7967ee95e5be0770e263ee014f78';
const ABI = [
  {"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"type":"function"},
  {"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"type":"function"},
  {"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"type":"function"},
  {"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"type":"function"},
  {"constant":true,"inputs":[],"name":"currentDay","outputs":[{"name":"","type":"uint256"}],"type":"function"},
  {"constant":false,"inputs":[{"name":"newStakedHearts","type":"uint256"},{"name":"newStakedDays","type":"uint256"}],"name":"stakeStart","outputs":[],"type":"function"},
  {"constant":false,"inputs":[{"name":"stakeIndex","type":"uint256"},{"name":"stakeIdParam","type":"uint40"}],"name":"stakeEnd","outputs":[],"type":"function"},
  {"constant":true,"inputs":[{"name":"stakerAddr","type":"address"}],"name":"stakeCount","outputs":[{"name":"","type":"uint256"}],"type":"function"},
  {"constant":true,"inputs":[{"name":"stakerAddr","type":"address"},{"name":"stakeIndex","type":"uint256"}],"name":"stakeLists","outputs":[
    {"name":"stakeId","type":"uint40"},
    {"name":"stakedHearts","type":"uint256"},
    {"name":"stakeShares","type":"uint256"},
    {"name":"lockedDay","type":"uint16"},
    {"name":"stakedDays","type":"uint16"},
    {"name":"unlockedDay","type":"uint16"},
    {"name":"isAutoStake","type":"bool"}
  ],"type":"function"},
];

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [balance, setBalance] = useState('0');
  const [stakes, setStakes] = useState([]);
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakeDays, setStakeDays] = useState('');

  useEffect(() => {
    const unsubscribe = modal.subscribeState((state) => {
      if (state.status === 'Success') {
        checkConnection();
      }
    });
    checkConnection();
    return () => unsubscribe();
  }, []);

  const checkConnection = async () => {
    const walletProvider = modal.getWalletProvider();
    if (walletProvider) {
      const ethersProvider = new ethers.BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const addr = await signer.getAddress();
      setAccount(addr);
      setProvider(ethersProvider);
      fetchBalance(ethersProvider, addr);
      fetchStakes(ethersProvider, addr);
    }
  };

  const openModal = async () => {
    await modal.open();
  };

  const fetchBalance = async (prov, addr) => {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, prov);
    const bal = await contract.balanceOf(addr);
    setBalance(ethers.formatUnits(bal, 8));
  };

  const fetchStakes = async (prov, addr) => {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, prov);
    const count = await contract.stakeCount(addr);
    const stakeList = [];
    for (let i = 0; i < Number(count); i++) {
      const stake = await contract.stakeLists(addr, i);
      stakeList.push({
        id: stake.stakeId.toString(),
        amount: ethers.formatUnits(stake.stakedHearts, 8),
        days: stake.stakedDays.toString(),
        lockedDay: stake.lockedDay.toString(),
        unlockedDay: stake.unlockedDay.toString()
      });
    }
    setStakes(stakeList);
  };

  const startStake = async () => {
    if (!provider || !stakeAmount || !stakeDays) return;
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    const hearts = ethers.parseUnits(stakeAmount, 8);
    const tx = await contract.stakeStart(hearts, stakeDays);
    await tx.wait();
    alert('Stake started!');
    fetchBalance(provider, account);
    fetchStakes(provider, account);
  };

  const endStake = async (index, stakeId) => {
    if (!provider) return;
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    const tx = await contract.stakeEnd(index, stakeId);
    await tx.wait();
    alert('Stake ended!');
    fetchBalance(provider, account);
    fetchStakes(provider, account);
  };

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div style={{ padding: '20px' }}>
          <h1>Ophir Crypto Frontend (Community Fix)</h1>
          <button onClick={openModal}>Connect Wallet</button>
          {account && <p>Connected: {account}</p>}
          <p>OPHIR Balance: {balance}</p>

          <h2>Start Stake</h2>
          <input type="number" placeholder="Amount (OPHIR)" value={stakeAmount} onChange={e => setStakeAmount(e.target.value)} />
          <input type="number" placeholder="Days (1-5555)" value={stakeDays} onChange={e => setStakeDays(e.target.value)} />
          <button onClick={startStake}>Stake</button>

          <h2>Your Stakes</h2>
          <ul>
            {stakes.map((stake, idx) => (
              <li key={idx}>
                ID: {stake.id} | Amount: {stake.amount} | Days: {stake.days} | Locked: Day {stake.lockedDay} | Unlocked: Day {stake.unlockedDay}
                <button onClick={() => endStake(idx, stake.id)}>End Stake</button>
              </li>
            ))}
          </ul>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;