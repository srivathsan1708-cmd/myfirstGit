import { ethers } from "ethers";

export const CONTRACT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

export const CONTRACT_ABI = [
  // Stake
  "function depositStake() payable",
  "function stakes(address) view returns (uint256)",

  // Submit verified oracle data (includes deviationScore)
  "function submitVerifiedData(bytes32 requestId, uint256 value, uint256 confidenceScore, uint256 deviationScore)",

  // Confidence-tied slashing
  "function slashNode(address node, uint256 severityBps)",
  "function calculateSlash(address node, uint256 severityBps) view returns (uint256)",

  // Query stored data
  "function verifiedData(bytes32) view returns (uint256 value, uint256 confidenceScore, uint256 timestamp, address provider, uint256 deviationScore)",

  // ── Reward pool ────────────────────────────────────────────────────────────
  "function fundRewardPool() payable",
  "function rewardPool() view returns (uint256)",
  "function totalRewards(address) view returns (uint256)",
  "function poolBasisPoints() view returns (uint256)",
  "function setPoolBasisPoints(uint256 bps)",
  "function calculateReward(uint256 confidenceScore) view returns (uint256)",

  // Events
  "event DataSubmitted(bytes32 indexed requestId, uint256 value, uint256 confidence, uint256 deviationScore)",
  "event StakeDeposited(address indexed node, uint256 amount)",
  "event NodeSlashed(address indexed node, uint256 slashAmount, uint256 severityBps)",
  "event RewardPaid(address indexed node, uint256 amount, uint256 confidence)",
  "event PoolFunded(address indexed funder, uint256 amount, uint256 newPool)",
];

export async function getSignerContract() {
  if (!window.ethereum) throw new Error("MetaMask not found. Please install it.");
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

export async function getAddress() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  return accounts[0];
}