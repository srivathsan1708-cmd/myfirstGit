import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-20 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
                P
              </div>
              <span className="text-xl font-bold text-white">
                ProvAI <span className="text-primary-400">Network</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              AI-powered decentralized oracle network featuring multi-model consensus, weighted truth discovery, and confidence-tied slashing.
            </p>
          </div>

          {/* Product / Nav Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">Product</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/query-data" className="hover:text-white transition-colors">Query Data</Link></li>
              <li><Link to="/validator" className="hover:text-white transition-colors">Validator Node</Link></li>
              <li><Link to="/disputes" className="hover:text-white transition-colors">Disputes</Link></li>
              <li><Link to="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link></li>
              <li><Link to="/become-node" className="hover:text-white transition-colors">Become Node</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">Resources</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><a href="https://hardhat.org" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Hardhat Docs</a></li>
              <li><a href="https://docs.ethers.org" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">ethers.js Docs</a></li>
              <li><a href="https://flask.palletsprojects.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Flask AI Engine</a></li>
              <li><a href="https://scikit-learn.org" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Scikit-learn AI</a></li>
            </ul>
          </div>

          {/* Technical Info */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">Network Info</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span>Hardhat Local Network (Chain 31337)</span>
              </div>
              <p className="text-xs text-gray-500 pt-2">
                Ether / Smart Contracts v1.0.0
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-400">
          <p>© {year} ProvAI Network. All rights reserved.</p>
          <p className="text-xs text-gray-500 mt-2 sm:mt-0">Academic & Decentralized AI Oracle Research</p>
        </div>
      </div>
    </footer>
  );
}
