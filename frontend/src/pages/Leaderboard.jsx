import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { Link } from 'react-router-dom';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const { account, isConnected, leaderboard, rewardPool, refreshLeaderboard, connectWallet } = useWeb3();

  const totalRewards = leaderboard.reduce((s, e) => s + e.earned, 0n);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <span>🏆</span> Node Leaderboard
          </h1>
          <p className="text-gray-600 text-sm mt-1">Top oracle nodes ranked by on-chain rewards earned</p>
        </div>
        <button onClick={refreshLeaderboard} className="btn-secondary text-xs">
          ↻ Refresh
        </button>
      </div>

      {/* Pool summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Current Reward Pool</div>
          <div className="text-2xl font-extrabold text-amber-600">
            {rewardPool != null ? `${parseFloat(ethers.formatEther(rewardPool)).toFixed(4)} ETH` : '—'}
          </div>
        </div>
        <div className="card">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Total Distributed</div>
          <div className="text-2xl font-extrabold text-green-600">
            {totalRewards > 0n ? `${parseFloat(ethers.formatEther(totalRewards)).toFixed(4)} ETH` : '—'}
          </div>
        </div>
        <div className="card">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Ranked Nodes</div>
          <div className="text-2xl font-extrabold text-primary-600">{leaderboard.length}</div>
        </div>
        {isConnected && account && (
          <div className="card">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Your Rank</div>
            <div className="text-2xl font-extrabold text-purple-600">
              {(() => {
                const idx = leaderboard.findIndex(e => e.addr.toLowerCase() === account.toLowerCase());
                return idx >= 0 ? `#${idx + 1}` : 'Unranked';
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Table Card */}
      <div className="card overflow-hidden">
        {leaderboard.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🏅</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Reward Events Yet</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">Become an oracle node and submit verified data to start earning rewards and appear on the leaderboard.</p>
            <Link to="/validator" className="btn-primary inline-flex">Run AI Consensus →</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-semibold text-gray-600">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Oracle Node / Entity</th>
                  <th className="px-6 py-4">Node Wallet Address</th>
                  <th className="px-6 py-4 text-right">Rewards Earned (ETH)</th>
                  <th className="px-6 py-4 text-right">Reward Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaderboard.map(({ addr, name, earned }, idx) => {
                  const pct = totalRewards > 0n ? Number((earned * 10000n) / totalRewards) / 100 : 0;
                  const isMe = account && addr.toLowerCase() === account.toLowerCase();
                  return (
                    <tr key={addr} className={`hover:bg-gray-50 transition-colors ${isMe ? 'bg-primary-50/50' : ''}`}>
                      <td className="px-6 py-4 font-bold text-base">
                        {MEDALS[idx] || `#${idx + 1}`}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        <div className="flex items-center space-x-2">
                          <span>{name || 'Oracle Node'}</span>
                          {isMe && <span className="badge-info text-[10px]">YOU</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-gray-500 text-xs">
                        {addr.slice(0, 10)}...{addr.slice(-6)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-green-600">
                        {parseFloat(ethers.formatEther(earned)).toFixed(4)} ETH
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-primary-600 h-full rounded-full" style={{ width: `${Math.max(pct, 5)}%` }} />
                          </div>
                          <span className="font-mono text-xs text-gray-500 min-w-10">{pct.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
