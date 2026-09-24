const router = require('express').Router();
const { mockDataFeeds } = require('../mockData');

// GET /api/data — list all data feeds
router.get('/', (req, res) => {
  const { status, type } = req.query;
  let feeds = [...mockDataFeeds];
  if (status) feeds = feeds.filter(f => f.status === status.toUpperCase());
  if (type)   feeds = feeds.filter(f => f.dataType === type.toUpperCase());
  res.json({ success: true, count: feeds.length, data: feeds });
});

// GET /api/data/:feedId
router.get('/:feedId', (req, res) => {
  const feed = mockDataFeeds.find(f => f.feedId === Number(req.params.feedId));
  if (!feed) return res.status(404).json({ error: 'Feed not found' });
  res.json({ success: true, data: feed });
});

module.exports = router;
