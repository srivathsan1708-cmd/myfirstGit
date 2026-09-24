import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useCompany } from '../context/CompanyContext';
import { ethers } from 'ethers';

function shortenAddr(addr) {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
}

export default function Navbar() {
  const { account, isConnected, stakeBalance, connectWallet, loading } = useWeb3();
  const { currentCompany, isCompanyLoggedIn } = useCompany();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/',                 label: 'Home' },
    { to: '/dashboard',        label: 'Dashboard' },
    { to: '/validator',        label: 'Validator' },
    { to: '/leaderboard',      label: 'Leaderboard' },
    { to: '/company-portal',   label: 'Enterprise Portal' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3" onClick={() => setMenuOpen(false)}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
              P
            </div>
            <span className="text-xl font-bold text-gray-900">
              ProvAI <span className="text-primary-600">Network</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary-600 font-semibold border-b-2 border-primary-600 py-1'
                      : 'text-gray-700 hover:text-primary-600 py-1'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Wallet + Company Badge + Mobile Toggle */}
          <div className="flex items-center space-x-3">
            {isCompanyLoggedIn && (
              <Link to="/company-portal" className="hidden lg:inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-purple-200 hover:bg-purple-100 transition-colors">
                🏢 {currentCompany.name.slice(0, 16)}...
              </Link>
            )}

            {isConnected ? (
              <div className="flex items-center space-x-3">
                {stakeBalance != null && (
                  <span className="hidden sm:inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-primary-200">
                    ⚡ {parseFloat(ethers.formatEther(stakeBalance)).toFixed(4)} ETH Staked
                  </span>
                )}
                <div className="px-3.5 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-semibold border border-green-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  {shortenAddr(account)}
                </div>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="btn-primary text-sm"
              >
                {loading ? (
                  <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Connect Wallet
                  </>
                )}
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              className="md:hidden text-gray-700 hover:text-gray-900 focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-4 space-y-2">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'
                }`
              }
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
