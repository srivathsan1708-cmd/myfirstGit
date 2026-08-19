import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { getSignerContract, getAddress, CONTRACT_ADDRESS } from './contract'

// ─── Icons ───────────────────────────────────────────────────────────────────
const IconWallet      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
const IconChain       = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
const IconCpu         = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
const IconActivity    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
const IconCheck       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconAlert       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
const IconCopy        = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
const IconPlus        = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IconTrash       = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
const IconLock        = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const IconShield      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const IconZap         = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
const IconKey         = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
const IconEye         = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IconBrain       = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
const IconStar        = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const IconTrophy      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>
const IconDroplets    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>

// ─── Helpers ──────────────────────────────────────────────────────────────────
const shortenAddr = a => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : ''
const formatEth   = w => { if (!w) return '0'; const e = Number(ethers.formatEther(w)); return e < 0.001 ? e.toExponential(2) : e.toFixed(4) }
const ts          = ()  => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

// ─── Small Reusable Components ────────────────────────────────────────────────
function Spinner() {
  return <span style={{ display:'inline-block', width:14, height:14, border:'2px solid rgba(255,255,255,0.2)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite', marginRight:6, verticalAlign:'middle' }} />
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      title="Copy" style={{ background:'none', border:'none', cursor:'pointer', color: copied ? '#34d399' : '#64748b', padding:'2px 4px', borderRadius:4, transition:'color 0.2s' }}>
      {copied ? <IconCheck /> : <IconCopy />}
    </button>
  )
}

