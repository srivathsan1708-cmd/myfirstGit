<!-- Dependency badges -->
![Solidity](https://img.shields.io/badge/Solidity-0.8.19-363636?logo=solidity)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Hardhat](https://img.shields.io/badge/Hardhat-2.x-yellow)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python)

# ProvAI Network

A full-stack decentralized oracle network where AI-powered consensus validates on-chain data provenance.

```
provai-network/
├── contracts/          Hardhat project — ProvAINetwork.sol smart contract
├── frontend/           React + Vite + ethers.js dApp
│   ├── src/
│   │   ├── App.jsx     Main UI (wallet, staking, oracle feeds, chain submission)
│   │   ├── contract.js Contract address, ABI, and ethers helpers
│   │   └── index.css   Premium design system
│   └── app.py          (legacy, use ai-engine/app.py)
└── ai-engine/          Python Flask AI consensus engine
    └── app.py          IsolationForest multi-model consensus
```

## How it works

1. **Oracle nodes** submit numeric readings (e.g. sensor values, price feeds)
2. The **Python AI engine** uses `IsolationForest` to detect and discard malicious/outlier nodes
3. If confidence > 95%, the resolved median value can be **anchored on-chain** via `submitVerifiedData`
4. Only nodes with a non-zero on-chain **stake** can submit — a Sybil-resistance mechanism

## Quick start

### 1 — Local blockchain

```bash
cd contracts
npx hardhat node                         # terminal 1 — keep running
npx hardhat ignition deploy ignition/modules/ProvAINetwork.ts --network localhost  # terminal 2
```

### 2 — AI consensus engine

```bash
cd ai-engine
# first time: pip install flask flask-cors scikit-learn pandas numpy
python app.py                            # runs on http://localhost:5001
```

### 3 — Frontend

```bash
cd frontend
npm install
npm run dev                              # runs on http://localhost:5173
```

### 4 — MetaMask setup

| Field          | Value                          |
|----------------|--------------------------------|
| Network name   | Hardhat Local                  |
| RPC URL        | `http://127.0.0.1:8545`        |
| Chain ID       | `31337`                        |
| Currency       | ETH                            |

Import Account #0 private key from the `npx hardhat node` output.

## Contract interface

```solidity
function depositStake() external payable
function submitVerifiedData(bytes32 requestId, uint256 value, uint256 confidenceScore) external
function stakes(address) view returns (uint256)
function verifiedData(bytes32) view returns (uint256 value, uint256 confidenceScore, uint256 timestamp, address provider)
```

**Deployed address (local):** `0x5FbDB2315678afecb367f032d93F642f64180aa3`

## AI engine API

```
POST /verify
Body: { "node_data": [100, 102, 99, 101, 500] }
Response: { "consensus_reached": true, "final_value": 101.0, "confidence": 80.0, "node_count": 5, "valid_count": 4, "outlier_count": 1 }

GET /health
```

## Tech stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Smart contract | Solidity 0.8, Hardhat Ignition  |
| Frontend   | React 19, Vite, ethers.js v6, Tailwind CSS v4 |
| AI engine  | Python, Flask, scikit-learn (IsolationForest) |
| Local chain | Hardhat (chainId 31337)            |
