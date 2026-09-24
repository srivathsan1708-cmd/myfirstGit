// Mock data for oracle nodes (since we use ETH staking, not a DB)
const mockOracles = [
  {
    address: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    name: 'AlphaNode',
    description: 'High-accuracy weather and crypto data provider',
    location: 'US-East',
    stake: '0.5',
    reputation: 9500,
    totalDataPoints: 150,
    accurateDataPoints: 143,
    isActive: true,
    registeredAt: new Date(Date.now() - 86400000 * 30),
    lastActive: new Date(),
  },
  {
    address: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    name: 'BetaNode',
    description: 'IoT and sensor data specialist',
    location: 'EU-Central',
    stake: '0.3',
    reputation: 8800,
    totalDataPoints: 120,
    accurateDataPoints: 106,
    isActive: true,
    registeredAt: new Date(Date.now() - 86400000 * 25),
    lastActive: new Date(),
  },
  {
    address: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
    name: 'GammaData',
    description: 'Cryptocurrency price feeds specialist',
    location: 'Asia-Pacific',
    stake: '0.8',
    reputation: 9800,
    totalDataPoints: 200,
    accurateDataPoints: 196,
    isActive: true,
    registeredAt: new Date(Date.now() - 86400000 * 40),
    lastActive: new Date(),
  },
  {
    address: '0x90f79bf6eb2c4f870365e785982e1f101e93b906',
    name: 'DeltaOracle',
    description: 'General purpose data provider',
    location: 'US-West',
    stake: '0.1',
    reputation: 7200,
    totalDataPoints: 80,
    accurateDataPoints: 58,
    isActive: true,
    registeredAt: new Date(Date.now() - 86400000 * 15),
    lastActive: new Date(),
  },
];

const mockDataFeeds = [
  {
    feedId: 1, dataType: 'PRICE', query: 'ETH/USD price',
    status: 'VERIFIED', consensusValue: 2456.78, consensusConfidence: 9500,
    requester: '0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199',
    createdAt: new Date(Date.now() - 7200000), verifiedAt: new Date(Date.now() - 3300000),
  },
  {
    feedId: 2, dataType: 'WEATHER', query: 'New York temperature',
    status: 'VERIFIED', consensusValue: 22, consensusConfidence: 8900,
    requester: '0xa0ee7a142d267c1f36714e4a8f75612f20a79720',
    createdAt: new Date(Date.now() - 10800000), verifiedAt: new Date(Date.now() - 5100000),
  },
  {
    feedId: 3, dataType: 'PRICE', query: 'BTC/USD price',
    status: 'PENDING', consensusValue: null, consensusConfidence: null,
    requester: '0x71be63f3384f5fb98995898a86b02fb2426c5788',
    createdAt: new Date(Date.now() - 1800000),
  },
  {
    feedId: 4, dataType: 'WEATHER', query: 'London humidity',
    status: 'DISPUTED', consensusValue: 75, consensusConfidence: 7500,
    requester: '0xfabb0ac9d68b0b445fb7357272ff202c5651694a',
    createdAt: new Date(Date.now() - 21600000), verifiedAt: new Date(Date.now() - 14100000),
  },
];

const mockDisputes = [
  {
    id: 1, feedId: 4, disputedBy: '0xdf3e18d64bc6a983f673ab319ccae4f1a57c7097',
    reason: 'Significantly different from verified weather station data',
    evidence: 'Official weather station reported 68% humidity at the same time',
    status: 'VOTING',
    votes: [
      { voter: mockOracles[0].address, vote: 'UPHOLD', timestamp: new Date(Date.now() - 3600000) },
      { voter: mockOracles[1].address, vote: 'UPHOLD', timestamp: new Date(Date.now() - 3500000) },
    ],
    createdAt: new Date(Date.now() - 7200000),
  },
];

module.exports = { mockOracles, mockDataFeeds, mockDisputes };
