const router  = require('express').Router();
const { mockOracles } = require('../mockData');

// GET /api/oracles — list all oracle nodes
router.get('/', (req, res) => {
  res.json({ success: true, count: mockOracles.length, data: mockOracles });
});

// GET /api/oracles/:address
router.get('/:address', (req, res) => {
  const oracle = mockOracles.find(o => o.address.toLowerCase() === req.params.address.toLowerCase());
  if (!oracle) return res.status(404).json({ error: 'Oracle not found' });
  res.json({ success: true, data: oracle });
});

module.exports = router;
