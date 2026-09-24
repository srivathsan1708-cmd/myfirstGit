import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import toast from 'react-hot-toast';

// Mock disputes data
const MOCK_DISPUTES = [
  {
    id: 1,
    feedId: 5,
    dataType: 'WEATHER',
    query: 'London humidity percentage',
    consensusValue: 75,
    disputedBy: '0xdf3e18d64bc6a983f673ab319ccae4f1a57c7097',
    reason: 'Significantly different from verified weather station data',
    evidence: 'Official weather station reported 68% humidity at the same time',
    status: 'VOTING',
    votes: [
      { voter: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', vote: 'UPHOLD', time: '2h ago' },
      { voter: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', vote: 'UPHOLD', time: '1h ago' },
    ],
    createdAt: '6h ago',
  },
  {
    id: 2,
    feedId: 9,
    dataType: 'PRICE',
    query: 'BTC/USD price feed',
    consensusValue: 62345,
    disputedBy: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
    reason: 'Price deviation of 8% from other major exchanges',
    evidence: 'Binance and Coinbase both report $57,200 at same timestamp',
    status: 'RESOLVED',
    resolution: 'UPHELD',
    votes: [
      { voter: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266', vote: 'UPHOLD', time: '3d ago' },
      { voter: '0x90f79bf6eb2c4f870365e785982e1f101e93b906', vote: 'UPHOLD', time: '3d ago' },
      { voter: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', vote: 'REJECT', time: '3d ago' },
    ],
    createdAt: '4d ago',
  },
  {
    id: 3,
    feedId: 12,
    dataType: 'IOT',
    query: 'Smart meter reading – Warehouse B',
    consensusValue: 4812,
    disputedBy: '0xa0ee7a142d267c1f36714e4a8f75612f20a79720',
    reason: 'Reading is 3x higher than adjacent sensor',
    evidence: 'Sensor ID S-2023 shows 1,600 kWh. Disputed value is 4,812 kWh',
    status: 'PENDING',
    votes: [],
    createdAt: '30m ago',
  },
];

const DATA_TYPE_ICONS = { WEATHER: '🌤️', PRICE: '💰', IOT: '📡', CUSTOM: '📦' };

export default function Disputes() {
  const { account, isConnected, connectWallet } = useWeb3();
  const [disputes, setDisputes] = useState(MOCK_DISPUTES);
  const [selected, setSelected] = useState(null);
  const [filter,   setFilter]   = useState('ALL');
  const [newDispute, setNewDispute] = useState({ feedId: '', reason: '', evidence: '' });
  const [showForm, setShowForm] = useState(false);

  const filtered = filter === 'ALL' ? disputes : disputes.filter(d => d.status === filter);

  const castVote = (disputeId, vote) => {
    if (!isConnected) { toast.error('Connect wallet to vote'); return; }
    setDisputes(prev => prev.map(d => {
      if (d.id !== disputeId) return d;
      const alreadyVoted = d.votes.find(v => v.voter === account);
      if (alreadyVoted) { toast.error('You already voted on this dispute'); return d; }
      toast.success(`Vote cast: ${vote}`);
      return { ...d, votes: [...d.votes, { voter: account, vote, time: 'just now' }] };
    }));
  };

  const submitDispute = () => {
    if (!newDispute.feedId || !newDispute.reason) { toast.error('Fill in all required fields'); return; }
    if (!isConnected) { toast.error('Connect wallet to submit'); return; }
    const d = {
      id: disputes.length + 1,
      feedId: Number(newDispute.feedId),
      dataType: 'CUSTOM',
      query: `Feed #${newDispute.feedId}`,
      consensusValue: 0,
      disputedBy: account,
      reason: newDispute.reason,
      evidence: newDispute.evidence,
      status: 'PENDING',
      votes: [],
      createdAt: 'just now',
    };
    setDisputes(prev => [d, ...prev]);
    setNewDispute({ feedId: '', reason: '', evidence: '' });
    setShowForm(false);
    toast.success('Dispute submitted!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <span>⚖️</span> Oracle Disputes
          </h1>
          <p className="text-gray-600 text-sm mt-1">Review and vote on contested oracle data submissions</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          + New Dispute
        </button>
      </div>

      {/* ── New Dispute Form Modal Card ─────────────────────────────────────────────── */}
      {showForm && (
        <div className="card border-2 border-primary-300 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 pb-2 border-b border-gray-100">Submit New Dispute</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Feed ID *</label>
              <input type="number" value={newDispute.feedId}
                onChange={e => setNewDispute(p => ({ ...p, feedId: e.target.value }))}
                className="input-field" placeholder="Data feed ID" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Reason *</label>
              <input type="text" value={newDispute.reason}
                onChange={e => setNewDispute(p => ({ ...p, reason: e.target.value }))}
                className="input-field" placeholder="Reason for dispute" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Supporting Evidence</label>
              <textarea value={newDispute.evidence}
                onChange={e => setNewDispute(p => ({ ...p, evidence: e.target.value }))}
                className="input-field" placeholder="Paste link or details..." rows={3} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={submitDispute} className="btn-primary text-sm">Submit Dispute</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* ── Filter tabs ──────────────────────────────────────────────────── */}
      <div className="flex space-x-2 border-b border-gray-200 pb-2">
        {['ALL', 'PENDING', 'VOTING', 'RESOLVED'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              filter === f ? 'bg-primary-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {f} ({f === 'ALL' ? disputes.length : disputes.filter(d => d.status === f).length})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Dispute List ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {filtered.length === 0 && (
            <div className="card text-center py-16 text-gray-500">
              <div className="text-4xl mb-2">⚖️</div>
              <p className="text-sm font-medium">No disputes in this category</p>
            </div>
          )}
          {filtered.map(dispute => {
            const upholds = dispute.votes.filter(v => v.vote === 'UPHOLD').length;
            const rejects = dispute.votes.filter(v => v.vote === 'REJECT').length;
            const isSelected = selected?.id === dispute.id;
            return (
              <div key={dispute.id}
                onClick={() => setSelected(isSelected ? null : dispute)}
                className={`card cursor-pointer transition-all ${
                  isSelected ? 'border-2 border-primary-500 ring-2 ring-primary-100 shadow-xl' : 'hover:border-gray-300'
                }`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{DATA_TYPE_ICONS[dispute.dataType] || '📦'}</span>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{dispute.query}</h3>
                      <p className="text-xs text-gray-500">Feed #{dispute.feedId} · {dispute.createdAt}</p>
                    </div>
                  </div>
                  <span className={
                    dispute.status === 'VOTING' ? 'badge-warning' :
                    dispute.status === 'RESOLVED' ? 'badge-success' : 'badge-info'
                  }>
                    {dispute.status}
                  </span>
                </div>
                <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 my-3 font-medium">
                  {dispute.reason}
                </p>
                <div className="flex justify-between items-center text-xs font-mono text-gray-500">
                  <div className="flex space-x-3">
                    <span className="text-green-600 font-bold">✓ Uphold: {upholds}</span>
                    <span className="text-red-600 font-bold">✗ Reject: {rejects}</span>
                  </div>
                  <span>By: {dispute.disputedBy.slice(0, 8)}...</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Detail Panel ─────────────────────────────────────────────────── */}
        <div>
          {selected ? (
            <div className="card space-y-5 sticky top-24">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Dispute #{selected.id}</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-500 font-medium block">Feed ID</span>
                  <span className="font-bold text-gray-900 text-sm">#{selected.feedId}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block">Consensus Value</span>
                  <span className="font-mono font-bold text-gray-900 text-sm">{selected.consensusValue}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block">Disputed By</span>
                  <span className="font-mono text-gray-800">{selected.disputedBy}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block">Reason</span>
                  <span className="text-gray-800">{selected.reason}</span>
                </div>
                {selected.evidence && (
                  <div>
                    <span className="text-gray-500 font-medium block">Evidence</span>
                    <span className="text-gray-800 bg-gray-50 p-2 rounded block border border-gray-100 mt-1">{selected.evidence}</span>
                  </div>
                )}
              </div>

              {/* Votes List */}
              <div className="pt-2 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Votes ({selected.votes.length})</h3>
                {selected.votes.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No votes yet</p>
                ) : (
                  <div className="space-y-2">
                    {selected.votes.map((v, i) => (
                      <div key={i} className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded border border-gray-100">
                        <span className="font-mono text-gray-700">{v.voter.slice(0, 10)}...</span>
                        <span className={`font-bold ${v.vote === 'UPHOLD' ? 'text-green-600' : 'text-red-600'}`}>{v.vote}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Vote actions */}
              {selected.status === 'VOTING' && (
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button onClick={() => castVote(selected.id, 'UPHOLD')} className="btn-primary text-xs flex-1 bg-green-600 hover:bg-green-700">
                    ✓ Uphold
                  </button>
                  <button onClick={() => castVote(selected.id, 'REJECT')} className="btn-primary text-xs flex-1 bg-red-600 hover:bg-red-700">
                    ✗ Reject
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="card text-center py-20 text-gray-400 sticky top-24">
              <div className="text-4xl mb-2">⚖️</div>
              <p className="text-xs font-medium">Select a dispute to view details & vote</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
