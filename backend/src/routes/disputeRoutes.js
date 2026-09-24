const router = require('express').Router();
const { mockDisputes } = require('../mockData');

const disputes = [...mockDisputes];

// GET /api/disputes
router.get('/', (req, res) => {
  const { status } = req.query;
  let result = [...disputes];
  if (status) result = result.filter(d => d.status === status.toUpperCase());
  res.json({ success: true, count: result.length, data: result });
});

// GET /api/disputes/:id
router.get('/:id', (req, res) => {
  const d = disputes.find(d => d.id === Number(req.params.id));
  if (!d) return res.status(404).json({ error: 'Dispute not found' });
  res.json({ success: true, data: d });
});

// POST /api/disputes — create new dispute
router.post('/', (req, res) => {
  const { feedId, reason, evidence, disputedBy } = req.body;
  if (!feedId || !reason) return res.status(400).json({ error: 'feedId and reason are required' });
  const d = {
    id: disputes.length + 1,
    feedId: Number(feedId),
    reason,
    evidence: evidence || '',
    disputedBy: disputedBy || '0x0000000000000000000000000000000000000000',
    status: 'PENDING',
    votes: [],
    createdAt: new Date(),
  };
  disputes.push(d);
  res.status(201).json({ success: true, data: d });
});

// POST /api/disputes/:id/vote
router.post('/:id/vote', (req, res) => {
  const { voter, vote } = req.body;
  if (!voter || !vote) return res.status(400).json({ error: 'voter and vote are required' });
  const d = disputes.find(d => d.id === Number(req.params.id));
  if (!d) return res.status(404).json({ error: 'Dispute not found' });
  if (d.status !== 'VOTING') return res.status(400).json({ error: 'Dispute is not in VOTING status' });
  const existing = d.votes.find(v => v.voter.toLowerCase() === voter.toLowerCase());
  if (existing) return res.status(400).json({ error: 'Already voted' });
  d.votes.push({ voter, vote: vote.toUpperCase(), timestamp: new Date() });
  res.json({ success: true, data: d });
});

module.exports = router;
