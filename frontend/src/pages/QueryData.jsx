import { useState } from 'react';
import toast from 'react-hot-toast';

const SAMPLE_CUSTOM_FEEDS = [
  { label: '📦 Supply Chain Temp', url: '', metric: 'Cold Chain Storage Temp', unit: '°C', data: [-20.1, -19.8, -20.3, 15.0] },
  { label: '✈️ Flight Insurance Delay', url: '', metric: 'Flight BA123 Delay', unit: 'mins', data: [148, 147, 150, 0] },
  { label: '⚡ Solar Power Output', url: '', metric: 'Solar Farm Grid', unit: 'MW', data: [45.2, 44.8, 45.0, 0.0] },
  { label: '📈 Stock Valuation', url: '', metric: 'TSLA Share Price', unit: 'USD', data: [242.5, 242.8, 242.1, 500.0] },
  { label: '🌤️ Weather Sensor', url: '', metric: 'London Temp', unit: '°C', data: [18.5, 18.3, 18.7, 50.0] },
  { label: '🪙 Crypto Price', url: '', metric: 'Bitcoin Rate', unit: 'USD', data: [64200, 64150, 64220, 95000] },
];

export default function QueryData() {
  const [metricName, setMetricName] = useState('Cold Chain Storage Temp');
  const [unitName,   setUnitName]   = useState('°C');
  const [apiUrl,     setApiUrl]     = useState('');
  const [nodeInput,  setNodeInput]  = useState('-20.1, -19.8, -20.3, 15.0');
  
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);

  const handleQuery = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setResult(null);

    let nodeValues = [];
    if (nodeInput.trim()) {
      nodeValues = nodeInput.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    }

    try {
      const res = await fetch('http://localhost:5001/universal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric_name: metricName,
          unit: unitName,
          node_data: nodeValues.length >= 2 ? nodeValues : undefined,
          api_url: apiUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.valid === false) throw new Error(data.error || `HTTP ${res.status}`);
      setResult(data);
      toast.success('Universal AI Consensus Query Verified!');
    } catch (err) {
      toast.error(err.message || 'Failed to query data');
    } finally {
      setLoading(false);
    }
  };

  const applySample = s => {
    setMetricName(s.metric);
    setUnitName(s.unit);
    setApiUrl(s.url);
    setNodeInput(s.data.join(', '));
    setResult(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <span>🌐</span> Query Any Verified Data Feed
        </h1>
        <p className="text-gray-600 text-sm mt-1">Submit custom REST API URLs or node values for AI consensus verification</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Query Form ─────────────────────────────────────────────────────── */}
        <div className="card space-y-6">
          <h2 className="text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">Custom Oracle Query</h2>
          
          <form onSubmit={handleQuery} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Metric Name</label>
              <input
                type="text"
                value={metricName}
                onChange={e => setMetricName(e.target.value)}
                placeholder="e.g. Storage Temp, Stock Price, Sensor Metric"
                className="input-field text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Unit</label>
              <input
                type="text"
                value={unitName}
                onChange={e => setUnitName(e.target.value)}
                placeholder="e.g. °C, USD, MW, %, mins"
                className="input-field text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Node Values (Comma Separated)</label>
              <input
                type="text"
                value={nodeInput}
                onChange={e => setNodeInput(e.target.value)}
                placeholder="-20.1, -19.8, -20.3, 15.0"
                className="input-field text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Optional: Custom REST API URL</label>
              <input
                type="text"
                value={apiUrl}
                onChange={e => setApiUrl(e.target.value)}
                placeholder="https://api.example.com/data"
                className="input-field text-xs font-mono"
              />
            </div>

            {/* Quick samples */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Quick Presets</label>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_CUSTOM_FEEDS.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => applySample(s)}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-primary-100 hover:text-primary-700 text-gray-700 rounded-full text-xs font-medium border border-gray-200 transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-sm py-3 font-bold">
              {loading ? '⏳ Running AI Verification...' : '🔍 Submit Universal Query'}
            </button>
          </form>
        </div>

        {/* ── Results ────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {loading && (
            <div className="card text-center py-16 space-y-3">
              <div className="animate-spin border-4 border-primary-600 border-t-transparent rounded-full w-10 h-10 mx-auto" />
              <p className="font-semibold text-gray-900">Running AI Consensus Verification...</p>
              <p className="text-xs text-gray-500">IsolationForest + LOF + Z-Score models active</p>
            </div>
          )}

          {!loading && !result && (
            <div className="card text-center py-20">
              <div className="text-6xl mb-4">🌐</div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Universal AI Consensus Query</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">Submit any metric name and node values to see 3-model AI consensus filtering in action.</p>
            </div>
          )}

          {result && !loading && (
            <div className="card space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Verified Oracle Result</h2>
                  <p className="text-xs text-gray-500">{result.metric_name}</p>
                </div>
                <span className="badge-success">AI Verified Truth</span>
              </div>

              {/* Consensus Value Box */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl p-6 text-white text-center shadow-lg space-y-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-primary-200">Filtered AI Consensus Value</div>
                <div className="text-4xl sm:text-5xl font-black font-mono">
                  {result.consensus?.final_value} {result.unit}
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-medium text-white backdrop-blur-md">
                  Confidence Score: {Math.round(result.consensus?.confidence ?? 0)}%
                </div>
              </div>

              {/* Node trace list */}
              {result.consensus?.reasoning_trace && (
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                    Node Submissions & Outlier Detection
                  </h3>
                  <div className="space-y-2">
                    {result.consensus.reasoning_trace.map((node, i) => (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-lg border text-xs ${node.status === 'valid' ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
                        <span className="font-semibold">Node {node.node}</span>
                        <span className="font-mono font-bold">{node.value} {result.unit}</span>
                        <span className={`font-bold ${node.status === 'valid' ? 'text-green-700' : 'text-red-700'}`}>
                          {node.status === 'valid' ? '✓ Valid' : '✗ Outlier'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw JSON viewer */}
              <details className="text-xs text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200 cursor-pointer">
                <summary className="font-semibold text-gray-800">View Raw JSON Response</summary>
                <pre className="mt-3 p-3 bg-gray-900 text-green-400 rounded-md font-mono text-xs overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
