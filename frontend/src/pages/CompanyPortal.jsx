import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';
import toast from 'react-hot-toast';

export default function CompanyPortal() {
  const {
    currentCompany,
    isCompanyLoggedIn,
    companyRequests,
    loading,
    loginCompany,
    registerCompany,
    logoutCompany,
    createRequest,
  } = useCompany();

  const navigate = useNavigate();

  // Auth form states
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [industry, setIndustry] = useState('Agricultural Insurance');

  // Request form states
  const [requestTitle, setRequestTitle]   = useState('');
  const [type, setType]                   = useState('weather');
  const [query, setQuery]                 = useState('');
  const [unit, setUnit]                   = useState('mm');
  const [weatherMetric, setWeatherMetric] = useState('rainfall'); // 'rainfall' | 'temperature'
  const [timeframe, setTimeframe]         = useState('today');    // 'today' | 'month'
  const [description, setDescription]     = useState('');

  // Preset demo logins
  const demoAccounts = [
    { name: 'AgriShield Crop Insurance', email: 'agrishield@crop.io', pass: 'password123', badge: '🌾 Agriculture' },
    { name: 'SkyProtect Travel Insurance', email: 'skyprotect@airline.com', pass: 'password123', badge: '✈️ Aviation' },
    { name: 'Aave DeFi Protocol', email: 'aave@defi.org', pass: 'password123', badge: '📊 Finance' },
  ];

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in both email and password');
      return;
    }
    await loginCompany(email, password);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }
    await registerCompany({ name, email, password, industry });
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!requestTitle || !query) {
      toast.error('Request Title and Query Parameter are required');
      return;
    }
    const req = await createRequest({
      requestTitle,
      type,
      query,
      unit,
      weatherMetric,
      timeframe,
      description,
    });
    if (req) {
      // Clear form
      setRequestTitle('');
      setQuery('');
      setDescription('');
    }
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'weather') {
      setUnit(weatherMetric === 'rainfall' ? 'mm' : '°C');
    } else if (newType === 'flight') {
      setUnit('Mins Delay');
    } else if (newType === 'crypto') {
      setUnit('USD');
    } else {
      setUnit('Units');
    }
  };

  const handleWeatherMetricChange = (newMetric) => {
    setWeatherMetric(newMetric);
    setUnit(newMetric === 'rainfall' ? 'mm' : '°C');
  };

  const handleRunConsensus = (req) => {
    // Navigate to validator with prefilled query state
    navigate('/validator', {
      state: {
        customRequest: req,
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏢</span>
            <h1 className="text-3xl font-extrabold text-gray-900">Enterprise Company Portal</h1>
          </div>
          <p className="text-gray-600 text-sm mt-1">
            Authenticate using enterprise credentials to configure custom real-world oracle data verification requests.
          </p>
        </div>

        {isCompanyLoggedIn && (
          <button onClick={logoutCompany} className="btn-secondary text-xs self-start md:self-auto">
            🚪 Logout ({currentCompany.name.slice(0, 20)})
          </button>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* CASE A: UNAUTHENTICATED VIEW - LOGIN / REGISTER */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {!isCompanyLoggedIn ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Quick Demo Credentials Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="card space-y-4 bg-gradient-to-br from-primary-50 to-white border-primary-200">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔑</span>
                <h2 className="font-bold text-gray-900 text-base">Quick Demo Enterprise Logins</h2>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Click any of the pre-configured enterprise partner accounts below to log in instantly:
              </p>
              <div className="space-y-3 pt-2">
                {demoAccounts.map((demo) => (
                  <button
                    key={demo.email}
                    onClick={() => {
                      setEmail(demo.email);
                      setPassword(demo.pass);
                      loginCompany(demo.email, demo.pass);
                    }}
                    className="w-full text-left p-3.5 bg-white border border-gray-200 rounded-xl hover:border-primary-500 hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900 group-hover:text-primary-600 transition-colors">
                          {demo.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 font-semibold text-gray-600">
                          {demo.badge}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-gray-500 mt-1">{demo.email}</p>
                    </div>
                    <span className="text-xs font-semibold text-primary-600 group-hover:translate-x-1 transition-transform">
                      Login →
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="card space-y-3 bg-gray-900 text-white">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <span>⚡</span> Enterprise API SLA
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                ProvAI Network provides multi-source ensemble verification (Isolation Forest + LOF + MAD Z-Score) for insurance, financial, and supply chain applications requiring $\ge 95\%$ confidence.
              </p>
            </div>
          </div>

          {/* Login / Register Form Card */}
          <div className="lg:col-span-7 card space-y-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setAuthMode('login')}
                className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Enterprise Login
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Register New Enterprise
              </button>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Company Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. agrishield@crop.io"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={loading} className="btn-primary w-full text-sm py-3">
                    {loading ? 'Authenticating...' : 'Sign In to Enterprise Portal →'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Company Legal Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Global Logistics Corp"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. contact@globallogistics.com"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Industry Sector
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="input-field"
                  >
                    <option value="Agricultural Insurance">Agricultural Insurance</option>
                    <option value="Aviation & Travel">Aviation & Travel</option>
                    <option value="DeFi & Asset Lending">DeFi & Asset Lending</option>
                    <option value="Cold-Chain & Pharma">Cold-Chain & Pharma</option>
                    <option value="Renewable Energy">Renewable Energy</option>
                    <option value="Other Enterprise">Other Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="input-field"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={loading} className="btn-primary w-full text-sm py-3">
                    {loading ? 'Creating Account...' : 'Create Enterprise Account →'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────────── */
        /* CASE B: AUTHENTICATED VIEW - COMPANY DASHBOARD & REQUEST CREATOR */
        /* ─────────────────────────────────────────────────────────────────── */
        <div className="space-y-8">
          {/* Company Profile Header Card */}
          <div className="card bg-gradient-to-r from-slate-900 to-gray-800 text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl px-3 py-1 bg-white/10 rounded-lg backdrop-blur-md">
                  {currentCompany.badge || '🏢'}
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-white">{currentCompany.name}</h2>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{currentCompany.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-2 text-xs text-gray-300">
                <span>Sector: <strong>{currentCompany.industry}</strong></span>
                <span>•</span>
                <span>Status: <strong className="text-green-400">Verified Enterprise</strong></span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1.5 self-start md:self-auto min-w-[260px]">
              <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Enterprise API Key</div>
              <div className="font-mono text-xs text-primary-300 flex items-center justify-between gap-2">
                <span>{currentCompany.apiKey}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentCompany.apiKey);
                    toast.success('API Key copied to clipboard!');
                  }}
                  className="hover:text-white transition-colors text-xs"
                >
                  📋
                </button>
              </div>
            </div>
          </div>

          {/* Create Custom Oracle Data Request Form */}
          <div className="card space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span>📡</span> Submit Custom Enterprise Data Request
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Specify custom real-world parameter parameters to be verified by ProvAI’s 3-model AI consensus ensemble before smart contract execution.
              </p>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Request Title
                  </label>
                  <input
                    type="text"
                    value={requestTitle}
                    onChange={(e) => setRequestTitle(e.target.value)}
                    placeholder="e.g. Verify Chennai Temperature & Rain Feed"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Data Category
                  </label>
                  <select
                    value={type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="input-field"
                  >
                    <option value="weather">Weather & Climate (Open-Meteo API)</option>
                    <option value="flight">Flight Status & Delays (OpenSky API)</option>
                    <option value="crypto">Crypto Price Feed (CoinGecko API)</option>
                    <option value="custom">Custom IoT Sensor Stream</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Target Query / Parameter
                  </label>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      type === 'weather'
                        ? 'e.g. Chennai, Mumbai, London, Tamilnadu'
                        : type === 'flight'
                        ? 'e.g. BA123, IGO3YP, AI101, AA456'
                        : type === 'crypto'
                        ? 'e.g. bitcoin or ethereum'
                        : 'e.g. Sensor-ID-901'
                    }
                    className="input-field"
                    required
                  />
                </div>

                {type === 'weather' ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Weather Metric
                      </label>
                      <select
                        value={weatherMetric}
                        onChange={(e) => handleWeatherMetricChange(e.target.value)}
                        className="input-field"
                      >
                        <option value="rainfall">🌧️ Rainfall (mm)</option>
                        <option value="temperature">🌡️ Temperature (°C)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                        Data Timeframe
                      </label>
                      <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        className="input-field"
                      >
                        <option value="today">📅 Today's Live Data</option>
                        <option value="month">🗓️ 30-Day Cumulative / Average</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Unit of Measurement
                    </label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="e.g. °C, Mins Delay, USD, etc."
                      className="input-field"
                      required
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Smart Contract Business SLA / Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Explain why your contract needs this data verified (e.g. Auto-trigger parametric drought insurance payouts when rain is below threshold)."
                  className="input-field"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                  <span>🎯</span>
                  <span>Required AI Confidence Gate: <strong>&ge; 95%</strong></span>
                </div>
                <button type="submit" disabled={loading} className="btn-primary text-sm px-6 py-2.5">
                  {loading ? 'Submitting...' : '+ Submit Enterprise Request'}
                </button>
              </div>
            </form>
          </div>

          {/* Company Data Requests List */}
          <div className="card space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Your Enterprise Data Requests</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Active requests registered for multi-node oracle AI consensus verification
                </p>
              </div>
              <span className="badge-purple">
                {companyRequests.length} Active {companyRequests.length === 1 ? 'Request' : 'Requests'}
              </span>
            </div>

            {companyRequests.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">
                No custom requests created yet. Use the form above to submit your first data request.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-semibold text-gray-600">
                    <tr>
                      <th className="px-6 py-4">Request Title</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Query Target</th>
                      <th className="px-6 py-4">Consolidated Value</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {companyRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {req.requestTitle}
                          {req.description && (
                            <p className="text-xs text-gray-500 font-normal mt-0.5">{req.description}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="badge-info capitalize">{req.type}</span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-gray-700">
                          {req.query} ({req.unit})
                        </td>
                        <td className="px-6 py-4">
                          {req.status === 'Verified On-Chain' && req.finalValue !== undefined && req.finalValue !== null ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/90 text-emerald-950 rounded-lg border border-emerald-300 font-mono font-black text-sm shadow-sm">
                              <span>⚓</span>
                              <span>{req.finalValue}</span>
                              <span className="text-xs font-sans text-emerald-800 font-bold">{req.unit}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 font-mono text-xs">⏳ Pending Verification</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {req.status === 'Verified On-Chain' ? (
                            <div className="space-y-0.5">
                              <span className="badge-success">✓ {req.status} ({req.confidence}%)</span>
                            </div>
                          ) : (
                            <span className="badge-warning">⏳ {req.status}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleRunConsensus(req)}
                            className="btn-primary text-xs py-1.5 px-3"
                          >
                            Run AI Consensus →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