// ─── Model Weight Ring (SVG arc gauge) ────────────────────────────────────────
function ModelWeightRing({ label, weight, color }) {
  const r  = 26, cx = 36, cy = 36
  const circ = 2 * Math.PI * r
  const dash = circ * weight
  return (
    <div className="weight-ring-wrap">
      <div style={{ position: 'relative', width: 72, height: 72 }}>
        <svg width={72} height={72} viewBox="0 0 72 72">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={7} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={7}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 4px ${color})` }}
          />
        </svg>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center' }}>
          <div style={{ fontSize:12, fontWeight:700, color, fontFamily:'var(--font-mono)', lineHeight:1 }}>
            {Math.round(weight * 100)}%
          </div>
        </div>
      </div>
      <div className="weight-ring-label">{label}</div>
    </div>
  )
}

// ─── Attack Node Graph ────────────────────────────────────────────────────────
function AttackNodeGraph({ trace, honestCount }) {
  if (!trace || !trace.length) return null
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:10, padding:'16px 0' }}>
      {trace.map((node, i) => {
        const isMalicious = i >= honestCount
        const caught      = node.status === 'outlier'
        let color, bg, glow, tooltip
        if (isMalicious && caught)      { color='#ef4444'; bg='rgba(239,68,68,0.15)';    glow='rgba(239,68,68,0.4)';    tooltip='Malicious — Caught ✓' }
        else if (isMalicious && !caught){ color='#f59e0b'; bg='rgba(245,158,11,0.15)';   glow='rgba(245,158,11,0.4)';   tooltip='Malicious — Evaded ⚠' }
        else if (!isMalicious && caught){ color='#f59e0b'; bg='rgba(245,158,11,0.15)';   glow='rgba(245,158,11,0.4)';   tooltip='Honest — False Positive ⚠' }
        else                            { color='#10b981'; bg='rgba(16,185,129,0.15)';   glow='rgba(16,185,129,0.4)';   tooltip='Honest — Valid ✓' }
        return (
          <div key={i} className={`attack-node ${isMalicious ? 'malicious' : ''}`}
            title={`Node ${node.node} | Value: ${node.value}\n${tooltip}\n${node.reason}`}
            style={{ background: bg, border:`2px solid ${color}`, color, boxShadow: isMalicious ? `0 0 10px ${glow}` : 'none' }}>
            {node.node}
          </div>
        )
      })}
    </div>
  )
}

// ─── Detection Rate Bar ───────────────────────────────────────────────────────
function DetectBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <span style={{ fontSize:12, color:'#64748b' }}>{label}</span>
        <span style={{ fontSize:13, fontWeight:700, fontFamily:'var(--font-mono)', color }}>{value}%</span>
      </div>
      <div className="detect-bar-track">
        <div className="detect-bar-fill" style={{ width:`${value}%`, background:`linear-gradient(90deg, ${color}80, ${color})`, color }} />
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  // ── Tab ────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('validator')

  // ── Wallet ─────────────────────────────────────────────────────────────────
  const [account,      setAccount]      = useState(null)
  const [stakeBalance, setStakeBalance] = useState(null)

  // ── Oracle data input ──────────────────────────────────────────────────────
  const [dataPoints,  setDataPoints]  = useState([100, 102, 99, 101, 500])
  const [editingIdx,  setEditingIdx]  = useState(null)
  const [editValue,   setEditValue]   = useState('')
  const [newValue,    setNewValue]    = useState('')

  // ── Stake ──────────────────────────────────────────────────────────────────
  const [stakeAmount,   setStakeAmount]   = useState('0.01')
  const [staking,       setStaking]       = useState(false)
  const [stakeSuccess,  setStakeSuccess]  = useState(false)

  // ── AI Consensus ───────────────────────────────────────────────────────────
  const [result,       setResult]       = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [aiError,      setAiError]      = useState(null)
  const [scanningIdx,  setScanningIdx]  = useState(null)   // chip being scanned
  const [resultKey,    setResultKey]    = useState(0)      // bump to re-trigger reveal

  // ── Chain submission ───────────────────────────────────────────────────────
  const [submitting,  setSubmitting]  = useState(false)
  const [txHash,      setTxHash]      = useState(null)
  const [chainError,  setChainError]  = useState(null)

  // ── Attack Simulator ───────────────────────────────────────────────────────
  const [attackType,    setAttackType]    = useState('sybil')
  const [attackInt,     setAttackInt]     = useState(5)
  const [attackLoading, setAttackLoading] = useState(false)
  const [attackResult,  setAttackResult]  = useState(null)
  const [attackError,   setAttackError]   = useState(null)

  // ── ZK Proof ───────────────────────────────────────────────────────────────
  const [zkSource,  setZkSource]  = useState('weather_api_v2')
  const [zkValue,   setZkValue]   = useState('101')
  const [zkLoading, setZkLoading] = useState(false)
  const [zkResult,  setZkResult]  = useState(null)
  const [zkError,   setZkError]   = useState(null)

  // ── Rewards ────────────────────────────────────────────────────────────────
  const [rewardPool,      setRewardPoolBal]   = useState(null)
  const [myRewards,       setMyRewards]       = useState(null)
  const [fundAmount,      setFundAmount]      = useState('0.05')
  const [funding,         setFunding]         = useState(false)
  const [fundSuccess,     setFundSuccess]     = useState(false)
  const [leaderboard,     setLeaderboard]     = useState([])   // [{addr, earned}]
  const [poolBps,         setPoolBps]         = useState(100)
  const [projectedReward, setProjectedReward] = useState(null)

  // ── Activity log ───────────────────────────────────────────────────────────
  const [log, setLog] = useState([])
  const addLog = useCallback((type, msg, extra='') => {
    setLog(prev => [{ id: Date.now(), type, msg, extra, time: ts() }, ...prev].slice(0, 50))
  }, [])

  // ── Refresh stake + rewards ────────────────────────────────────────────────
  const refreshStake = useCallback(async addr => {
    if (!addr) return
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS,
        ['function stakes(address) view returns (uint256)'], provider)
      setStakeBalance(await contract.stakes(addr))
    } catch(_) {}
  }, [])

  const refreshRewards = useCallback(async addr => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, [
        'function rewardPool() view returns (uint256)',
        'function totalRewards(address) view returns (uint256)',
        'function poolBasisPoints() view returns (uint256)',
      ], provider)
      const [pool, bps] = await Promise.all([contract.rewardPool(), contract.poolBasisPoints()])
      setRewardPoolBal(pool)
      setPoolBps(Number(bps))
      if (addr) setMyRewards(await contract.totalRewards(addr))
    } catch(_) {}
  }, [])

  // Compute projected reward whenever result or pool changes
  useEffect(() => {
    if (!result || !result.consensus_reached || rewardPool === null) { setProjectedReward(null); return }
    const conf = Math.round(result.confidence)
    if (conf <= 95) { setProjectedReward(null); return }
    const pool = rewardPool
    const poolPerRound = (pool * BigInt(poolBps)) / 10000n
    const scaledFactor = BigInt(Math.round(((conf - 95) * 1000) / 5))
    let reward = (poolPerRound * scaledFactor) / 1000n
    if (reward > pool) reward = pool
    setProjectedReward(reward)
  }, [result, rewardPool, poolBps])

  // ── Connect wallet ─────────────────────────────────────────────────────────
  const connectWallet = async () => {
    try {
      const addr = await getAddress()
      setAccount(addr); setChainError(null)
      addLog('info', 'Wallet connected', shortenAddr(addr))
      await refreshStake(addr)
      await refreshRewards(addr)
    } catch(err) { setChainError(err.message) }
  }

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method:'eth_accounts' }).then(accs => {
        if (accs[0]) { setAccount(accs[0]); refreshStake(accs[0]); refreshRewards(accs[0]) }
      }).catch(() => {})
    }
  }, [refreshStake, refreshRewards])

  // ── Deposit stake ──────────────────────────────────────────────────────────
  const depositStake = async () => {
    setStaking(true); setChainError(null); setStakeSuccess(false)
    try {
      const contract = await getSignerContract()
      const tx = await contract.depositStake({ value: ethers.parseEther(stakeAmount), gasLimit: 100000n })
      addLog('pending', 'Stake tx sent', tx.hash.slice(0, 18) + '…')
      await tx.wait()
      setStakeSuccess(true)
      addLog('success', `Staked ${stakeAmount} ETH`, shortenAddr(account))
      await refreshStake(account)
    } catch(err) {
      setChainError(err.reason || err.message)
      addLog('error', 'Stake failed', err.reason || err.message?.slice(0, 60))
    } finally { setStaking(false) }
  }

  // ── Run 3-model weighted consensus ─────────────────────────────────────────
  const runConsensus = async () => {
    setLoading(true); setResult(null); setAiError(null); setTxHash(null)
    addLog('info', 'Weighted consensus started', `${dataPoints.length} nodes · 3 models`)

    // Staggered chip scan animation — cycle through each node chip
    const scanInterval = setInterval(() => {
      setScanningIdx(prev => {
        const next = (prev === null ? 0 : prev + 1)
        return next < dataPoints.length ? next : 0
      })
    }, 180)

    try {
      const r = await fetch('http://localhost:5001/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node_data: dataPoints })
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      clearInterval(scanInterval)
      setScanningIdx(null)
      setResultKey(k => k + 1)   // trigger reveal animation
      setResult(data)
      addLog(
        data.consensus_reached ? 'success' : 'warning',
        data.consensus_reached ? `Consensus: ${data.final_value}` : 'No consensus',
        `confidence ${Math.round(data.confidence)}% · ${data.outlier_count} outlier(s)`
      )
    } catch(err) {
      clearInterval(scanInterval)
      setScanningIdx(null)
      setAiError('Could not reach the AI engine on port 5001. Make sure it is running.')
      addLog('error', 'AI engine unreachable', 'localhost:5001')
    } finally { setLoading(false) }
  }

  // ── Submit to blockchain (now with deviationScore) ─────────────────────────
  const submitToChain = async () => {
    if (!result) return
    setSubmitting(true); setChainError(null)
    try {
      const contract      = await getSignerContract()
      const requestId     = ethers.id(JSON.stringify(dataPoints) + Date.now())
      const scaledValue   = BigInt(Math.round(result.final_value * 100))
      const confidence    = BigInt(Math.round(result.confidence))
      const devScore      = BigInt(result.deviation_severity_bps ?? 0)
      const tx = await contract.submitVerifiedData(requestId, scaledValue, confidence, devScore, { gasLimit: 200000n })
      addLog('pending', 'Chain tx sent', tx.hash.slice(0, 18) + '…')
      const receipt = await tx.wait()
      setTxHash(receipt.hash)
      addLog('success', 'Data anchored on-chain', receipt.hash.slice(0, 18) + '…')
      await refreshStake(account)
      await refreshRewards(account)
      // Log RewardPaid if emitted
      const rewardEvt = receipt.logs?.find(l => l.topics?.[0] === ethers.id('RewardPaid(address,uint256,uint256)'))
      if (rewardEvt) addLog('success', '🏆 Reward received!', `${formatEth(rewardEvt.data?.slice(0,66))} ETH earned`)
    } catch(err) {
      setChainError(err.reason || err.message)
      addLog('error', 'Submission failed', err.reason || err.message?.slice(0, 60))
    } finally { setSubmitting(false) }
  }

  // ── Attack simulation ──────────────────────────────────────────────────────
  const launchAttack = async () => {
    setAttackLoading(true); setAttackResult(null); setAttackError(null)
    addLog('warning', `Attack simulation: ${attackType}`, `intensity ${attackInt}`)
    try {
      const r = await fetch('http://localhost:5001/simulate-attack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node_data: dataPoints, attack_type: attackType, intensity: attackInt })
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      setAttackResult(data)
      addLog(
        data.detection_rate >= 80 ? 'success' : 'warning',
        `Detection rate: ${data.detection_rate}%`,
        `${data.malicious_count} attackers · ${data.true_positives} caught`
      )
    } catch(err) {
      setAttackError('Could not reach the AI engine on port 5001.')
      addLog('error', 'Attack sim failed', 'localhost:5001')
    } finally { setAttackLoading(false) }
  }

  // ── ZK Proof ───────────────────────────────────────────────────────────────
  const generateZkProof = async () => {
    setZkLoading(true); setZkResult(null); setZkError(null)
    addLog('info', 'ZK-Light proof generating…', zkSource)
    try {
      const r = await fetch('http://localhost:5001/zk-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_tag: zkSource, value: Number(zkValue) })
      })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      setZkResult(data)
      addLog('success', 'ZK proof generated', `${data.source_name} · key hidden`)
    } catch(err) {
      setZkError('Could not reach the AI engine on port 5001.')
      addLog('error', 'ZK proof failed', 'localhost:5001')
    } finally { setZkLoading(false) }
  }

  // ── Fund reward pool ───────────────────────────────────────────────────────
  const fundPool = async () => {
    setFunding(true); setFundSuccess(false); setChainError(null)
    try {
      const contract = await getSignerContract()
      const tx = await contract.fundRewardPool({ value: ethers.parseEther(fundAmount), gasLimit: 100000n })
      addLog('pending', 'Pool funding tx sent', tx.hash.slice(0, 18) + '…')
      await tx.wait()
      setFundSuccess(true)
      addLog('success', `Pool funded +${fundAmount} ETH`, shortenAddr(account))
      await refreshRewards(account)
    } catch(err) {
      setChainError(err.reason || err.message)
      addLog('error', 'Fund pool failed', err.reason || err.message?.slice(0, 60))
    } finally { setFunding(false) }
  }

  // ── Load leaderboard (scan RewardPaid events) ──────────────────────────────
  const loadLeaderboard = useCallback(async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, [
        'event RewardPaid(address indexed node, uint256 amount, uint256 confidence)',
        'function totalRewards(address) view returns (uint256)',
      ], provider)
      const filter = contract.filters.RewardPaid()
      const events = await contract.queryFilter(filter, 0, 'latest')
      const totals = {}
      events.forEach(e => {
        const addr = e.args[0]
        const amt  = e.args[1]
        totals[addr] = (totals[addr] || 0n) + amt
      })
      const sorted = Object.entries(totals)
        .sort((a, b) => (b[1] > a[1] ? 1 : -1))
        .slice(0, 10)
      setLeaderboard(sorted.map(([addr, earned]) => ({ addr, earned })))
    } catch(_) {}
  }, [])

  // ── Data point editing ─────────────────────────────────────────────────────
  const startEdit  = i => { setEditingIdx(i); setEditValue(String(dataPoints[i])) }
  const commitEdit = i => {
    const v = Number(editValue)
    if (!isNaN(v)) setDataPoints(prev => { const a=[...prev]; a[i]=v; return a })
    setEditingIdx(null)
  }
  const removePoint = i => { setDataPoints(prev => prev.filter((_,j) => j!==i)); setResult(null) }
  const addPoint    = () => {
    const v = Number(newValue)
    if (!isNaN(v) && newValue !== '') { setDataPoints(prev => [...prev, v]); setNewValue(''); setResult(null) }
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const confColor  = result ? (result.confidence > 80 ? '#10b981' : result.confidence > 50 ? '#f59e0b' : '#ef4444') : '#6366f1'
  const canSubmit  = result && account && result.confidence > 95 && !submitting

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ripple { 0%{ transform:scale(0.8); opacity:0.8; } 100%{ transform:scale(2.4); opacity:0; } }
      `}</style>

      <div style={{ position:'relative', zIndex:1, minHeight:'100vh', padding:'32px 24px', maxWidth:1280, margin:'0 auto' }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:32, flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
              <div style={{ width:40, height:40, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#22d3ee)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(99,102,241,0.5)' }}>
                <IconCpu />
              </div>
              <h1 style={{ fontSize:28, fontWeight:900, letterSpacing:'-0.03em', background:'linear-gradient(135deg,#a5b4fc 0%,#22d3ee 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                ProvAI Network
              </h1>
            </div>
            <p style={{ color:'#475569', fontSize:13, maxWidth:520 }}>
              Decentralized oracle · Weighted truth-discovery AI · Confidence-tied slashing · ZK-Light source proofs
            </p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
            {account ? (
              <div className="glass-card" style={{ padding:'10px 16px', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span className="badge badge-success"><span className="pulse-dot" />Connected</span>
                  <span className="mono" style={{ fontSize:13, color:'#94a3b8' }}>{shortenAddr(account)}</span>
                  <CopyButton text={account} />
                </div>
                {stakeBalance !== null && (
                  <span style={{ fontSize:11, color:'#475569' }}>
                    Stake: <span style={{ color:'#818cf8', fontFamily:'var(--font-mono)' }}>{formatEth(stakeBalance)} ETH</span>
                  </span>
                )}
              </div>
            ) : (
              <button className="btn-primary" onClick={connectWallet} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <IconWallet />Connect Wallet
              </button>
            )}
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#334155' }}>
              <IconChain />
              <span className="mono">{CONTRACT_ADDRESS.slice(0,10)}…{CONTRACT_ADDRESS.slice(-6)}</span>
              <CopyButton text={CONTRACT_ADDRESS} />
            </div>
          </div>
        </header>

        {/* ── Global error ─────────────────────────────────────────────────── */}
        {chainError && (
          <div className="glass-card slide-up" style={{ marginBottom:24, padding:'14px 18px', borderColor:'rgba(239,68,68,0.3)', background:'rgba(127,29,29,0.2)', display:'flex', alignItems:'flex-start', gap:10 }}>
            <span style={{ color:'#f87171', marginTop:1 }}><IconAlert /></span>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'#fca5a5', marginBottom:2 }}>Transaction Error</div>
              <div style={{ fontSize:12, color:'#f87171', fontFamily:'var(--font-mono)', wordBreak:'break-all' }}>{chainError}</div>
            </div>
            <button onClick={() => setChainError(null)} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'#7f1d1d', fontSize:18, lineHeight:1 }}>×</button>
          </div>
        )}

        {/* ── Tab Navigation ───────────────────────────────────────────────── */}
        <div className="tab-nav">
          <button id="tab-validator"  className={`tab-btn ${activeTab==='validator'  ? 'active' : ''}`} onClick={() => setActiveTab('validator')}>
            <IconCpu />Validator
          </button>
          <button id="tab-attack"     className={`tab-btn ${activeTab==='attack'     ? 'active' : ''}`} onClick={() => setActiveTab('attack')}>
            <IconShield />Attack Simulator
          </button>
          <button id="tab-zk"         className={`tab-btn ${activeTab==='zk'         ? 'active' : ''}`} onClick={() => setActiveTab('zk')}>
            <IconKey />ZK Proof
          </button>
          <button id="tab-rewards"    className={`tab-btn ${activeTab==='rewards'    ? 'active' : ''}`}
            onClick={() => { setActiveTab('rewards'); refreshRewards(account); loadLeaderboard() }}
            style={activeTab==='rewards' ? { borderColor:'#f59e0b', color:'#fbbf24' } : {}}>
            <IconTrophy />Rewards
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1 — VALIDATOR                                                */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'validator' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:24, alignItems:'start' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

              {/* ── Stake card ────────────────────────────────────────────── */}
              <div className="glass-card" style={{ padding:28 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.3)', display:'flex', alignItems:'center', justifyContent:'center', color:'#a78bfa' }}>
                    <IconLock />
                  </div>
                  <h2 style={{ fontSize:16, fontWeight:700, color:'#e2e8f0' }}>Node Stake</h2>
                  {stakeBalance !== null && stakeBalance > 0n && (
                    <span className="badge badge-success" style={{ marginLeft:'auto' }}><IconCheck />Staked</span>
                  )}
                </div>
                <p style={{ fontSize:12, color:'#475569', marginBottom:20 }}>
                  A non-zero stake is required before you can submit verified data on-chain. Dishonest submissions trigger confidence-tied slashing.
                </p>
                <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                  <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
                    <input type="number" step="0.001" min="0.001" value={stakeAmount}
                      onChange={e => setStakeAmount(e.target.value)}
                      className="input-field" style={{ width:120, paddingRight:44 }} />
                    <span style={{ position:'absolute', right:12, fontSize:12, color:'#475569', pointerEvents:'none' }}>ETH</span>
                  </div>
                  <button className="btn-purple" onClick={depositStake} disabled={staking||!account} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    {staking ? <><Spinner />Staking…</> : 'Deposit Stake'}
                  </button>
                  {stakeSuccess && !staking && <span className="badge badge-success fade-in"><IconCheck />Confirmed</span>}
                </div>
                {!account && <p style={{ marginTop:10, fontSize:11, color:'#92400e', display:'flex', alignItems:'center', gap:6 }}><IconAlert />Connect your wallet first</p>}
              </div>

              {/* ── Oracle feeds card ────────────────────────────────────── */}
              <div className={`glass-card${loading ? ' card-processing' : ''}`} style={{ padding:28, position:'relative' }}>
                {/* Neural sweep overlay while processing */}
                {loading && <div className="neural-overlay" />}

                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:'rgba(34,211,238,0.12)', border:'1px solid rgba(34,211,238,0.25)', display:'flex', alignItems:'center', justifyContent:'center', color:'#22d3ee', position:'relative' }}>
                    <IconActivity />
                    {/* Ripple when loading */}
                    {loading && (
                      <span style={{
                        position:'absolute', inset:0, borderRadius:8,
                        border:'1px solid rgba(34,211,238,0.6)',
                        animation:'oracleRipple 1.2s ease-out infinite'
                      }} />
                    )}
                  </div>
                  <h2 style={{ fontSize:16, fontWeight:700, color: loading ? '#22d3ee' : '#e2e8f0', transition:'color 0.3s' }}>Oracle Node Feeds</h2>
                  <span className="badge badge-info" style={{ marginLeft:'auto', fontSize:11 }}>{dataPoints.length} nodes</span>
                  {loading && (
                    <span className="badge badge-cyan" style={{ fontSize:10, letterSpacing:'0.08em' }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background:'#22d3ee', display:'inline-block', animation:'pulse 0.8s ease-in-out infinite' }} />
                      SCANNING
                    </span>
                  )}
                </div>

                <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
                  {dataPoints.map((dp, idx) => (
                    <div key={idx} className={`data-chip${scanningIdx === idx ? ' scanning' : ''}`} style={{ cursor:'pointer', alignItems:'center' }}>
                      <span style={{ color:'#475569', fontSize:11 }}>#{idx+1}</span>
                      {editingIdx === idx ? (
                        <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)}
                          onBlur={() => commitEdit(idx)} onKeyDown={e => e.key==='Enter' && commitEdit(idx)}
                          autoFocus style={{ background:'none', border:'none', outline:'none', width:60, color:'#a5b4fc', fontFamily:'var(--font-mono)', fontSize:13 }} />
                      ) : (
                        <span onClick={() => startEdit(idx)} style={{ color:'#a5b4fc', minWidth:24 }}>{dp}</span>
                      )}
                      <button onClick={() => removePoint(idx)} style={{ background:'none', border:'none', cursor:'pointer', color:'#334155', padding:'0 2px', lineHeight:1 }}>
                        <IconTrash />
                      </button>
                    </div>
                  ))}
                  <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <input type="number" placeholder="value" value={newValue} onChange={e => setNewValue(e.target.value)}
                      onKeyDown={e => e.key==='Enter' && addPoint()}
                      className="data-chip" style={{ width:80, border:'1px dashed rgba(99,102,241,0.3)', background:'transparent', outline:'none', color:'#e2e8f0', fontFamily:'var(--font-mono)', fontSize:13 }} />
                    <button onClick={addPoint} disabled={newValue===''} style={{ background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:8, padding:'6px 10px', cursor:'pointer', color:'#818cf8', opacity: newValue==='' ? 0.4 : 1, transition:'all 0.2s' }}>
                      <IconPlus />
                    </button>
                  </div>
                </div>

                <div className="divider" />

                <div style={{ background:'rgba(5,8,18,0.7)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:10, padding:'12px 16px', marginBottom:20, fontFamily:'var(--font-mono)', fontSize:12, color:'#64748b', lineHeight:1.6 }}>
                  <span style={{ color:'#475569' }}>input_vector = </span>
                  <span style={{ color:'#22d3ee' }}>[</span>
                  {dataPoints.map((v,i) => (
                    <span key={i}><span style={{ color:'#a5b4fc' }}>{v}</span>{i < dataPoints.length-1 && <span style={{ color:'#334155' }}>, </span>}</span>
                  ))}
                  <span style={{ color:'#22d3ee' }}>]</span>
                </div>

                <button
                  className={`btn-primary${loading ? ' validating' : ''}`}
                  onClick={runConsensus}
                  disabled={loading || dataPoints.length < 2}
                  style={{ display:'flex', alignItems:'center', gap:8, position:'relative', overflow:'hidden' }}
                >
                  {/* Shimmer sweep on the button while loading */}
                  {loading && (
                    <span style={{
                      position:'absolute', inset:0,
                      background:'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)',
                      backgroundSize:'200% 100%',
                      animation:'shimmer 1.2s linear infinite',
                      borderRadius:10,
                      pointerEvents:'none'
                    }} />
                  )}
                  {loading
                    ? <><Spinner />Scanning {dataPoints.length} nodes · 3-Model Inference…</>
                    : <><IconBrain />Execute ProvAI Validation</>}
                </button>

                {aiError && (
                  <div className="slide-up" style={{ marginTop:16, padding:'10px 14px', borderRadius:10, background:'rgba(127,29,29,0.2)', border:'1px solid rgba(239,68,68,0.2)', fontSize:12, color:'#f87171', display:'flex', gap:8 }}>
                    <IconAlert />{aiError}
                  </div>
                )}
              </div>

              {/* ── Verification result ──────────────────────────────────── */}
              {result && (
                <div key={resultKey} className="glass-card result-reveal" style={{ padding:28, borderColor:`${confColor}30` }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                    <h2 style={{ fontSize:16, fontWeight:700, color:'#e2e8f0' }}>ProvAI Verification Log</h2>
                    <span className={`badge ${result.consensus_reached ? 'badge-success' : 'badge-error'}`} style={{ marginLeft:'auto' }}>
                      <span className="pulse-dot" style={{ background: result.consensus_reached ? '#10b981' : '#ef4444' }} />
                      {result.consensus_reached ? 'Consensus Reached' : 'Consensus Failed'}
                    </span>
                  </div>

                  {/* Stat grid */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
                    <div className="stat-card stat-reveal" style={{ animationDelay:'0.1s' }}>
                      <div style={{ fontSize:11, color:'#475569', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>Resolved Value</div>
                      <div className="mono" style={{ fontSize:28, fontWeight:700, color:'#e2e8f0', letterSpacing:'-0.02em' }}>{result.final_value}</div>
                      <div style={{ fontSize:11, color:'#334155', marginTop:4 }}>scaled ×100 on-chain</div>
                    </div>
                    <div className="stat-card stat-reveal" style={{ animationDelay:'0.2s' }}>
                      <div style={{ fontSize:11, color:'#475569', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>Confidence Score</div>
                      <div className="mono" style={{ fontSize:28, fontWeight:700, color:confColor, letterSpacing:'-0.02em' }}>{Math.round(result.confidence)}%</div>
                      <div style={{ marginTop:10 }}>
                        <div className="confidence-bar-track">
                          <div className="confidence-bar-fill" style={{ width:`${result.confidence}%`, background:`linear-gradient(90deg,${confColor}80,${confColor})` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Node counts */}
                  <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
                    <div className="stat-reveal" style={{ flex:1, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:10, padding:'12px 16px', textAlign:'center', animationDelay:'0.25s' }}>
                      <div style={{ fontSize:20, fontWeight:700, color:'#34d399', fontFamily:'var(--font-mono)' }}>{result.valid_count}</div>
                      <div style={{ fontSize:11, color:'#475569', marginTop:2 }}>Valid Nodes</div>
                    </div>
                    <div className="stat-reveal" style={{ flex:1, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, padding:'12px 16px', textAlign:'center', animationDelay:'0.35s' }}>
                      <div style={{ fontSize:20, fontWeight:700, color:'#f87171', fontFamily:'var(--font-mono)' }}>{result.outlier_count}</div>
                      <div style={{ fontSize:11, color:'#475569', marginTop:2 }}>Outliers Flagged</div>
                    </div>
                    <div className="stat-reveal" style={{ flex:1, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, padding:'12px 16px', textAlign:'center', animationDelay:'0.45s' }}>
                      <div style={{ fontSize:20, fontWeight:700, color:'#fbbf24', fontFamily:'var(--font-mono)' }}>{result.deviation_severity_bps}</div>
                      <div style={{ fontSize:11, color:'#475569', marginTop:2 }}>Slash Severity (bps)</div>
                    </div>
                    {projectedReward !== null && projectedReward > 0n && (
                      <div className="stat-reveal" style={{ flex:1, background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:10, padding:'12px 16px', textAlign:'center', animationDelay:'0.55s', boxShadow:'0 0 20px rgba(245,158,11,0.1)' }}>
                        <div style={{ fontSize:10, color:'#92400e', marginBottom:4 }}>🏆 Projected Reward</div>
                        <div style={{ fontSize:20, fontWeight:700, color:'#fbbf24', fontFamily:'var(--font-mono)' }}>{parseFloat(ethers.formatEther(projectedReward)).toFixed(6)}</div>
                        <div style={{ fontSize:11, color:'#92400e', marginTop:2 }}>ETH on submit</div>
                      </div>
                    )}
                  </div>

                  {result.confidence <= 95 && (
                    <div style={{ marginBottom:16, padding:'10px 14px', borderRadius:10, background:'rgba(120,53,15,0.2)', border:'1px solid rgba(245,158,11,0.2)', fontSize:12, color:'#fbbf24', display:'flex', gap:8, alignItems:'center' }}>
                      <IconAlert />Confidence must exceed 95% to submit on-chain (contract requirement)
                    </div>
                  )}

                  <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center', marginBottom: txHash ? 0 : undefined }}>
                    <button className="btn-success" onClick={submitToChain} disabled={!canSubmit} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      {submitting ? <><Spinner />Submitting…</> : <><IconChain />Submit to Blockchain</>}
                    </button>
                    {!account && <span style={{ fontSize:12, color:'#92400e' }}>Connect wallet to submit</span>}
                  </div>

                  {txHash && (
                    <div className="slide-up" style={{ marginTop:20, padding:'14px 16px', borderRadius:10, background:'rgba(6,78,59,0.25)', border:'1px solid rgba(16,185,129,0.25)' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                        <span className="badge badge-success"><IconCheck />Confirmed on-chain</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span className="mono" style={{ fontSize:11, color:'#34d399', wordBreak:'break-all', flex:1 }}>{txHash}</span>
                        <CopyButton text={txHash} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── AI Reasoning Trace ────────────────────────────────────── */}
              {result && result.reasoning_trace && (
                <div className="glass-card slide-up" style={{ padding:28 }}>
                  {/* Header */}
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', display:'flex', alignItems:'center', justifyContent:'center', color:'#818cf8' }}>
                      <IconBrain />
                    </div>
                    <div>
                      <h2 style={{ fontSize:16, fontWeight:700, color:'#e2e8f0' }}>AI Reasoning Trace</h2>
                      <p style={{ fontSize:11, color:'#475569', marginTop:2 }}>Why each node was accepted or flagged — opening the black box</p>
                    </div>
                    <span className="badge badge-info" style={{ marginLeft:'auto' }}>
                      <IconEye />3-Model Ensemble
                    </span>
                  </div>

                  {/* Model weights */}
                  <div style={{ background:'rgba(5,8,18,0.5)', border:'1px solid rgba(99,102,241,0.12)', borderRadius:12, padding:'20px 24px', marginBottom:24 }}>
                    <div style={{ fontSize:11, color:'#475569', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16, fontWeight:600 }}>
                      Bayesian Model Weights (live · updates each round)
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-around', flexWrap:'wrap', gap:16 }}>
                      <ModelWeightRing label="Isolation Forest" weight={result.model_weights?.isolation_forest || 0.4}  color="#6366f1" />
                      <ModelWeightRing label="Local Outlier Factor" weight={result.model_weights?.lof || 0.35}          color="#22d3ee" />
                      <ModelWeightRing label="Z-Score Baseline" weight={result.model_weights?.zscore || 0.25}           color="#a78bfa" />
                    </div>
                    <div className="divider" style={{ marginTop:20, marginBottom:16 }} />
                    <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                      {Object.entries(result.model_votes || {}).map(([m, voted]) => (
                        <div key={m} style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <span style={{ width:8, height:8, borderRadius:'50%', background: voted ? '#10b981' : '#ef4444', display:'inline-block', boxShadow:`0 0 6px ${voted ? '#10b981' : '#ef4444'}` }} />
                          <span style={{ fontSize:11, color:'#64748b' }}>{m.replace('_',' ')}</span>
                          <span style={{ fontSize:11, color: voted ? '#34d399' : '#f87171', fontWeight:600 }}>{voted ? 'majority valid' : 'majority outlier'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Slash preview */}
                  {result.deviation_severity_bps > 0 && (
                    <div style={{ marginBottom:20, padding:'12px 16px', borderRadius:10, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', display:'flex', gap:10, alignItems:'center' }}>
                      <IconZap style={{ color:'#f87171' }} />
                      <div>
                        <div style={{ fontSize:12, fontWeight:600, color:'#fca5a5' }}>Confidence-Tied Slash Preview</div>
                        <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>
                          Worst outlier deviation → <span className="mono" style={{ color:'#fbbf24' }}>{result.deviation_severity_bps} bps</span> of stake would be slashed if submitted maliciously ({(result.deviation_severity_bps / 100).toFixed(1)}% of staked ETH)
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Per-node trace table */}
                  <div style={{ overflowX:'auto', borderRadius:10, border:'1px solid rgba(99,102,241,0.1)' }}>
                    <table className="trace-table">
                      <thead>
                        <tr>
                          <th>Node</th>
                          <th>Value</th>
                          <th>Z-Score</th>
                          <th>IF Score</th>
                          <th>LOF Score</th>
                          <th>Status</th>
                          <th>AI Reasoning</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.reasoning_trace.map(node => (
                          <tr key={node.node}>
                            <td><span className="mono" style={{ color:'#64748b' }}>#{node.node}</span></td>
                            <td><span className="mono" style={{ color:'#a5b4fc', fontWeight:600 }}>{node.value}</span></td>
                            <td>
                              <span className="mono" style={{ color: node.z_score > 2.5 ? '#f87171' : '#34d399' }}>{node.z_score.toFixed(2)}</span>
                            </td>
                            <td>
                              <span className="mono" style={{ color: node.if_score < 0.4 ? '#f87171' : '#34d399' }}>{node.if_score.toFixed(2)}</span>
                            </td>
                            <td>
                              <span className="mono" style={{ color: node.lof_score < 0.4 ? '#f87171' : '#34d399' }}>{node.lof_score.toFixed(2)}</span>
                            </td>
                            <td>
                              <span className={`badge ${node.status === 'valid' ? 'badge-success' : 'badge-error'}`} style={{ fontSize:10 }}>
                                {node.status === 'valid' ? '✓ Valid' : '✗ Outlier'}
                              </span>
                            </td>
                            <td style={{ maxWidth:260, color:'#475569', fontSize:11, lineHeight:1.5 }}>{node.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right column: Activity Log ──────────────────────────────── */}
            <div className="glass-card" style={{ padding:24, position:'sticky', top:24 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', display:'flex', alignItems:'center', justifyContent:'center', color:'#818cf8' }}>
                  <IconActivity />
                </div>
                <h2 style={{ fontSize:14, fontWeight:700, color:'#94a3b8' }}>Activity Log</h2>
                {log.length > 0 && (
                  <button onClick={() => setLog([])} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:11, color:'#334155' }}>Clear</button>
                )}
              </div>
              {log.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 0', color:'#1e293b' }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>◌</div>
                  <div style={{ fontSize:12 }}>No activity yet</div>
                </div>
              ) : (
                <div style={{ maxHeight:480, overflowY:'auto' }}>
                  {log.map(entry => {
                    const c = { success:{ dot:'#10b981', text:'#34d399' }, error:{ dot:'#ef4444', text:'#f87171' }, warning:{ dot:'#f59e0b', text:'#fbbf24' }, pending:{ dot:'#f59e0b', text:'#94a3b8' }, info:{ dot:'#6366f1', text:'#94a3b8' } }[entry.type] || { dot:'#475569', text:'#94a3b8' }
                    return (
                      <div key={entry.id} className="log-entry">
                        <div style={{ marginTop:4 }}>
                          <div style={{ width:7, height:7, borderRadius:'50%', background:c.dot, boxShadow:`0 0 6px ${c.dot}` }} />
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12, color:c.text, fontWeight:500 }}>{entry.msg}</div>
                          {entry.extra && <div className="mono" style={{ fontSize:10, color:'#334155', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{entry.extra}</div>}
                        </div>
                        <div style={{ fontSize:10, color:'#1e293b', whiteSpace:'nowrap', marginTop:2, fontFamily:'var(--font-mono)' }}>{entry.time}</div>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="divider" style={{ marginTop:24 }} />
              <div style={{ fontSize:11, color:'#1e293b' }}>
                {[['Network','Hardhat Local · 31337'],['RPC','127.0.0.1:8545'],['AI Engine','127.0.0.1:5001']].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span>{k}</span><span className="mono" style={{ color:'#334155' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 2 — ATTACK SIMULATOR                                         */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'attack' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:24, alignItems:'start' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

              {/* Attack config card */}
              <div className="glass-card" style={{ padding:28 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.25)', display:'flex', alignItems:'center', justifyContent:'center', color:'#f87171' }}>
                    <IconShield />
                  </div>
                  <h2 style={{ fontSize:16, fontWeight:700, color:'#e2e8f0' }}>Adversarial Network Simulation</h2>
                </div>
                <p style={{ fontSize:12, color:'#475569', marginBottom:24 }}>
                  Inject synthetic malicious oracle nodes to measure the AI ensemble's detection robustness. Generates empirical data for academic evaluation.
                </p>

                {/* Attack type selector */}
                <div style={{ marginBottom:24 }}>
                  <div style={{ fontSize:12, color:'#64748b', marginBottom:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>Attack Strategy</div>
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                    {[
                      { id:'sybil',       label:'Sybil Attack',      desc:'Many clones reporting same wrong value',    color:'#ef4444' },
                      { id:'random',      label:'Random Noise',       desc:'Unpredictable garbage submissions',          color:'#f59e0b' },
                      { id:'coordinated', label:'Coordinated Drift',  desc:'Subtle drift to push consensus gradually',  color:'#a78bfa' },
                    ].map(({ id, label, desc, color }) => (
                      <div key={id} onClick={() => setAttackType(id)} style={{ flex:1, minWidth:140, padding:'14px 16px', borderRadius:12, cursor:'pointer', transition:'all 0.2s',
                        background: attackType===id ? `${color}18` : 'rgba(5,8,18,0.5)',
                        border: `1px solid ${attackType===id ? color : 'rgba(99,102,241,0.15)'}`,
                        boxShadow: attackType===id ? `0 0 16px ${color}20` : 'none',
                      }}>
                        <div style={{ fontSize:13, fontWeight:700, color: attackType===id ? color : '#64748b', marginBottom:4 }}>{label}</div>
                        <div style={{ fontSize:11, color:'#334155', lineHeight:1.4 }}>{desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Intensity */}
                <div style={{ marginBottom:24 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <div style={{ fontSize:12, color:'#64748b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>Attack Intensity</div>
                    <span className="mono" style={{ fontSize:18, fontWeight:700, color:'#a5b4fc' }}>{attackInt}</span>
                  </div>
                  <input type="range" min={1} max={10} value={attackInt} onChange={e => setAttackInt(Number(e.target.value))} />
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'#334155', marginTop:4 }}>
                    <span>Low (1 attacker)</span><span>High ({Math.max(1,Math.floor(attackInt/2))} attackers)</span>
                  </div>
                </div>

                {/* Honest data preview */}
                <div style={{ background:'rgba(5,8,18,0.5)', border:'1px solid rgba(99,102,241,0.12)', borderRadius:10, padding:'12px 16px', marginBottom:24 }}>
                  <div style={{ fontSize:11, color:'#475569', marginBottom:6 }}>Honest baseline (from Validator tab)</div>
                  <div className="mono" style={{ fontSize:12, color:'#64748b' }}>
                    [{dataPoints.join(', ')}] <span style={{ color:'#334155' }}>({dataPoints.length} nodes)</span>
                  </div>
                </div>

                <button className="btn-danger" onClick={launchAttack} disabled={attackLoading||dataPoints.length<2} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  {attackLoading ? <><Spinner />Simulating Attack…</> : <><IconZap />Launch Attack Simulation</>}
                </button>

                {attackError && (
                  <div style={{ marginTop:16, padding:'10px 14px', borderRadius:10, background:'rgba(127,29,29,0.2)', border:'1px solid rgba(239,68,68,0.2)', fontSize:12, color:'#f87171', display:'flex', gap:8 }}>
                    <IconAlert />{attackError}
                  </div>
                )}
              </div>

              {/* Attack results */}
              {attackResult && (
                <div className="glass-card slide-up" style={{ padding:28 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
                    <h2 style={{ fontSize:16, fontWeight:700, color:'#e2e8f0' }}>Attack Detection Results</h2>
                    <span className={`badge ${attackResult.detection_rate >= 80 ? 'badge-success' : 'badge-warning'}`} style={{ marginLeft:'auto' }}>
                      {attackResult.detection_rate >= 80 ? '🛡 Defended' : '⚠ Partial Breach'}
                    </span>
                  </div>

                  {/* Metrics */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
                    {[
                      { label:'Attackers Injected', value:attackResult.malicious_count, color:'#ef4444' },
                      { label:'Caught (True +)',     value:attackResult.true_positives,  color:'#10b981' },
                      { label:'Evaded (False -)',    value:attackResult.false_negatives,  color:'#f59e0b' },
                      { label:'Consensus Intact',   value:attackResult.consensus_corrupted ? 'NO' : 'YES', color: attackResult.consensus_corrupted ? '#ef4444' : '#10b981' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="stat-card" style={{ textAlign:'center' }}>
                        <div style={{ fontSize:22, fontWeight:700, color, fontFamily:'var(--font-mono)' }}>{value}</div>
                        <div style={{ fontSize:10, color:'#475569', marginTop:4 }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Detection rate bars */}
                  <div style={{ background:'rgba(5,8,18,0.5)', border:'1px solid rgba(99,102,241,0.12)', borderRadius:12, padding:'20px 24px', marginBottom:24 }}>
                    <DetectBar label="Detection Rate (True Positives / Attackers)"    value={attackResult.detection_rate}      color="#10b981" />
                    <DetectBar label="False Positive Rate (Honest Flagged / Honest)"  value={attackResult.false_positive_rate}  color="#f87171" />
                  </div>

                  {/* Node graph */}
                  <div style={{ marginBottom:24 }}>
                    <div style={{ fontSize:12, color:'#64748b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Node Status Graph</div>
                    <div style={{ display:'flex', gap:16, marginBottom:12, flexWrap:'wrap' }}>
                      {[['#10b981','Honest · Valid'],['#f59e0b','Honest · False Positive'],['#ef4444','Malicious · Caught'],['#f59e0b','Malicious · Evaded']].map(([c,l]) => (
                        <div key={l} style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <span style={{ width:10, height:10, borderRadius:'50%', background:c, display:'inline-block', boxShadow:`0 0 6px ${c}` }} />
                          <span style={{ fontSize:11, color:'#475569' }}>{l}</span>
                        </div>
                      ))}
                    </div>
                    <AttackNodeGraph trace={attackResult.reasoning_trace} honestCount={attackResult.honest_count} />
                  </div>

                  {/* Model weights after attack */}
                  {attackResult.model_weights && (
                    <div style={{ background:'rgba(5,8,18,0.5)', border:'1px solid rgba(99,102,241,0.12)', borderRadius:12, padding:'20px 24px' }}>
                      <div style={{ fontSize:11, color:'#475569', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16, fontWeight:600 }}>Post-Attack Bayesian Weights</div>
                      <div style={{ display:'flex', justifyContent:'space-around', flexWrap:'wrap', gap:16 }}>
                        <ModelWeightRing label="Isolation Forest"    weight={attackResult.model_weights.isolation_forest || 0.4}  color="#6366f1" />
                        <ModelWeightRing label="Local Outlier Factor" weight={attackResult.model_weights.lof || 0.35}              color="#22d3ee" />
                        <ModelWeightRing label="Z-Score Baseline"    weight={attackResult.model_weights.zscore || 0.25}           color="#a78bfa" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right col: log */}
            <div className="glass-card" style={{ padding:24, position:'sticky', top:24 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', display:'flex', alignItems:'center', justifyContent:'center', color:'#818cf8' }}><IconActivity /></div>
                <h2 style={{ fontSize:14, fontWeight:700, color:'#94a3b8' }}>Activity Log</h2>
                {log.length > 0 && <button onClick={() => setLog([])} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:11, color:'#334155' }}>Clear</button>}
              </div>
              {log.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 0', color:'#1e293b' }}><div style={{ fontSize:32, marginBottom:8 }}>◌</div><div style={{ fontSize:12 }}>No activity yet</div></div>
              ) : (
                <div style={{ maxHeight:480, overflowY:'auto' }}>
                  {log.map(entry => {
                    const c = { success:{ dot:'#10b981', text:'#34d399' }, error:{ dot:'#ef4444', text:'#f87171' }, warning:{ dot:'#f59e0b', text:'#fbbf24' }, pending:{ dot:'#f59e0b', text:'#94a3b8' }, info:{ dot:'#6366f1', text:'#94a3b8' } }[entry.type] || { dot:'#475569', text:'#94a3b8' }
                    return (
                      <div key={entry.id} className="log-entry">
                        <div style={{ marginTop:4 }}><div style={{ width:7, height:7, borderRadius:'50%', background:c.dot, boxShadow:`0 0 6px ${c.dot}` }} /></div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12, color:c.text, fontWeight:500 }}>{entry.msg}</div>
                          {entry.extra && <div className="mono" style={{ fontSize:10, color:'#334155', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{entry.extra}</div>}
                        </div>
                        <div style={{ fontSize:10, color:'#1e293b', whiteSpace:'nowrap', marginTop:2, fontFamily:'var(--font-mono)' }}>{entry.time}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 3 — ZK PROOF                                                 */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'zk' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:24, alignItems:'start' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

              {/* ZK config card */}
              <div className="glass-card" style={{ padding:28 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:'rgba(34,211,238,0.12)', border:'1px solid rgba(34,211,238,0.25)', display:'flex', alignItems:'center', justifyContent:'center', color:'#22d3ee' }}>
                    <IconKey />
                  </div>
                  <h2 style={{ fontSize:16, fontWeight:700, color:'#e2e8f0' }}>ZK-Light Source Authentication</h2>
                </div>
                <p style={{ fontSize:12, color:'#475569', marginBottom:24 }}>
                  Proves a node queried a trusted data source and obtained a specific value — <strong style={{ color:'#a5b4fc' }}>without revealing the API key</strong>. Uses SHA-256 commitment with a simulated Groth16 proof structure.
                </p>

                {/* Source selector */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
                  <div>
                    <div style={{ fontSize:12, color:'#64748b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Data Source</div>
                    <select id="zk-source-select" className="input-field" value={zkSource} onChange={e => setZkSource(e.target.value)} style={{ fontFamily:'Inter,sans-serif', fontSize:13 }}>
                      <option value="weather_api_v2">OpenWeather API v2</option>
                      <option value="chainlink_btc">Chainlink BTC/USD Feed</option>
                      <option value="coinbase_eth">Coinbase ETH/USD Feed</option>
                      <option value="coingecko_sol">CoinGecko SOL/USD Feed</option>
                      <option value="custom_sensor">Custom IoT Sensor</option>
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize:12, color:'#64748b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Value Reported</div>
                    <input id="zk-value-input" type="number" className="input-field" value={zkValue} onChange={e => setZkValue(e.target.value)} placeholder="e.g. 101" style={{ fontFamily:'var(--font-mono)', fontSize:13 }} />
                  </div>
                </div>

                {/* How it works */}
                <div style={{ background:'rgba(34,211,238,0.05)', border:'1px solid rgba(34,211,238,0.15)', borderRadius:10, padding:'14px 16px', marginBottom:24 }}>
                  <div style={{ fontSize:11, color:'#0e7490', fontWeight:600, marginBottom:8 }}>How ZK-Light Works</div>
                  <div style={{ fontSize:11, color:'#334155', lineHeight:1.7 }}>
                    1. Node queries trusted source with private API key<br/>
                    2. Generates commitment: <span className="mono" style={{ color:'#22d3ee' }}>H(source ‖ value ‖ time_window)</span><br/>
                    3. Produces Groth16 proof π = (π_a, π_b, π_c) attesting the query<br/>
                    4. Smart contract or verifier checks proof without seeing the API key
                  </div>
                </div>

                <button id="zk-generate-btn" className="btn-primary" onClick={generateZkProof} disabled={zkLoading||!zkValue} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  {zkLoading ? <><Spinner />Generating Proof…</> : <><IconKey />Generate ZK Proof</>}
                </button>

                {zkError && (
                  <div style={{ marginTop:16, padding:'10px 14px', borderRadius:10, background:'rgba(127,29,29,0.2)', border:'1px solid rgba(239,68,68,0.2)', fontSize:12, color:'#f87171', display:'flex', gap:8 }}>
                    <IconAlert />{zkError}
                  </div>
                )}
              </div>

              {/* ZK result */}
              {zkResult && (
                <div className="glass-card slide-up" style={{ padding:28, borderColor:'rgba(34,211,238,0.2)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
                    <h2 style={{ fontSize:16, fontWeight:700, color:'#e2e8f0' }}>ZK Proof Output</h2>
                    <span className="badge badge-success" style={{ marginLeft:'auto' }}><IconCheck />Verified</span>
                    <span className="badge badge-cyan">
                      <span style={{ width:6, height:6, borderRadius:'50%', background:'#ef4444', display:'inline-block' }} />
                      API Key Hidden
                    </span>
                  </div>

                  {/* Source info */}
                  <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
                    <div className="stat-card" style={{ flex:1 }}>
                      <div style={{ fontSize:11, color:'#475569', marginBottom:4 }}>Source</div>
                      <div style={{ fontSize:14, fontWeight:700, color:'#22d3ee' }}>{zkResult.source_name}</div>
                    </div>
                    <div className="stat-card" style={{ flex:1 }}>
                      <div style={{ fontSize:11, color:'#475569', marginBottom:4 }}>Trust Level</div>
                      <div style={{ fontSize:14, fontWeight:700, color: zkResult.trust_level==='HIGH' ? '#10b981' : '#f59e0b' }}>{zkResult.trust_level}</div>
                    </div>
                    <div className="stat-card" style={{ flex:1 }}>
                      <div style={{ fontSize:11, color:'#475569', marginBottom:4 }}>Proof Type</div>
                      <div style={{ fontSize:11, fontWeight:600, color:'#a5b4fc', lineHeight:1.4 }}>{zkResult.proof_type}</div>
                    </div>
                  </div>

                  {/* Proof components */}
                  <div style={{ marginBottom:20 }}>
                    <div style={{ fontSize:11, color:'#475569', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12, fontWeight:600 }}>Groth16 Proof Components</div>
                    <div className="zk-proof-hash">
                      {Object.entries(zkResult.proof).map(([k, v]) => (
                        <div key={k} style={{ display:'flex', gap:12, marginBottom:4, alignItems:'flex-start' }}>
                          <span style={{ color:'#475569', minWidth:28 }}>{k}</span>
                          <span style={{ wordBreak:'break-all' }}>0x{v}</span>
                          <CopyButton text={`0x${v}`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Public inputs */}
                  <div style={{ marginBottom:20 }}>
                    <div style={{ fontSize:11, color:'#475569', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12, fontWeight:600 }}>Public Inputs (verifier-visible)</div>
                    <div style={{ background:'rgba(5,8,18,0.6)', border:'1px solid rgba(99,102,241,0.1)', borderRadius:10, overflow:'hidden' }}>
                      {Object.entries(zkResult.public_inputs).map(([k, v], i) => (
                        <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'10px 16px', borderBottom: i < Object.keys(zkResult.public_inputs).length-1 ? '1px solid rgba(99,102,241,0.06)' : 'none' }}>
                          <span style={{ fontSize:11, color:'#475569' }}>{k.replace(/_/g,' ')}</span>
                          <span className="mono" style={{ fontSize:11, color:'#a5b4fc' }}>{typeof v === 'string' ? `0x${v}` : v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key not revealed badge */}
                  <div style={{ padding:'14px 16px', borderRadius:10, background:'rgba(6,78,59,0.2)', border:'1px solid rgba(16,185,129,0.25)', display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:36, height:36, borderRadius:8, background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <IconLock />
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:'#34d399' }}>API Key NOT Revealed</div>
                      <div style={{ fontSize:11, color:'#475569', marginTop:2 }}>{zkResult.note}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right col: log */}
            <div className="glass-card" style={{ padding:24, position:'sticky', top:24 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', display:'flex', alignItems:'center', justifyContent:'center', color:'#818cf8' }}><IconActivity /></div>
                <h2 style={{ fontSize:14, fontWeight:700, color:'#94a3b8' }}>Activity Log</h2>
                {log.length > 0 && <button onClick={() => setLog([])} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:11, color:'#334155' }}>Clear</button>}
              </div>
              {log.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 0', color:'#1e293b' }}><div style={{ fontSize:32, marginBottom:8 }}>◌</div><div style={{ fontSize:12 }}>No activity yet</div></div>
              ) : (
                <div style={{ maxHeight:480, overflowY:'auto' }}>
                  {log.map(entry => {
                    const c = { success:{ dot:'#10b981', text:'#34d399' }, error:{ dot:'#ef4444', text:'#f87171' }, warning:{ dot:'#f59e0b', text:'#fbbf24' }, pending:{ dot:'#f59e0b', text:'#94a3b8' }, info:{ dot:'#6366f1', text:'#94a3b8' } }[entry.type] || { dot:'#475569', text:'#94a3b8' }
                    return (
                      <div key={entry.id} className="log-entry">
                        <div style={{ marginTop:4 }}><div style={{ width:7, height:7, borderRadius:'50%', background:c.dot, boxShadow:`0 0 6px ${c.dot}` }} /></div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12, color:c.text, fontWeight:500 }}>{entry.msg}</div>
                          {entry.extra && <div className="mono" style={{ fontSize:10, color:'#334155', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{entry.extra}</div>}
                        </div>
                        <div style={{ fontSize:10, color:'#1e293b', whiteSpace:'nowrap', marginTop:2, fontFamily:'var(--font-mono)' }}>{entry.time}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 4 — REWARDS                                                  */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'rewards' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:24, alignItems:'start' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:24 }}>

              {/* ── Reward Pool card ──────────────────────────────────────── */}
              <div className="glass-card" style={{ padding:28, borderColor:'rgba(245,158,11,0.25)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.3)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fbbf24' }}>
                    <IconDroplets />
                  </div>
                  <h2 style={{ fontSize:16, fontWeight:700, color:'#e2e8f0' }}>Reward Pool</h2>
                  <button onClick={() => refreshRewards(account)} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:11, color:'#475569' }}>↻ Refresh</button>
                </div>
                <p style={{ fontSize:12, color:'#475569', marginBottom:20 }}>
                  Fund the shared pool with ETH. Every successful high-confidence oracle submission automatically
                  earns a confidence-scaled reward from this pool. Slashed stakes are recycled back here.
                </p>

                {/* Pool balance stat */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:24 }}>
                  <div className="stat-card" style={{ background:'rgba(245,158,11,0.07)', border:'1px solid rgba(245,158,11,0.2)' }}>
                    <div style={{ fontSize:11, color:'#92400e', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>Pool Balance</div>
                    <div className="mono" style={{ fontSize:24, fontWeight:700, color:'#fbbf24' }}>
                      {rewardPool !== null ? parseFloat(ethers.formatEther(rewardPool)).toFixed(5) : '—'}
                    </div>
                    <div style={{ fontSize:11, color:'#475569', marginTop:4 }}>ETH</div>
                  </div>
                  <div className="stat-card">
                    <div style={{ fontSize:11, color:'#475569', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>Payout Rate</div>
                    <div className="mono" style={{ fontSize:24, fontWeight:700, color:'#a78bfa' }}>{poolBps / 100}%</div>
                    <div style={{ fontSize:11, color:'#475569', marginTop:4 }}>per round</div>
                  </div>
                  <div className="stat-card" style={{ background:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.2)' }}>
                    <div style={{ fontSize:11, color:'#065f46', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.08em' }}>My Total Earned</div>
                    <div className="mono" style={{ fontSize:24, fontWeight:700, color:'#34d399' }}>
                      {myRewards !== null ? parseFloat(ethers.formatEther(myRewards)).toFixed(6) : '—'}
                    </div>
                    <div style={{ fontSize:11, color:'#475569', marginTop:4 }}>ETH lifetime</div>
                  </div>
                </div>

                {/* Reward formula callout */}
                <div style={{ background:'rgba(245,158,11,0.05)', border:'1px solid rgba(245,158,11,0.15)', borderRadius:10, padding:'14px 16px', marginBottom:24 }}>
                  <div style={{ fontSize:11, color:'#92400e', fontWeight:600, marginBottom:8 }}>Confidence-Scaled Reward Formula</div>
                  <div className="mono" style={{ fontSize:12, color:'#fbbf24', lineHeight:1.8 }}>
                    poolPerRound = pool × {poolBps / 100}%<br/>
                    reward = poolPerRound × (confidence − 80) / 20<br/>
                    <span style={{ color:'#64748b' }}>// 100% confidence → full poolPerRound · 81% → 5%</span>
                  </div>
                </div>

                {/* Fund pool input */}
                <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                  <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
                    <input id="fund-pool-amount" type="number" step="0.01" min="0.001" value={fundAmount}
                      onChange={e => setFundAmount(e.target.value)}
                      className="input-field" style={{ width:130, paddingRight:44 }} />
                    <span style={{ position:'absolute', right:12, fontSize:12, color:'#475569', pointerEvents:'none' }}>ETH</span>
                  </div>
                  <button id="fund-pool-btn" className="btn-primary" onClick={fundPool} disabled={funding || !account}
                    style={{ background:'linear-gradient(135deg,#d97706,#f59e0b)', boxShadow:'0 0 20px rgba(245,158,11,0.25)', display:'flex', alignItems:'center', gap:8 }}>
                    {funding ? <><Spinner />Funding…</> : <><IconDroplets />Fund Reward Pool</>}
                  </button>
                  {fundSuccess && !funding && <span className="badge badge-success fade-in"><IconCheck />Funded!</span>}
                </div>
                {!account && <p style={{ marginTop:10, fontSize:11, color:'#92400e', display:'flex', alignItems:'center', gap:6 }}><IconAlert />Connect your wallet first</p>}
              </div>

              {/* ── Leaderboard card ──────────────────────────────────────── */}
              <div className="glass-card" style={{ padding:28 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.3)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fbbf24' }}>
                    <IconTrophy />
                  </div>
                  <h2 style={{ fontSize:16, fontWeight:700, color:'#e2e8f0' }}>Node Leaderboard</h2>
                  <button onClick={loadLeaderboard} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:11, color:'#475569' }}>↻ Reload</button>
                </div>
                <p style={{ fontSize:12, color:'#475569', marginBottom:20 }}>
                  On-chain ranking of oracle nodes by lifetime ETH rewards earned — updated in real time from <span className="mono" style={{ color:'#6366f1' }}>RewardPaid</span> events.
                </p>

                {leaderboard.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'40px 0', color:'#1e293b' }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>🏅</div>
                    <div style={{ fontSize:13, color:'#334155' }}>No rewards distributed yet</div>
                    <div style={{ fontSize:11, color:'#1e293b', marginTop:4 }}>Fund the pool and submit high-confidence data to earn</div>
                  </div>
                ) : (
                  <div style={{ overflowX:'auto', borderRadius:10, border:'1px solid rgba(251,191,36,0.1)' }}>
                    <table className="trace-table">
                      <thead>
                        <tr>
                          <th style={{ width:48 }}>Rank</th>
                          <th>Oracle Node</th>
                          <th style={{ textAlign:'right' }}>Total Earned (ETH)</th>
                          <th style={{ textAlign:'right' }}>Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map(({ addr, earned }, idx) => {
                          const totalAll = leaderboard.reduce((s, e) => s + e.earned, 0n)
                          const pct = totalAll > 0n ? Number((earned * 10000n) / totalAll) / 100 : 0
                          const medals = ['🥇','🥈','🥉']
                          const isMe = account && addr.toLowerCase() === account.toLowerCase()
                          return (
                            <tr key={addr} style={{ background: isMe ? 'rgba(251,191,36,0.06)' : 'transparent' }}>
                              <td><span style={{ fontSize:18 }}>{medals[idx] || `#${idx+1}`}</span></td>
                              <td>
                                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                  <span className="mono" style={{ fontSize:12, color: isMe ? '#fbbf24' : '#a5b4fc' }}>{shortenAddr(addr)}</span>
                                  {isMe && <span className="badge badge-success" style={{ fontSize:9 }}>YOU</span>}
                                  <CopyButton text={addr} />
                                </div>
                              </td>
                              <td style={{ textAlign:'right' }}>
                                <span className="mono" style={{ fontSize:13, fontWeight:700, color:'#34d399' }}>
                                  {parseFloat(ethers.formatEther(earned)).toFixed(6)}
                                </span>
                              </td>
                              <td style={{ textAlign:'right' }}>
                                <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:8 }}>
                                  <div style={{ width:60, height:6, borderRadius:3, background:'rgba(255,255,255,0.05)', overflow:'hidden' }}>
                                    <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#d97706,#fbbf24)', borderRadius:3, transition:'width 0.8s ease' }} />
                                  </div>
                                  <span className="mono" style={{ fontSize:11, color:'#64748b', minWidth:36 }}>{pct.toFixed(1)}%</span>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── How it works explainer ────────────────────────────────── */}
              <div className="glass-card" style={{ padding:28 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', display:'flex', alignItems:'center', justifyContent:'center', color:'#818cf8' }}>
                    <IconStar />
                  </div>
                  <h2 style={{ fontSize:16, fontWeight:700, color:'#e2e8f0' }}>How Rewards Work</h2>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  {[
                    { icon:'📥', title:'Fund the Pool', desc:'Any address can deposit ETH into the shared reward pool. Slashed stakes from bad nodes are also recycled here.' },
                    { icon:'🤖', title:'AI Validates', desc:'The 3-model ensemble (IsolationForest + LOF + Z-Score) runs consensus on oracle submissions.' },
                    { icon:'📊', title:'Confidence Scales Reward', desc:'80% confidence → small base reward. 100% → full poolPerRound. The better your data, the more you earn.' },
                    { icon:'⛓', title:'Auto-Paid On Submit', desc:'The smart contract calculates and transfers the reward automatically when submitVerifiedData() succeeds.' },
                  ].map(({ icon, title, desc }) => (
                    <div key={title} style={{ background:'rgba(5,8,18,0.5)', border:'1px solid rgba(99,102,241,0.1)', borderRadius:12, padding:'16px 18px' }}>
                      <div style={{ fontSize:24, marginBottom:10 }}>{icon}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:'#e2e8f0', marginBottom:6 }}>{title}</div>
                      <div style={{ fontSize:12, color:'#475569', lineHeight:1.6 }}>{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right col: activity log */}
            <div className="glass-card" style={{ padding:24, position:'sticky', top:24 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', display:'flex', alignItems:'center', justifyContent:'center', color:'#818cf8' }}><IconActivity /></div>
                <h2 style={{ fontSize:14, fontWeight:700, color:'#94a3b8' }}>Activity Log</h2>
                {log.length > 0 && <button onClick={() => setLog([])} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:11, color:'#334155' }}>Clear</button>}
              </div>
              {log.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px 0', color:'#1e293b' }}><div style={{ fontSize:32, marginBottom:8 }}>◌</div><div style={{ fontSize:12 }}>No activity yet</div></div>
              ) : (
                <div style={{ maxHeight:480, overflowY:'auto' }}>
                  {log.map(entry => {
                    const c = { success:{ dot:'#10b981', text:'#34d399' }, error:{ dot:'#ef4444', text:'#f87171' }, warning:{ dot:'#f59e0b', text:'#fbbf24' }, pending:{ dot:'#f59e0b', text:'#94a3b8' }, info:{ dot:'#6366f1', text:'#94a3b8' } }[entry.type] || { dot:'#475569', text:'#94a3b8' }
                    return (
                      <div key={entry.id} className="log-entry">
                        <div style={{ marginTop:4 }}><div style={{ width:7, height:7, borderRadius:'50%', background:c.dot, boxShadow:`0 0 6px ${c.dot}` }} /></div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12, color:c.text, fontWeight:500 }}>{entry.msg}</div>
                          {entry.extra && <div className="mono" style={{ fontSize:10, color:'#334155', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{entry.extra}</div>}
                        </div>
                        <div style={{ fontSize:10, color:'#1e293b', whiteSpace:'nowrap', marginTop:2, fontFamily:'var(--font-mono)' }}>{entry.time}</div>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="divider" style={{ marginTop:24 }} />
              <div style={{ fontSize:11, color:'#1e293b' }}>
                {[['Network','Hardhat Local · 31337'],['RPC','127.0.0.1:8545'],['AI Engine','127.0.0.1:5001']].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span>{k}</span><span className="mono" style={{ color:'#334155' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────────────────────── */}
        <footer style={{ marginTop:48, textAlign:'center', color:'#1e293b', fontSize:11 }}>
          ProvAI Network · Weighted Truth-Discovery · Confidence-Tied Slashing · ZK-Light Auth · Node Rewards · Hardhat + ethers.js + React
        </footer>
      </div>
    </>
  )
}