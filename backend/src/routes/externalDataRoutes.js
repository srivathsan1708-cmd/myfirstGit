const router = require('express').Router();
const axios  = require('axios');

const AI_URL = `http://localhost:${process.env.AI_PORT || 5001}`;

// Helper: proxy to AI engine with error handling
async function proxyToAI(endpoint, data = null, method = 'GET') {
  try {
    const url = `${AI_URL}${endpoint}`;
    const response = method === 'GET'
      ? await axios.get(url, { timeout: 10000 })
      : await axios.post(url, data, { timeout: 10000 });
    return { success: true, data: response.data };
  } catch (err) {
    const status = err.response?.status || 503;
    const message = err.response?.data?.error || err.message || 'AI engine unreachable';
    throw Object.assign(new Error(message), { status });
  }
}

// GET /api/external/weather/:city
router.get('/weather/:city', async (req, res, next) => {
  try {
    const { timeframe = 'today', metric = 'temperature' } = req.query;
    const result = await proxyToAI(`/weather/${encodeURIComponent(req.params.city)}?timeframe=${timeframe}&metric=${metric}`);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/external/crypto/:symbol
router.get('/crypto/:symbol', async (req, res, next) => {
  try {
    const result = await proxyToAI(`/crypto/${encodeURIComponent(req.params.symbol)}`);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/external/flight/:code
router.get('/flight/:code', async (req, res, next) => {
  try {
    const result = await proxyToAI(`/flight/${encodeURIComponent(req.params.code)}`);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/external/universal — proxy universal consensus verification
router.post('/universal', async (req, res, next) => {
  try {
    const result = await proxyToAI('/universal', req.body, 'POST');
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/external/verify — proxy consensus verification
router.post('/verify', async (req, res, next) => {
  try {
    const result = await proxyToAI('/verify', req.body, 'POST');
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/external/health — check AI engine health
router.get('/health', async (req, res) => {
  try {
    const result = await proxyToAI('/health');
    res.json({ ai_engine: result.data, backend: 'healthy' });
  } catch {
    res.json({ ai_engine: 'unreachable', backend: 'healthy' });
  }
});

module.exports = router;
