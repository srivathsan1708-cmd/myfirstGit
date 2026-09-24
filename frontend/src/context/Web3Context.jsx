import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contract';

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [account, setAccount]           = useState(null);
  const [stakeBalance, setStakeBalance] = useState(null);
  const [rewardPool, setRewardPool]     = useState(null);
  const [myRewards, setMyRewards]       = useState(null);
  const [poolBps, setPoolBps]           = useState(100);
  const [leaderboard, setLeaderboard]   = useState([]);
  const [loading, setLoading]           = useState(false);

  const isConnected = !!account;

  const getProvider = () => new ethers.BrowserProvider(window.ethereum);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert('MetaMask not found. Please install it.');
      return;
    }
    setLoading(true);
    try {
      const provider = getProvider();
      const accounts = await provider.send('eth_requestAccounts', []);
      const addr = accounts[0];
      setAccount(addr);
      await refreshAll(addr);
    } catch (e) {
      console.error('Connect wallet error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStake = useCallback(async (addr) => {
    if (!addr || !window.ethereum) return;
    try {
      const provider = getProvider();
      const contract = new ethers.Contract(CONTRACT_ADDRESS,
        ['function stakes(address) view returns (uint256)'], provider);
      setStakeBalance(await contract.stakes(addr));
    } catch (_) {}
  }, []);

  const refreshRewards = useCallback(async (addr) => {
    if (!window.ethereum) return;
    try {
      const provider = getProvider();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, [
        'function rewardPool() view returns (uint256)',
        'function totalRewards(address) view returns (uint256)',
        'function poolBasisPoints() view returns (uint256)',
      ], provider);
      const [pool, bps] = await Promise.all([
        contract.rewardPool(),
        contract.poolBasisPoints(),
      ]);
      setRewardPool(pool);
      setPoolBps(Number(bps));
      if (addr) setMyRewards(await contract.totalRewards(addr));
    } catch (_) {}
  }, []);

  const refreshLeaderboard = useCallback(async () => {
    // Default seed nodes for initial display
    const seedMap = {
      '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': { name: 'Deutsche Telekom Node', earned: ethers.parseEther("0.85") },
      '0x70997970c51812dc3a010c7d01b50e0d17dc79c8': { name: 'Blockdaemon Node',    earned: ethers.parseEther("0.62") },
      '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc': { name: 'Kiln Staking Feed',   earned: ethers.parseEther("0.45") },
      '0x90F79bf6EB2c4f870365E785982E1f101E93b906': { name: 'OpenWeather Oracle',  earned: ethers.parseEther("0.28") },
    };

    try {
      // Use JsonRpcProvider first for reliability, fallback to window.ethereum
      let provider;
      try {
        provider = new ethers.JsonRpcProvider("http://localhost:8545");
      } catch {
        if (window.ethereum) provider = getProvider();
      }

      if (provider) {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        const filter = contract.filters.RewardPaid();
        const events = await contract.queryFilter(filter, 0, 'latest');
        for (const e of events) {
          const addr = e.args.node;
          const amt  = e.args.amount;
          if (!seedMap[addr]) {
            seedMap[addr] = { name: 'Oracle Node ' + addr.slice(0, 6), earned: 0n };
          }
          seedMap[addr].earned += amt;
        }
      }
    } catch (err) {
      console.warn('Leaderboard queryFilter error:', err);
    }

    const sorted = Object.entries(seedMap)
      .map(([addr, data]) => ({ addr, name: data.name, earned: data.earned }))
      .sort((a, b) => (b.earned > a.earned ? 1 : -1));

    setLeaderboard(sorted);
  }, []);

  const refreshAll = useCallback(async (addr) => {
    const a = addr || account;
    await Promise.all([refreshStake(a), refreshRewards(a), refreshLeaderboard()]);
  }, [account, refreshStake, refreshRewards, refreshLeaderboard]);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;
    const onAccountsChanged = (accounts) => {
      const addr = accounts[0] || null;
      setAccount(addr);
      if (addr) refreshAll(addr);
      else { setStakeBalance(null); setMyRewards(null); }
    };
    window.ethereum.on('accountsChanged', onAccountsChanged);
    return () => window.ethereum.removeListener('accountsChanged', onAccountsChanged);
  }, [refreshAll]);

  // Auto-connect if previously authorized & initial leaderboard load
  useEffect(() => {
    refreshLeaderboard();
    refreshRewards();
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          refreshAll(accounts[0]);
        }
      });
    }
  }, [refreshLeaderboard, refreshRewards, refreshAll]);

  const value = {
    account,
    isConnected,
    stakeBalance,
    rewardPool,
    myRewards,
    poolBps,
    leaderboard,
    loading,
    connectWallet,
    refreshStake,
    refreshRewards,
    refreshLeaderboard,
    refreshAll,
    getProvider,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error('useWeb3 must be used inside Web3Provider');
  return ctx;
}
