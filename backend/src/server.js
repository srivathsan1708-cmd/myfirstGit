require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());
app.use(morgan('dev'));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/oracles',    require('./routes/oracleRoutes'));
app.use('/api/data',       require('./routes/dataRoutes'));
app.use('/api/disputes',   require('./routes/disputeRoutes'));
app.use('/api/external',   require('./routes/externalDataRoutes'));
app.use('/api/company',    require('./routes/companyRoutes'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'provai-backend',
    timestamp: new Date().toISOString(),
    aiEngine: `http://localhost:${process.env.AI_PORT || 5001}`,
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: { message: err.message || 'Internal Server Error' }
  });
});

const PORT = process.env.BACKEND_PORT || 4000;
app.listen(PORT, () => {
  console.log(`✓ ProvAI Backend running on http://localhost:${PORT}`);
  console.log(`✓ AI Engine expected at http://localhost:${process.env.AI_PORT || 5001}`);
});

module.exports = app;
