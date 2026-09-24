import { ethers } from 'ethers';

async function main() {
  const provider = new ethers.JsonRpcProvider('http://localhost:8545');
  const contractAddress = '0x0165878A594ca255338adfa4d48449f69242Eb8F';
  
  const abi = [
    'function rewardPool() view returns (uint256)',
    'function MIN_STAKE() view returns (uint256)',
    'function verifiedData(bytes32) view returns (uint256 value, uint256 confidenceScore, uint256 timestamp, address provider, uint256 deviationScore)',
    'event DataSubmitted(bytes32 indexed requestId, uint256 value, uint256 confidence, uint256 deviationScore)',
    'event StakeDeposited(address indexed node, uint256 amount)',
    'event NodeSlashed(address indexed node, uint256 slashAmount, uint256 severityBps)',
    'event RewardPaid(address indexed node, uint256 amount, uint256 confidence)'
  ];

  const contract = new ethers.Contract(contractAddress, abi, provider);

  console.log("================================================================");
  console.log("⛓️ PROVAI NETWORK — HARDHAT BLOCKCHAIN ON-CHAIN DATA INSPECTOR");
  console.log("================================================================");
  console.log(`Contract Address : ${contractAddress}`);
  console.log(`RPC Node URL     : http://localhost:8545`);
  console.log(`Current Block    : #${await provider.getBlockNumber()}`);
  
  const rewardPool = await contract.rewardPool();
  console.log(`Reward Pool      : ${ethers.formatEther(rewardPool)} ETH`);
  console.log("----------------------------------------------------------------\n");

  console.log("📡 FETCHING ALL ANCHORED 'DataSubmitted' EVENTS FROM BLOCKCHAIN...\n");
  
  const filter = contract.filters.DataSubmitted();
  const events = await contract.queryFilter(filter, 0, 'latest');

  if (events.length === 0) {
    console.log("No anchored data transactions found on-chain yet.");
    return;
  }

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const { requestId, value, confidence, deviationScore } = ev.args;
    const block = await provider.getBlock(ev.blockNumber);
    const scaledVal = (Number(value) / 100).toFixed(2);
    
    console.log(`[Record #${i + 1}]`);
    console.log(`  • Transaction Hash : ${ev.transactionHash}`);
    console.log(`  • Block Number     : #${ev.blockNumber}`);
    console.log(`  • Timestamp        : ${new Date(block.timestamp * 1000).toLocaleString()}`);
    console.log(`  • Request ID (Hash): ${requestId}`);
    console.log(`  • Anchored Value   : ${scaledVal} (Scaled raw: ${value})`);
    console.log(`  • AI Confidence    : ${confidence.toString()}%`);
    console.log(`  • Deviation Score  : ${deviationScore.toString()} bps`);
    console.log("----------------------------------------------------------------");
  }
}

main().catch(console.error);
