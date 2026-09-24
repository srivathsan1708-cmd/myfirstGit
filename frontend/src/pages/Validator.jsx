import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import { getSignerContract, CONTRACT_ADDRESS } from '../contract';
import { useWeb3 } from '../context/Web3Context';
import { useCompany } from '../context/CompanyContext';
import toast from 'react-hot-toast';

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconCopy  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;

const formatEth = w => { if (!w) return '0'; const e = Number(ethers.formatEther(w)); return e < 0.001 ? e.toExponential(2) : e.toFixed(6); };

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      title="Copy" className="p-1 text-gray-400 hover:text-gray-600">
      {copied ? <IconCheck /> : <IconCopy />}
    </button>
  );
}

// ─── Enterprise Request Templates ───────────────────────────────────────────
const DEFAULT_REQUESTS = [
  {
    id: 'weather',
    company: 'AgriShield Crop Insurance Co.',
    requestTitle: 'Verify Mumbai Weather & Rainfall',
    type: 'weather',
    query: 'Mumbai',
    unit: '°C',
    nodes: [28.5, 28.3, 28.7, 28.4, 28.6, 50.0], // 5 honest nodes + 1 attacker spike (50.0°C)
    description: 'Verify weather and rainfall conditions to process parametric insurance payouts.',
  },
  {
    id: 'flight',
    label: 'Parametric Air Travel Insurance',
    company: 'SkyProtect Travel Insurance',
    requestTitle: 'Verify Flight BA123 Delay Status',
    type: 'flight',
    query: 'BA123',
    unit: 'mins delay',
    nodes: [148, 147, 150, 149, 146, 0], // 5 honest nodes + 1 rogue node (0 min delay)
    description: 'Determine if flight delay exceeds 120-minute policy threshold for automatic passenger refund.',
  },
  {
    id: 'crypto',
    company: 'Aave / Compound DeFi Protocol',
    requestTitle: 'Verify Bitcoin Market Price Feed',
    type: 'crypto',
    query: 'bitcoin',
    unit: 'USD',
    nodes: [64200, 64150, 64220, 64180, 64210, 95000], // 5 honest nodes + 1 flash-price spoof ($95k)
    description: 'Fetch multi-exchange Bitcoin prices to update lending collateral ratios safely.',
  },
];

