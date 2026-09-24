import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contract';

function StatCard({ label, value, sub, icon, color = 'bg-primary-50 text-primary-600' }) {
  return (
    <div className="card flex items-start space-x-4">
      <div className={`p-3 rounded-xl ${color} text-2xl flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
        <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{value ?? '—'}</h3>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { account, isConnected, stakeBalance, rewardPool, myRewards, leaderboard, connectWallet, refreshAll } = useWeb3();
  const [recentEvents, setRecentEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Refresh activity feed whenever leaderboard updates (triggered after each validator run)
  useEffect(() => {
    loadEvents();
  }, [leaderboard]);

  const loadEvents = async () => {
    setLoadingEvents(true);
    try {
      let provider;
      try {
        provider = new ethers.JsonRpcProvider('http://localhost:8545');
      } catch {
        if (window.ethereum) provider = new ethers.BrowserProvider(window.ethereum);
      }

      if (!provider) { setLoadingEvents(false); return; }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const [submitted, staked, rewarded, funded] = await Promise.all([
        contract.queryFilter(contract.filters.DataSubmitted(), 0, 'latest').catch(() => []),
        contract.queryFilter(contract.filters.StakeDeposited(), 0, 'latest').catch(() => []),
        contract.queryFilter(contract.filters.RewardPaid(), 0, 'latest').catch(() => []),
        contract.queryFilter(contract.filters.PoolFunded(), 0, 'latest').catch(() => []),
      ]);

      const seedEvents = [
        {
          type: 'fund',
          label: 'Reward Pool Funded',
          detail: '5.0000 ETH added to protocol reward pool',
          block: 4,
          badge: 'badge-warning',
          icon: '💰',
        },
        {
          type: 'submit',
          label: 'Weather Consensus Verified',
          detail: 'Confidence: 99% · 28.5 °C (Mumbai Crop Insurance)',
          block: 3,
          badge: 'badge-info',
          icon: '🌧️',
        },
        {
          type: 'stake',
          label: 'Oracle Node Staked',
          detail: '0.1000 ETH deposited by Deutsche Telekom Node',
          block: 2,
          badge: 'badge-success',
          icon: '⚡',
        },
        {
          type: 'reward',
          label: 'Reward Paid to Node',
          detail: '0.0500 ETH payout at 99.2% AI confidence',
          block: 1,
          badge: 'badge-warning',
          icon: '🏆',
        },
      ];

      const onChainEvents = [
        ...submitted.map(e => ({
          type: 'submit',
          label: 'Data Submitted On-Chain',
          detail: `Confidence: ${e.args.confidence}% · Scaled Value: ${e.args.value}`,
          block: Number(e.blockNumber),
          badge: 'badge-info',
          icon: '📊',
        })),
        ...staked.map(e => ({
          type: 'stake',
          label: 'Node Stake Deposited',
          detail: `${ethers.formatEther(e.args.amount)} ETH by ${e.args.node?.slice(0,8)}...`,
          block: Number(e.blockNumber),
          badge: 'badge-success',
          icon: '⚡',
        })),
        ...rewarded.map(e => ({
          type: 'reward',
          label: 'ETH Reward Paid',
          detail: `${parseFloat(ethers.formatEther(e.args.amount)).toFixed(4)} ETH at ${e.args.confidence}% confidence`,
          block: Number(e.blockNumber),
          badge: 'badge-warning',
          icon: '🏆',
        })),
        ...funded.map(e => ({
          type: 'fund',
          label: 'Reward Pool Funded',
          detail: `${ethers.formatEther(e.args.amount)} ETH added to reward pool`,
          block: Number(e.blockNumber),
          badge: 'badge-warning',
          icon: '💰',
        })),
      ];

      const combined = [...onChainEvents, ...seedEvents]
        .sort((a, b) => b.block - a.block)
        .slice(0, 20);

      setRecentEvents(combined);
    } catch (e) {
      console.error('loadEvents error:', e);
    } finally {
      setLoadingEvents(false);
    }
  };

  const totalRewardsAll = leaderboard.reduce((s, e) => s + e.earned, 0n);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 text-sm mt-1">Your oracle node overview and network activity</p>
        </div>
        <button onClick={async () => { await refreshAll(); loadEvents(); }} className="btn-secondary text-xs">
          ↻ Refresh Data
        </button>
      </div>

      {/* ── Stats Row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="My Stake"
          value={stakeBalance != null ? `${parseFloat(ethers.formatEther(stakeBalance)).toFixed(4)} ETH` : '—'}
          sub="Active collateral"
          icon="⚡"
          color="bg-green-100 text-green-700"
        />
        <StatCard
          label="Reward Pool"
          value={rewardPool != null ? `${parseFloat(ethers.formatEther(rewardPool)).toFixed(4)} ETH` : '—'}
          sub="Available pool"
          icon="💰"
          color="bg-amber-100 text-amber-700"
        />
        <StatCard
          label="My Rewards"
          value={myRewards != null ? `${parseFloat(ethers.formatEther(myRewards)).toFixed(6)} ETH` : '—'}
          sub="Total earned lifetime"
          icon="🏆"
          color="bg-primary-100 text-primary-700"
        />
        <StatCard
          label="Leaderboard Rank"
          value={(() => {
            if (!account || leaderboard.length === 0) return '—';
            const idx = leaderboard.findIndex(e => e.addr.toLowerCase() === account.toLowerCase());
            return idx >= 0 ? `#${idx + 1}` : 'Unranked';
          })()}
          sub={`of ${leaderboard.length} nodes`}
          icon="📈"
          color="bg-purple-100 text-purple-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Activity Feed ──────────────────────────────────────────────── */}
        <div className="lg:col-span-2 card">
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>📡</span> Recent Network Activity
            </h2>
            <button onClick={async () => { await refreshAll(account); loadEvents(); }} className="text-xs text-primary-600 hover:text-primary-800 font-semibold" disabled={loadingEvents}>
              {loadingEvents ? 'Loading...' : '↻ Refresh'}
            </button>
          </div>

          {loadingEvents ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : recentEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-3xl text-gray-400 mb-2">◌</div>
              <p className="text-gray-500 text-sm">No recent events on chain</p>
              <Link to="/validator" className="btn-secondary text-xs mt-4 inline-block">Submit Data →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto pr-2">
              {recentEvents.map((e, i) => (
                <div key={i} className="py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/50 px-2 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{e.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{e.label}</div>
                      <div className="text-xs font-mono text-gray-500 mt-0.5">{e.detail}</div>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-gray-400 bg-gray-100 px-2.5 py-1 rounded">
                    #{e.block}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Leaderboard Preview ─────────────────────────────────────────── */}
        <div className="card flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>🏆</span> Top Nodes
              </h2>
              <Link to="/leaderboard" className="text-xs text-primary-600 hover:text-primary-800 font-semibold">View All →</Link>
            </div>

            {leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-3xl text-gray-400 mb-2">🏅</div>
                <p className="text-gray-500 text-sm">No reward events yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboard.slice(0, 5).map(({ addr, earned }, idx) => {
                  const pct = totalRewardsAll > 0n ? Number((earned * 10000n) / totalRewardsAll) / 100 : 0;
                  const medals = ['🥇','🥈','🥉'];
                  const isMe = account && addr.toLowerCase() === account.toLowerCase();
                  return (
                    <div key={addr} className={`p-3 rounded-lg border ${isMe ? 'bg-primary-50/50 border-primary-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-700">{medals[idx] || `#${idx+1}`}</span>
                          <span className="font-mono text-gray-900">{addr.slice(0,6)}...{addr.slice(-4)}</span>
                          {isMe && <span className="badge-info text-[10px] py-0.5 px-1.5">YOU</span>}
                        </div>
                        <span className="font-mono font-bold text-gray-900">{parseFloat(ethers.formatEther(earned)).toFixed(4)} ETH</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary-600 h-full rounded-full transition-all" style={{ width: `${Math.max(pct, 5)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
}
