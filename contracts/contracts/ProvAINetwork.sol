// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ProvAINetwork
 * @notice Decentralized oracle with confidence-tied slashing AND confidence-scaled
 *         rewards for honest nodes.
 *
 * Reward mechanism:
 *  - Anyone can fund the shared reward pool via fundRewardPool().
 *  - Slashed ETH is automatically recycled into the reward pool (v2 fulfilment).
 *  - Each successful submitVerifiedData() call with confidence > 80 triggers
 *    an automatic payout scaled by confidence:
 *        reward = poolPerRound × (confidenceScore − 80) / 20
 *    where poolPerRound = rewardPool × poolBasisPoints / 10000
 *  - A totalRewards mapping accumulates lifetime earnings per node for a
 *    leaderboard.
 *
 * Slashing:
 *  - Penalties scale continuously with deviation severity (0–10000 bps).
 *  - Slashed ETH flows into rewardPool instead of sitting idle.
 */
contract ProvAINetwork {

    // ─── Data Structures ──────────────────────────────────────────────────────

    struct OracleData {
        uint256 value;           // Verified value scaled ×100
        uint256 confidenceScore; // AI ensemble confidence (0–100)
        uint256 timestamp;
        address provider;
        uint256 deviationScore;  // Worst-outlier deviation in basis points
    }

    // ─── State ────────────────────────────────────────────────────────────────

    uint256 public constant MIN_STAKE = 0.1 ether;

    mapping(bytes32  => OracleData) public verifiedData;
    mapping(address  => uint256)    public stakes;

    /// @notice Lifetime rewards earned per oracle node (for leaderboard).
    mapping(address  => uint256)    public totalRewards;

    /// @notice Shared ETH pool from which rewards are paid out.
    uint256 public rewardPool;

    /**
     * @notice Fraction of the reward pool paid out per winning submission,
     *         in basis points (default 100 = 1%).
     *         Governance: owner can adjust, bounded to [10, 1000].
     */
    uint256 public poolBasisPoints = 100;

    address public owner;

    // ─── Events ───────────────────────────────────────────────────────────────

    event DataSubmitted(
        bytes32 indexed requestId,
        uint256 value,
        uint256 confidence,
        uint256 deviationScore
    );
    event StakeDeposited(address indexed node, uint256 amount);
    event NodeSlashed(address indexed node, uint256 slashAmount, uint256 severityBps);

    /**
     * @notice Fired when a node earns a reward for a high-confidence submission.
     * @param node   The rewarded oracle node.
     * @param amount Wei transferred to the node.
     * @param confidence The confidence score that triggered the reward.
     */
    event RewardPaid(address indexed node, uint256 amount, uint256 confidence);

    /**
     * @notice Fired when ETH is added to the reward pool.
     * @param funder  The address that sent ETH.
     * @param amount  Wei added to the pool.
     * @param newPool New pool total after funding.
     */
    event PoolFunded(address indexed funder, uint256 amount, uint256 newPool);

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // ─── Functions ────────────────────────────────────────────────────────────

    /// @notice Lock ETH as oracle node stake.
    function depositStake() external payable {
        require(msg.value > 0, "Must stake more than 0");
        stakes[msg.sender] += msg.value;
        emit StakeDeposited(msg.sender, msg.value);
    }

    /// @notice Add ETH to the shared reward pool.
    function fundRewardPool() external payable {
        require(msg.value > 0, "Must send ETH to fund pool");
        rewardPool += msg.value;
        emit PoolFunded(msg.sender, msg.value, rewardPool);
    }

    /**
     * @notice Adjust what fraction of the pool is paid per winning round.
     * @param bps Basis points; must be between 10 (0.1%) and 1000 (10%).
     */
    function setPoolBasisPoints(uint256 bps) external onlyOwner {
        require(bps >= 10 && bps <= 1000, "bps must be 10-1000");
        poolBasisPoints = bps;
    }

    /**
     * @notice Submit AI-verified oracle data on-chain.
     *         Requires submitter to have deposited at least MIN_STAKE (0.1 ETH).
     *         If the reward pool has funds and confidence >= 95, an automatic
     *         confidence-scaled ETH reward is paid to the submitter.
     *
     * @param requestId       Unique identifier for this data request.
     * @param value           The verified consensus value (scaled ×100).
     * @param confidenceScore AI ensemble confidence – must exceed 95.
     * @param deviationScore  Worst outlier deviation in basis points.
     */
    function submitVerifiedData(
        bytes32 requestId,
        uint256 value,
        uint256 confidenceScore,
        uint256 deviationScore
    ) external {
        require(stakes[msg.sender] >= MIN_STAKE, "Must stake at least 0.1 ETH to submit oracle data");
        require(confidenceScore >= 95, "ProvAI consensus confidence threshold (>= 95%) not met");

        verifiedData[requestId] = OracleData({
            value:           value,
            confidenceScore: confidenceScore,
            timestamp:       block.timestamp,
            provider:        msg.sender,
            deviationScore:  deviationScore
        });

        emit DataSubmitted(requestId, value, confidenceScore, deviationScore);

        // ── Confidence-scaled reward payout ───────────────────────────────────
        // reward = poolPerRound × (confidence − 95) / 5
        // confidence 100 → full poolPerRound; confidence 96 → 20% of poolPerRound
        if (rewardPool > 0) {
            uint256 poolPerRound = (rewardPool * poolBasisPoints) / 10000;
            if (poolPerRound > 0) {
                // Scale: (confidence - 95) / 5, using integer math ×1000
                uint256 scaledFactor = ((confidenceScore - 95) * 1000) / 5; // 0–1000
                uint256 reward = (poolPerRound * scaledFactor) / 1000;
                if (reward > rewardPool) reward = rewardPool; // safety cap
                if (reward > 0) {
                    rewardPool -= reward;
                    totalRewards[msg.sender] += reward;
                    (bool sent, ) = payable(msg.sender).call{value: reward}("");
                    require(sent, "Reward transfer failed");
                    emit RewardPaid(msg.sender, reward, confidenceScore);
                }
            }
        }
    }

    /**
     * @notice Confidence-tied slashing. Slashed ETH is recycled into rewardPool.
     *
     * slashAmount = stakes[node] × severityBps / 10000
     *
     * @param node        Address of the penalised node.
     * @param severityBps Basis points of stake to slash (0–10000).
     */
    function slashNode(address node, uint256 severityBps) external {
        require(severityBps <= 10000, "Severity cannot exceed 100%");
        require(stakes[node] > 0, "Node has no stake to slash");

        uint256 slashAmount = (stakes[node] * severityBps) / 10000;
        stakes[node] -= slashAmount;

        // Slashed ETH is recycled into the reward pool
        rewardPool += slashAmount;

        emit NodeSlashed(node, slashAmount, severityBps);
        emit PoolFunded(address(this), slashAmount, rewardPool);
    }

    /**
     * @notice View-only helper so the UI can preview the slash amount before submitting.
     */
    function calculateSlash(address node, uint256 severityBps) external view returns (uint256) {
        if (stakes[node] == 0 || severityBps == 0) return 0;
        return (stakes[node] * severityBps) / 10000;
    }

    /**
     * @notice Preview the reward a node would earn for a given confidence score
     *         given the current pool state. Returns 0 if pool is empty.
     */
    function calculateReward(uint256 confidenceScore) external view returns (uint256) {
        if (rewardPool == 0 || confidenceScore < 95) return 0;
        uint256 poolPerRound  = (rewardPool * poolBasisPoints) / 10000;
        uint256 scaledFactor  = ((confidenceScore - 95) * 1000) / 5;
        uint256 reward        = (poolPerRound * scaledFactor) / 1000;
        return reward > rewardPool ? rewardPool : reward;
    }
}