export default function Validator() {
  const { account, isConnected, stakeBalance, rewardPool, poolBps, connectWallet, refreshAll } = useWeb3();
  const { companyRequests, updateRequestStatus } = useCompany();
  const location = useLocation();

  // Combine default requests with company portal created requests
  const formattedCompanyRequests = companyRequests.map(r => ({
    id: r.id,
    company: r.companyName || 'Enterprise Partner',
    requestTitle: r.requestTitle,
    type: r.type,
    query: r.query,
    unit: r.unit || (r.weatherMetric === 'temperature' ? '°C' : 'Units'),
    weatherMetric: r.weatherMetric || (r.unit === '°C' ? 'temperature' : 'rainfall'),
    timeframe: r.timeframe || 'today',
    nodes: r.nodes || [100, 101, 99, 100.5, 99.8, 150],
    description: r.description || `Verify real-world parameters for ${r.query}`,
  }));

  const allRequests = [...formattedCompanyRequests, ...DEFAULT_REQUESTS];

  // Selected Enterprise Request
  const [selectedReq, setSelectedReq] = useState(allRequests[0]);
  const [customQuery, setCustomQuery] = useState(allRequests[0].query);
  const [dataPoints, setDataPoints]   = useState(allRequests[0].nodes);

  // Auto-select request if passed via navigation state from Enterprise Portal
  useEffect(() => {
    if (location.state?.customRequest) {
      const cr = location.state.customRequest;
      const reqObj = {
        id: cr.id,
        company: cr.companyName || 'Enterprise Partner',
        requestTitle: cr.requestTitle,
        type: cr.type,
        query: cr.query,
        unit: cr.unit || (cr.weatherMetric === 'temperature' ? '°C' : 'Units'),
        weatherMetric: cr.weatherMetric || (cr.unit === '°C' ? 'temperature' : 'rainfall'),
        timeframe: cr.timeframe || 'today',
        nodes: cr.nodes || [100, 101, 99, 100.5, 99.8, 150],
        description: cr.description,
      };
      setSelectedReq(reqObj);
      setCustomQuery(reqObj.query);
      setDataPoints(reqObj.nodes);
    }
  }, [location.state]);

  // States
  const [loading,       setLoading]       = useState(false);
  const [fetchingLive,  setFetchingLive]  = useState(false);
  const [result,        setResult]        = useState(null);
  const [submitting,    setSubmitting]    = useState(false);
  const [txHash,        setTxHash]        = useState(null);
  const [onChainRecord, setOnChainRecord] = useState(null);
  const [editingIdx,    setEditingIdx]    = useState(null);
  const [editValue,     setEditValue]     = useState('');
  const [newValue,      setNewValue]      = useState('');

  // Switch request template
  const selectRequestTemplate = req => {
    setSelectedReq(req);
    setCustomQuery(req.query);
    setDataPoints(req.nodes);
    setResult(null);
    setTxHash(null);
    setOnChainRecord(null);
  };

  // Current active unit (adjusts dynamically for weather metrics)
  const activeUnit = selectedReq.type === 'weather'
    ? ((selectedReq.weatherMetric || (selectedReq.unit === '°C' ? 'temperature' : 'rainfall')) === 'temperature' ? '°C' : 'mm')
    : selectedReq.unit;

  // Fetch Live Real Data from Public APIs
  const fetchLiveRealWorldData = async () => {
    const q = customQuery.trim();
    if (!q) { toast.error('Enter a query'); return; }

    setFetchingLive(true);
    setResult(null);
    try {
      let url;
      const metric = selectedReq.weatherMetric || (selectedReq.unit === '°C' ? 'temperature' : 'rainfall');
      const timeframe = selectedReq.timeframe || 'today';

      if (selectedReq.type === 'weather') {
        url = `http://localhost:5001/weather/${encodeURIComponent(q)}?timeframe=${timeframe}&metric=${metric}`;
      } else if (selectedReq.type === 'crypto') {
        url = `http://localhost:5001/crypto/${encodeURIComponent(q.toLowerCase())}`;
      } else if (selectedReq.type === 'flight') {
        url = `http://localhost:5001/flight/${encodeURIComponent(q.toUpperCase())}`;
      } else {
        url = `http://localhost:5001/weather/${encodeURIComponent(q)}?timeframe=${timeframe}&metric=${metric}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || data.valid === false) {
        toast.error('❌ ' + (data.error || 'Invalid request parameters'), { duration: 5000 });
        return;
      }

      const liveVals = data.sources.map(s => s.value ?? s.temperature ?? s.price ?? s.delay_minutes);
      setDataPoints(liveVals);
      const metricLabel = data.metric || 'Data';
      toast.success(`✅ Loaded ${liveVals.length} real-world oracle node readings for ${metricLabel} (${data.city || q})`);
    } catch {
      toast.error('Could not reach AI engine on port 5001');
    } finally {
      setFetchingLive(false);
    }
  };

  // Run AI Consensus & Calculate System Confidence
  const runAIConsensus = async () => {
    setLoading(true);
    setResult(null);
    setTxHash(null);
    setOnChainRecord(null);

    try {
      const res = await fetch('http://localhost:5001/universal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric_name: `${selectedReq.company} — ${selectedReq.requestTitle}`,
          unit: activeUnit,
          node_data: dataPoints,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.valid === false) {
        toast.error(data.error || 'Consensus execution failed');
        return;
      }

      setResult(data);

      const confidence = data.consensus?.confidence ?? 0;
      const finalVal   = data.consensus?.final_value;

      if (confidence >= 95) {
        toast.success(`✅ System Confidence: ${confidence.toFixed(1)}% (>= 95% Gate PASSED)`);
        if (selectedReq?.id) {
          updateRequestStatus(selectedReq.id, 'Verified On-Chain', Math.round(confidence), finalVal);
        }
      } else {
        toast.error(`🚫 System Confidence: ${confidence.toFixed(1)}% (< 95% Gate FAILED — Cannot Anchor On-Chain)`);
      }
    } catch {
      toast.error('AI engine unreachable on port 5001');
    } finally {
      setLoading(false);
    }
  };

  const handleDepositStake = async () => {
    if (!isConnected) {
      connectWallet();
      return;
    }
    try {
      const contract = await getSignerContract();
      const stakeToast = toast.loading('Depositing 0.1 ETH node stake on-chain...');
      const stakeTx = await contract.depositStake({ value: ethers.parseEther("0.1") });
      await stakeTx.wait();
      toast.success('0.1 ETH Node Stake Deposited! 🎉', { id: stakeToast });
      await refreshAll(account);
    } catch (err) {
      toast.error(err.reason || err.message?.slice(0, 80) || 'Stake deposit failed');
    }
  };

  // Submit Verified Data to Blockchain (Enforces >= 95% confidence & >= 0.1 ETH Node Stake)
  const submitToBlockchain = async () => {
    if (result?.consensus?.final_value === undefined || result?.consensus?.final_value === null) return;

    const conf = result.consensus.confidence ?? 0;
    if (conf < 95) {
      toast.error('🚫 Blocked: System Confidence is below 95%. Only confidence >= 95% can be anchored on-chain.');
      return;
    }

    setSubmitting(true);

    try {
      const contract = await getSignerContract();

      // Enforce minimum required 0.1 ETH stake
      const minStakeWei = ethers.parseEther("0.1");
      if (!stakeBalance || stakeBalance < minStakeWei) {
        const stakeToast = toast.loading('Depositing required 0.1 ETH node stake on-chain...');
        const stakeTx = await contract.depositStake({ value: ethers.parseEther("0.1") });
        await stakeTx.wait();
        toast.success('Minimum 0.1 ETH stake deposited! Now anchoring data...', { id: stakeToast });
      }

      const requestId   = ethers.id(JSON.stringify(dataPoints) + Date.now());
      const scaledValue = BigInt(Math.round(result.consensus.final_value * 100));
      const confidence  = BigInt(Math.round(conf));
      const devScore    = BigInt(result.consensus.deviation_severity_bps ?? 0);

      const txToast = toast.loading('Executing submitVerifiedData() on Smart Contract...');
      const tx = await contract.submitVerifiedData(requestId, scaledValue, confidence, devScore, { gasLimit: 250000n });
      const receipt = await tx.wait();

      toast.success('Verified Data Successfully Anchored On Blockchain! 🎉', { id: txToast });
      setTxHash(receipt.hash);
      setOnChainRecord({
        contractAddress: CONTRACT_ADDRESS,
        blockNumber: receipt.blockNumber,
        value: result.consensus.final_value,
        unit: activeUnit,
        confidence: Math.round(conf),
        timestamp: new Date().toLocaleTimeString(),
      });

      if (selectedReq?.id) {
        updateRequestStatus(selectedReq.id, 'Verified On-Chain', Math.round(conf), result.consensus.final_value);
      }

      await refreshAll(account);
    } catch (err) {
      toast.error(err.reason || err.message?.slice(0, 80) || 'Transaction failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Node editing
  const startEdit  = i => { setEditingIdx(i); setEditValue(String(dataPoints[i])); };
  const commitEdit = i => {
    const v = Number(editValue);
    if (!isNaN(v) && editValue.trim() !== '') setDataPoints(pts => pts.map((p, j) => j === i ? v : p));
    setEditingIdx(null);
  };
  const removePoint = i => setDataPoints(pts => pts.filter((_, j) => j !== i));
  const addPoint = () => {
    const v = Number(newValue);
    if (!isNaN(v) && newValue.trim() !== '') { setDataPoints(pts => [...pts, v]); setNewValue(''); }
  };

  const confidence = result?.consensus?.confidence ?? 0;
  const isGatePassed = confidence >= 95;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">

      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 text-primary-700 text-xs font-bold border border-primary-200 shadow-sm">
          <span>🏛️</span> Enterprise Data Request Oracle Network
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Verify & Filter Data Before Blockchain Entry</h1>
        <p className="text-sm text-gray-600">Companies request reliable data. Oracle nodes fetch real values. AI filters false feeders and anchors data on-chain <strong>only when Confidence ≥ 95%</strong>.</p>
      </div>

      {/* ── SECTION 1: Company / Enterprise Request ───────────────────────── */}
      <div className="card space-y-4 border-2 border-primary-200">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span>🏢</span> Step 1: Enterprise Data Request
            </h2>
            <p className="text-xs text-gray-500">Select an enterprise request or type custom parameters</p>
          </div>
          <span className="badge-info text-xs">{selectedReq.company}</span>
        </div>

        {/* Request selector chips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {allRequests.map(req => (
            <button
              key={req.id}
              onClick={() => selectRequestTemplate(req)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedReq.id === req.id
                  ? 'bg-primary-50 border-primary-500 text-primary-900 ring-2 ring-primary-500/20 font-bold'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="text-xs text-primary-600 font-semibold truncate">{req.company}</div>
              <div className="text-sm font-bold text-gray-900 mt-1 leading-snug">{req.requestTitle}</div>
            </button>
          ))}
        </div>

        {/* Enterprise Parameters Badge */}
        {selectedReq.type === 'weather' && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-800">Enterprise Parameters:</span>
              <span className="badge-info font-bold uppercase">
                {selectedReq.weatherMetric === 'temperature' ? '🌡️ Temperature (°C)' : '🌧️ Rainfall (mm)'}
              </span>
              <span className="badge-purple font-bold uppercase">
                {selectedReq.timeframe === 'month' ? '🗓️ 30-Day Cumulative' : '📅 Today\'s Live Data'}
              </span>
            </div>
            <span className="text-gray-500 font-mono text-[11px]">
              Configured via Enterprise Portal
            </span>
          </div>
        )}

        {/* Input box to query live data */}
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={customQuery}
            onChange={e => setCustomQuery(e.target.value)}
            placeholder="Enter location / query (e.g. Mumbai, BA123, bitcoin)..."
            className="input-field flex-1 text-sm font-mono"
          />
          <button
            onClick={fetchLiveRealWorldData}
            disabled={fetchingLive}
            className="btn-primary text-xs px-5 font-bold whitespace-nowrap"
          >
            {fetchingLive ? '⏳ Fetching Live APIs...' : '⚡ Fetch Real-World Data'}
          </button>
        </div>
      </div>

      {/* ── SECTION 2: Real-World Oracle Node Readings & Staking Status ───── */}
      <div className="card space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span>📡</span> Step 2: Multi-Source Real Oracle Node Readings ({dataPoints.length} Nodes)
            </h2>
            <p className="text-xs text-gray-500">Only node operators with min 0.1 ETH stake can submit. Honest nodes earn rewards; cheat nodes get slashed.</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="text-right">
              <div className="text-gray-500 text-[11px]">Required Minimum Deposit:</div>
              <div className="font-mono font-bold text-primary-700">0.1 ETH</div>
            </div>
            {isConnected ? (
              stakeBalance && stakeBalance >= ethers.parseEther("0.1") ? (
                <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full font-bold text-xs flex items-center gap-1 border border-green-300">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Staked ({formatEth(stakeBalance)} ETH)
                </span>
              ) : (
                <button
                  onClick={handleDepositStake}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs shadow transition-all flex items-center gap-1"
                >
                  ⚡ Stake 0.1 ETH Now
                </button>
              )
            ) : (
              <button
                onClick={connectWallet}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-xs transition-all"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* Node readings list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {dataPoints.map((v, i) => {
            const trace = result?.consensus?.reasoning_trace?.[i];
            const isOutlier = trace?.status === 'outlier';
            const isValid = trace?.status === 'valid';

            return (
              <div
                key={i}
                className={`p-3.5 rounded-xl border font-mono text-xs space-y-1.5 transition-all ${
                  isOutlier ? 'bg-red-50 border-red-300 text-red-900 shadow-sm' :
                  isValid   ? 'bg-green-50 border-green-300 text-green-900' :
                  'bg-gray-50 border-gray-200 text-gray-800 hover:border-primary-300'
                }`}
              >
                <div className="flex justify-between items-center text-[11px] font-sans">
                  <span className="font-bold text-gray-600">Oracle Node {i+1}</span>
                  {isOutlier && <span className="px-1.5 py-0.5 bg-red-200 text-red-900 font-bold rounded text-[10px]">⚔️ ATTACKER / SLASHED</span>}
                  {isValid   && <span className="px-1.5 py-0.5 bg-green-200 text-green-900 font-bold rounded text-[10px]">🎁 HONEST / REWARDED</span>}
                </div>

                <div className="flex items-center justify-between text-base font-extrabold">
                  {editingIdx === i ? (
                    <input
                      autoFocus
                      type="number"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={() => commitEdit(i)}
                      onKeyDown={e => { if (e.key === 'Enter') commitEdit(i); if (e.key === 'Escape') setEditingIdx(null); }}
                      className="w-24 bg-white border border-gray-300 px-1 py-0.5 rounded outline-none font-mono text-sm"
                    />
                  ) : (
                    <span onClick={() => startEdit(i)} className="cursor-pointer">
                      {v} <span className="text-xs font-sans text-gray-600">{activeUnit}</span>
                    </span>
                  )}
                  <button onClick={() => removePoint(i)} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Node controls */}
        <div className="flex gap-2 max-w-xs pt-1">
          <input
            type="number"
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addPoint()}
            placeholder={`Add node value (${activeUnit})...`}
            className="input-field text-xs font-mono py-1.5"
          />
          <button onClick={addPoint} className="btn-secondary text-xs px-3 whitespace-nowrap">+ Add Node</button>
        </div>
      </div>

      {/* ── SECTION 3: Run AI Consensus Button ───────────────────────────── */}
      <div className="text-center">
        <button
          onClick={runAIConsensus}
          disabled={loading || dataPoints.length < 2}
          className="btn-primary px-10 py-4 text-base font-extrabold shadow-xl hover:scale-105 transition-all"
        >
          {loading ? '⏳ Analyzing 3-Model AI Ensemble...' : '▶ Run AI Consensus Engine'}
        </button>
      </div>

      {/* ── SECTION 4: AI Consensus Result & Strict 95% Confidence Gate ────── */}
      {result && (
        <div className={`card space-y-6 border-2 ${isGatePassed ? 'border-green-400 bg-green-50/30' : 'border-red-400 bg-red-50/30'}`}>
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <span>🤖</span> AI System Analysis Result
              </h2>
              <p className="text-xs text-gray-500">{selectedReq.company} — {selectedReq.requestTitle}</p>
            </div>
            <div className="text-right">
              <span className={`text-sm px-3 py-1 rounded-full font-black ${isGatePassed ? 'bg-green-200 text-green-950' : 'bg-red-200 text-red-950'}`}>
                System Confidence: {confidence.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Verified Value & Confidence Gate Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl border text-center shadow-sm space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Computed AI Consensus Value</div>
              <div className="text-4xl sm:text-5xl font-black font-mono text-primary-700">
                {result.consensus?.final_value} <span className="text-xl text-gray-600 font-sans">{activeUnit}</span>
              </div>
              <div className="text-xs text-gray-500">
                Verified across {result.consensus?.valid_count} honest nodes · {result.consensus?.outlier_count} attacker node(s) isolated
              </div>
            </div>

            {/* Strict 95% Confidence Gate Banner */}
            <div className={`p-6 rounded-2xl border flex flex-col justify-center text-center space-y-2 ${isGatePassed ? 'bg-emerald-100/70 border-emerald-300 text-emerald-950' : 'bg-red-100/70 border-red-300 text-red-950'}`}>
              <div className="text-xs font-bold uppercase tracking-wider">Blockchain Entry Gate Status</div>
              <div className="text-xl sm:text-2xl font-black">
                {isGatePassed ? '✅ 95% Confidence Gate PASSED' : '🚫 95% Confidence Gate FAILED'}
              </div>
              <p className="text-xs leading-relaxed">
                {isGatePassed
                  ? `System confidence is ${confidence.toFixed(1)}% (>= 95%). This data is verified and authorized for blockchain anchoring.`
                  : `System confidence is ${confidence.toFixed(1)}% (< 95%). Data is blocked from entering the blockchain.`}
              </p>
            </div>
          </div>

          {/* Staking, Slashing & Rewards Summary */}
          <div className="bg-white p-4 rounded-xl border space-y-2 text-xs">
            <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">Node Economic Incentives Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-1">
                <span className="font-bold text-green-800 block">🎁 Honest Nodes ({result.consensus?.valid_count}) — ETH Rewards Earned</span>
                <p className="text-green-700 text-[11px]">Consistently provided accurate real data. Earned confidence-scaled ETH rewards from the reward pool.</p>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-1">
                <span className="font-bold text-red-800 block">⚔️ Attacker Nodes ({result.consensus?.outlier_count}) — Slashed & Penalized</span>
                <p className="text-red-700 text-[11px]">Attempted to false-feed bad data. Isolated by AI engine and penalized via stake slashing.</p>
              </div>
            </div>
          </div>

          {/* Submit to Blockchain Button (Gated strictly by >= 95% confidence) */}
          <div className="pt-2 text-center space-y-3">
            {!isConnected ? (
              <button onClick={connectWallet} className="btn-secondary w-full py-3 text-sm font-bold">
                Connect Wallet to Anchor On-Chain
              </button>
            ) : isGatePassed ? (
              <button
                onClick={submitToBlockchain}
                disabled={submitting}
                className="btn-primary w-full py-4 text-base font-extrabold shadow-xl"
              >
                {submitting ? '⏳ Anchoring Verified Data On Blockchain...' : '⛓️ Anchor Verified Data On Blockchain'}
              </button>
            ) : (
              <div className="p-3 bg-red-100 border border-red-300 text-red-900 rounded-xl text-xs font-bold">
                🚫 Blockchain Anchoring Disabled — Requires System Confidence ≥ 95%
              </div>
            )}

            {/* On-chain confirmation record */}
            {onChainRecord && (
              <div className="bg-white border border-green-300 rounded-xl p-4 text-xs font-mono text-left space-y-1.5 shadow-sm">
                <div className="flex justify-between items-center font-bold text-green-700 border-b pb-1.5">
                  <span>⛓️ ANCHORED ON ETHEREUM HARDHAT SMART CONTRACT</span>
                  <span>CONFIDENCE {onChainRecord.confidence}% ✓</span>
                </div>
                <div className="text-gray-700">Contract Address: <span className="font-semibold text-gray-900">{onChainRecord.contractAddress}</span></div>
                <div className="text-gray-700">Block Number: <strong className="text-gray-900">#{onChainRecord.blockNumber}</strong></div>
                <div className="text-gray-700">Stored Value: <strong className="text-primary-700">{onChainRecord.value} {onChainRecord.unit}</strong></div>
                <div className="text-gray-500 text-[11px] truncate flex items-center justify-between pt-1 border-t">
                  <span>Tx Hash: {txHash}</span>
                  <CopyButton text={txHash} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
