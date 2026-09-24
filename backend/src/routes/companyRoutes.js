const express = require('express');
const router  = express.Router();

// Mock in-memory DB for companies & requests
const companies = [
  {
    id: 'comp_1',
    name: 'AgriShield Crop Insurance Co.',
    email: 'agrishield@crop.io',
    password: 'password123',
    industry: 'Agricultural Insurance',
    badge: '🌾 Insurance',
    apiKey: 'pvk_live_agrishield_9921',
  },
  {
    id: 'comp_2',
    name: 'SkyProtect Travel Insurance',
    email: 'skyprotect@airline.com',
    password: 'password123',
    industry: 'Aviation & Travel',
    badge: '✈️ Travel',
    apiKey: 'pvk_live_skyprotect_4412',
  },
  {
    id: 'comp_3',
    name: 'Aave / Compound DeFi Protocol',
    email: 'aave@defi.org',
    password: 'password123',
    industry: 'DeFi & Asset Lending',
    badge: '📊 Finance',
    apiKey: 'pvk_live_aave_7718',
  },
];

let requests = [
  {
    id: 'req_101',
    companyId: 'comp_1',
    companyName: 'AgriShield Crop Insurance Co.',
    requestTitle: 'Verify Mumbai Weather & Rainfall',
    type: 'weather',
    query: 'Mumbai',
    unit: '°C',
    nodes: [28.5, 28.2, 28.7, 28.4, 28.6, 45.0],
    description: 'Verify regional temperature & precipitation feed to auto-trigger parametric drought payouts.',
    status: 'Verified On-Chain',
    confidence: 99,
    finalValue: 28.5,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'req_102',
    companyId: 'comp_2',
    companyName: 'SkyProtect Travel Insurance',
    requestTitle: 'Verify Flight BA123 Delay Status',
    type: 'flight',
    query: 'BA123',
    unit: 'Mins Delay',
    nodes: [142, 145, 140, 144, 141, 0],
    description: 'Verify delay minutes for British Airways BA123 to authorize instant passenger compensation.',
    status: 'Verified On-Chain',
    confidence: 98,
    finalValue: 142,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'req_103',
    companyId: 'comp_3',
    companyName: 'Aave / Compound DeFi Protocol',
    requestTitle: 'Verify Bitcoin Market Price Feed',
    type: 'crypto',
    query: 'bitcoin',
    unit: 'USD',
    nodes: [64200, 64150, 64220, 64180, 64210, 95000],
    description: 'Fetch multi-exchange Bitcoin prices to update lending collateral ratios safely.',
    status: 'Pending Consensus',
    confidence: null,
    finalValue: null,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

// POST /api/company/register
router.post('/register', (req, res) => {
  const { name, email, password, industry } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = companies.find(c => c.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Company with this email already exists' });
  }

  const newCompany = {
    id: `comp_${Date.now()}`,
    name,
    email,
    password,
    industry: industry || 'Enterprise Solutions',
    badge: '🏢 Enterprise',
    apiKey: `pvk_live_${name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Math.floor(1000 + Math.random() * 9000)}`,
  };

  companies.push(newCompany);

  const { password: _, ...companyData } = newCompany;
  res.status(201).json({
    message: 'Company registered successfully',
    company: companyData,
    token: `mock_jwt_token_${newCompany.id}`,
  });
});

// POST /api/company/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const company = companies.find(c => c.email.toLowerCase() === email.toLowerCase() && c.password === password);
  if (!company) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { password: _, ...companyData } = company;
  res.json({
    message: 'Login successful',
    company: companyData,
    token: `mock_jwt_token_${company.id}`,
  });
});

// GET /api/company/requests
router.get('/requests', (req, res) => {
  const { companyId } = req.query;
  let filtered = requests;
  if (companyId) {
    filtered = requests.filter(r => r.companyId === companyId);
  }
  res.json({ requests: filtered });
});

// POST /api/company/requests
router.post('/requests', async (req, res) => {
  const { companyId, companyName, requestTitle, type, query, unit, description, targetConfidence, weatherMetric, timeframe } = req.body;
  if (!requestTitle || !type || !query) {
    return res.status(400).json({ error: 'requestTitle, type, and query are required' });
  }

  const cleanQuery = query.trim();
  if (cleanQuery.length < 2) {
    return res.status(400).json({ error: 'Query parameter must be at least 2 characters long' });
  }

  let simulatedNodes = [100, 101, 99, 100.5, 99.8, 150];
  let defaultUnit = unit || 'Units';
  const metricOpt = weatherMetric || 'rainfall';
  const timeframeOpt = timeframe || 'today';

  // ── Query Validation via AI Engine ───────────────────────────────────────
  try {
    const aiPort = process.env.AI_PORT || 5001;
    let validateUrl;

    if (type === 'weather') {
      validateUrl = `http://localhost:${aiPort}/weather/${encodeURIComponent(cleanQuery)}?metric=${metricOpt}&timeframe=${timeframeOpt}`;
      defaultUnit = metricOpt === 'rainfall' ? 'mm' : '°C';
    } else if (type === 'crypto') {
      validateUrl = `http://localhost:${aiPort}/crypto/${encodeURIComponent(cleanQuery.toLowerCase())}`;
    } else if (type === 'flight') {
      validateUrl = `http://localhost:${aiPort}/flight/${encodeURIComponent(cleanQuery.toUpperCase())}`;
    }

    if (validateUrl) {
      const aiRes = await fetch(validateUrl);
      const aiData = await aiRes.json();

      if (!aiRes.ok || aiData.valid === false) {
        return res.status(400).json({
          error: aiData.error || `Invalid ${type} query parameter '${cleanQuery}'. Please enter a valid input.`
        });
      }

      // If valid, extract nodes from real sources if available
      if (aiData.sources && Array.isArray(aiData.sources)) {
        simulatedNodes = aiData.sources.map(s => Number(s.value ?? s.price ?? s.delay_minutes ?? 0));
        if (simulatedNodes.length === 5) {
          const outlierVal = simulatedNodes[0] > 1000 ? simulatedNodes[0] * 1.5 : simulatedNodes[0] + 25;
          simulatedNodes.push(Number(outlierVal.toFixed(1)));
        }
      }
      if (aiData.unit) defaultUnit = aiData.unit;
    }
  } catch (err) {
    console.warn('AI Engine validation check skipped or failed:', err.message);
  }

  const newRequest = {
    id: `req_${Date.now()}`,
    companyId: companyId || 'comp_custom',
    companyName: companyName || 'Custom Enterprise Partner',
    requestTitle,
    type,
    query: cleanQuery,
    unit: defaultUnit,
    weatherMetric: metricOpt,
    timeframe: timeframeOpt,
    nodes: simulatedNodes,
    description: description || `Verify real-world parameters for ${cleanQuery}`,
    targetConfidence: targetConfidence || 95,
    status: 'Pending Consensus',
    confidence: null,
    finalValue: null,
    createdAt: new Date().toISOString(),
  };

  requests.unshift(newRequest);
  res.status(201).json({ message: 'Request created successfully', request: newRequest });
});

// PATCH /api/company/requests/:id/status
router.patch('/requests/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, confidence, finalValue } = req.body;

  const target = requests.find(r => r.id === id);
  if (!target) {
    return res.status(404).json({ error: 'Request not found' });
  }

  if (status) target.status = status;
  if (confidence !== undefined) target.confidence = confidence;
  if (finalValue !== undefined) target.finalValue = finalValue;

  res.json({ message: 'Request status updated successfully', request: target });
});

module.exports = router;
