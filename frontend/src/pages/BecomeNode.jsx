import { useState } from 'react';
import { ethers } from 'ethers';
import { getSignerContract } from '../contract';
import { useWeb3 } from '../context/Web3Context';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function BecomeNode() {
  const { account, isConnected, stakeBalance, rewardPool, myRewards, poolBps, connectWallet, refreshAll } = useWeb3();

  // ── Stake ──────────────────────────────────────────────────────────────────
  const [stakeAmount,  setStakeAmount]  = useState('0.01');
  const [staking,      setStaking]      = useState(false);

  // ── Fund Pool ──────────────────────────────────────────────────────────────
  const [fundAmount, setFundAmount] = useState('0.05');
  const [funding,    setFunding]    = useState(false);

  // ── Pool BPS ───────────────────────────────────────────────────────────────
  const [newBps,      setNewBps]      = useState('');
  const [settingBps,  setSettingBps]  = useState(false);

  const formatEth = w => {
    if (!w && w !== 0n) return '—';
    const n = parseFloat(ethers.formatEther(w));
    return n < 0.001 ? n.toExponential(2) : n.toFixed(4);
  };

  const depositStake = async () => {
    if (!stakeAmount || Number(stakeAmount) <= 0) { toast.error('Enter a valid stake amount'); return; }
    setStaking(true);
    try {
      const contract = await getSignerContract();
      const tx = await contract.depositStake({ value: ethers.parseEther(stakeAmount), gasLimit: 100000n });
      const toastId = toast.loading('Staking ETH...');
      await tx.wait();
      toast.success(`✅ Staked ${stakeAmount} ETH!`, { id: toastId });
      await refreshAll(account);
    } catch (err) {
      toast.error(err.reason || err.message?.slice(0, 80));
    } finally { setStaking(false); }
  };

  const fundPool = async () => {
    if (!fundAmount || Number(fundAmount) <= 0) { toast.error('Enter a valid amount'); return; }
    setFunding(true);
    try {
      const contract = await getSignerContract();
      const tx = await contract.fundRewardPool({ value: ethers.parseEther(fundAmount), gasLimit: 100000n });
      const toastId = toast.loading('Funding reward pool...');
      await tx.wait();
      toast.success(`✅ Pool funded +${fundAmount} ETH!`, { id: toastId });
      await refreshAll(account);
    } catch (err) {
      toast.error(err.reason || err.message?.slice(0, 80));
    } finally { setFunding(false); }
  };

  const setPoolBps = async () => {
    const bps = Number(newBps);
    if (!bps || bps < 10 || bps > 1000) { toast.error('BPS must be between 10 and 1000'); return; }
    setSettingBps(true);
    try {
      const contract = await getSignerContract();
      const tx = await contract.setPoolBasisPoints(BigInt(bps), { gasLimit: 100000n });
      const toastId = toast.loading('Updating BPS...');
      await tx.wait();
      toast.success(`✅ Pool basis points set to ${bps}`, { id: toastId });
      await refreshAll(account);
      setNewBps('');
    } catch (err) {
      toast.error(err.reason || err.message?.slice(0, 80));
    } finally { setSettingBps(false); }
  };

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="card text-center max-w-lg mx-auto py-12">
          <div className="text-5xl mb-4">🔌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6 text-sm">Connect MetaMask to stake ETH and become an oracle node on the ProvAI Network.</p>
          <button onClick={connectWallet} className="btn-primary inline-flex">Connect Wallet</button>
        </div>
      </div>
    );
  }

  const hasStake = stakeBalance && stakeBalance > 0n;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <span>⚡</span> Become an Oracle Node
        </h1>
        <p className="text-gray-600 text-sm mt-1">Stake ETH to join the ProvAI oracle network and earn rewards for verified data</p>
      </div>

      {/* ── Requirements Banner ────────────────────────────────────────────── */}
      {!hasStake && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start space-x-4">
          <div className="text-3xl">📋</div>
          <div className="text-sm text-amber-900">
            <strong className="font-bold text-amber-950 block mb-1">Requirements to become an oracle node:</strong>
            <ul className="space-y-1">
              <li>✅ MetaMask wallet connected</li>
              <li>✅ ETH for staking (minimum 0.01 ETH recommended)</li>
              <li>✅ Run the AI engine locally (<code className="bg-amber-100 px-1 py-0.5 rounded text-amber-950">python ai-engine/app.py</code>)</li>
            </ul>
          </div>
        </div>
      )}

      {/* ── My Node Status ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">My Active Stake</div>
          <div className="text-3xl font-extrabold text-green-600">{formatEth(stakeBalance)} ETH</div>
          <div className="text-xs font-medium mt-1 text-gray-500">
            {hasStake ? '✅ Node Active' : '❌ Not staked'}
          </div>
        </div>
        <div className="card">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Reward Pool</div>
          <div className="text-3xl font-extrabold text-amber-600">{formatEth(rewardPool)} ETH</div>
          <div className="text-xs font-medium mt-1 text-gray-500">{poolBps / 100}% distributed per round</div>
        </div>
        <div className="card">
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Lifetime Rewards</div>
          <div className="text-3xl font-extrabold text-primary-600">{formatEth(myRewards)} ETH</div>
          <div className="text-xs font-medium mt-1 text-gray-500">Earned so far</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Stake ETH ────────────────────────────────────────────────────── */}
        <div className="card space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">⚡ Stake ETH</h2>
            <span className="badge-success">Collateral</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Lock ETH as collateral to activate your oracle node. Your stake is subject to
            confidence-tied slashing if you submit inaccurate data.
          </p>
          
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Stake Amount</label>
            <div className="relative">
              <input
                type="number"
                value={stakeAmount}
                onChange={e => setStakeAmount(e.target.value)}
                step="0.01"
                min="0.001"
                className="input-field pr-14"
                placeholder="0.01"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-500">ETH</span>
            </div>
          </div>

          <div className="flex gap-2">
            {['0.01', '0.05', '0.1', '0.5'].map(amt => (
              <button key={amt} onClick={() => setStakeAmount(amt)} className="flex-1 py-1 px-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-semibold transition-colors">
                {amt}
              </button>
            ))}
          </div>

          <button onClick={depositStake} disabled={staking} className="btn-primary w-full text-sm py-3 mt-2">
            {staking ? '⏳ Staking...' : '⚡ Deposit Stake'}
          </button>
        </div>

        {/* ── Fund Reward Pool ──────────────────────────────────────────────── */}
        <div className="card space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">💰 Fund Reward Pool</h2>
            <span className="badge-warning">Community</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Contribute ETH to the shared reward pool. This ETH is distributed to oracle nodes
            based on their confidence scores. Slashed stakes also flow back here.
          </p>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Fund Amount</label>
            <div className="relative">
              <input
                type="number"
                value={fundAmount}
                onChange={e => setFundAmount(e.target.value)}
                step="0.01"
                min="0.001"
                className="input-field pr-14"
                placeholder="0.05"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-500">ETH</span>
            </div>
          </div>

          <div className="flex gap-2">
            {['0.01', '0.05', '0.1', '1.0'].map(amt => (
              <button key={amt} onClick={() => setFundAmount(amt)} className="flex-1 py-1 px-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-semibold transition-colors">
                {amt}
              </button>
            ))}
          </div>

          <button onClick={fundPool} disabled={funding} className="btn-secondary w-full text-sm py-3 mt-2">
            {funding ? '⏳ Funding...' : '💰 Fund Pool'}
          </button>
        </div>

        {/* ── Governance: Set BPS ───────────────────────────────────────────── */}
        <div className="card space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">⚙️ Pool Basis Points</h2>
            <span className="badge-purple">Governance</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Set what fraction of the reward pool is distributed per winning round (owner only).
            Range: 10 bps (0.1%) to 1000 bps (10%). Current: <strong className="text-gray-900">{poolBps} bps ({poolBps / 100}%)</strong>.
          </p>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">New BPS Value</label>
            <div className="relative">
              <input
                type="number"
                value={newBps}
                onChange={e => setNewBps(e.target.value)}
                min="10"
                max="1000"
                step="10"
                className="input-field pr-14"
                placeholder={`Current: ${poolBps}`}
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-500">bps</span>
            </div>
          </div>

          <button onClick={setPoolBps} disabled={settingBps} className="btn-outline w-full text-sm py-3 mt-2">
            {settingBps ? '⏳ Updating...' : '⚙️ Set BPS (Owner Only)'}
          </button>
        </div>
      </div>

      {/* ── Next Steps ──────────────────────────────────────────────────────── */}
      {hasStake && (
        <div className="card space-y-4 bg-gradient-to-r from-primary-50 to-white border-primary-200">
          <h2 className="text-lg font-bold text-gray-900">✅ You're an Active Oracle Node! Next Steps:</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/validator" className="p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-400 hover:shadow-md transition-all flex items-center justify-between group">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🤖</span>
                <div>
                  <div className="text-sm font-bold text-gray-900 group-hover:text-primary-600">Run AI Consensus</div>
                  <div className="text-xs text-gray-500">Submit verified data & earn</div>
                </div>
              </div>
              <span className="text-gray-400 group-hover:text-primary-600 font-bold">➔</span>
            </Link>
            <Link to="/query-data" className="p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-400 hover:shadow-md transition-all flex items-center justify-between group">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🔍</span>
                <div>
                  <div className="text-sm font-bold text-gray-900 group-hover:text-primary-600">Query Data</div>
                  <div className="text-xs text-gray-500">Test oracle data feeds</div>
                </div>
              </div>
              <span className="text-gray-400 group-hover:text-primary-600 font-bold">➔</span>
            </Link>
            <Link to="/leaderboard" className="p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-400 hover:shadow-md transition-all flex items-center justify-between group">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🏆</span>
                <div>
                  <div className="text-sm font-bold text-gray-900 group-hover:text-primary-600">View Leaderboard</div>
                  <div className="text-xs text-gray-500">Track rank and earnings</div>
                </div>
              </div>
              <span className="text-gray-400 group-hover:text-primary-600 font-bold">➔</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
