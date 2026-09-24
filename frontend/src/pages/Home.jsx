import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';

const features = [
  {
    icon: '🌐',
    title: 'Universal Plug & Play Data Feeds',
    desc: 'Connect any REST API, IoT sensor stream, flight status, stock rate, or climate feed into the oracle network.',
  },
  {
    icon: '🤖',
    title: '3-Model AI Consensus Ensemble',
    desc: 'IsolationForest + LOF + MAD Z-Score models work together with Bayesian weight updates to detect and isolate rogue nodes.',
  },
  {
    icon: '⚡',
    title: 'Parametric Smart Contract Triggers',
    desc: 'Verified consensus automatically evaluates smart contract rules — triggering payouts, rebalancing loans, or releasing tokens.',
  },
];

const useCases = [
  {
    icon: '📦',
    title: 'Supply Chain Cold-Chain',
    desc: 'Automated insurance payouts when storage temperatures breach safety thresholds during vaccine or food transport.',
  },
  {
    icon: '✈️',
    title: 'Parametric Flight Insurance',
    desc: 'Instant passenger refund payouts triggered when verified flight delays exceed policy limits (e.g. 120 mins).',
  },
  {
    icon: '⚡',
    title: 'Renewable Energy Grids',
    desc: 'Verify solar and wind power output (MW) on-chain to release carbon credits and green energy subsidies automatically.',
  },
  {
    icon: '📈',
    title: 'DeFi & Asset Valuation',
    desc: 'Tamper-proof price feeds for equities, crypto, and commodities to prevent flash-loan exploits and collateral attacks.',
  },
];

const stats = [
  { label: 'Active Nodes',       value: '50+' },
  { label: 'Data Points Verified', value: '10K+' },
  { label: 'Consensus Accuracy', value: '99.5%' },
  { label: 'AI Models',          value: '3' },
];

export default function Home() {
  const { connectWallet, isConnected } = useWeb3();

  return (
    <div className="bg-gray-50">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-800/60 border border-primary-400/30 text-primary-100 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Universal AI Oracle Network · Hardhat Network
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Universal <span className="text-sky-200">AI-Powered Oracle</span> Network
            </h1>
            
            <p className="text-lg sm:text-xl mb-10 text-primary-100 max-w-3xl mx-auto font-normal leading-relaxed">
              Verify <strong>ANY real-world data feed</strong> — supply chains, flight delays, energy grids, weather sensors, or financial assets — using multi-model AI consensus before triggering smart contracts.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {isConnected ? (
                <Link to="/dashboard" className="bg-white text-primary-700 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg text-center">
                  Go to Dashboard →
                </Link>
              ) : (
                <button onClick={connectWallet} className="bg-white text-primary-700 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg text-center inline-flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Connect Wallet
                </button>
              )}
              <Link to="/validator" className="bg-primary-800/80 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-primary-900 transition-all border-2 border-white/30 text-center">
                Try Universal Validator →
              </Link>
            </div>

            {/* Floating stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
              {stats.map(({ label, value }) => (
                <div key={label} className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-5 text-center">
                  <div className="text-3xl font-extrabold text-white mb-1">{value}</div>
                  <div className="text-xs font-medium text-primary-200 uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="text-gray-600 mt-2 text-lg">Three-step process from raw data to verified on-chain truth</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map(({ icon, title, desc }, i) => (
              <div key={title} className="card relative group hover:-translate-y-1 transition-all duration-200">
                <div className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full w-fit mb-4 border border-primary-100">
                  Step 0{i + 1}
                </div>
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Architecture Diagram ─────────────────────────────────────────── */}
      <section className="py-20 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">System Architecture</h2>
            <p className="text-gray-600 mt-2 text-lg">End-to-end data flow from oracle nodes to smart contracts</p>
          </div>
          
          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 shadow-inner flex flex-wrap items-center justify-center gap-6">
            {[
              { label: 'Oracle Nodes', icon: '🖥️', sub: 'Any API or Sensor' },
              { label: 'AI Engine', icon: '🤖', sub: 'Python Flask' },
              { label: 'Consensus', icon: '⚖️', sub: '3-model ensemble' },
              { label: 'Smart Contract', icon: '⛓️', sub: 'ProvAINetwork.sol' },
            ].map((node, index, arr) => (
              <div key={node.label} className="flex items-center gap-6">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-md text-center w-44">
                  <div className="text-3xl mb-2">{node.icon}</div>
                  <div className="font-bold text-gray-900 text-sm">{node.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{node.sub}</div>
                </div>
                {index < arr.length - 1 && (
                  <div className="text-primary-500 font-bold text-2xl hidden md:block">➔</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use Cases ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Universal Use Cases</h2>
            <p className="text-gray-600 mt-2 text-lg font-normal">Supporting parametric insurance, supply chains, energy grids, and DeFi</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map(({ icon, title, desc }) => (
              <div key={title} className="card hover:shadow-xl transition-shadow">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-primary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Ready to test the Universal AI Oracle?</h2>
          <p className="text-primary-100 max-w-2xl mx-auto mb-8 text-sm">
            Configure custom metrics, paste public API URLs, or try preset scenario templates.
          </p>
          <Link to="/validator" className="bg-white text-primary-700 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition-all inline-block shadow-lg">
            Launch Universal Validator →
          </Link>
        </div>
      </section>
    </div>
  );
}
