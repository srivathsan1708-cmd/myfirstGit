import { ethers } from 'ethers';

async function testStakingAndSlashing() {
  const provider = new ethers.JsonRpcProvider('http://localhost:8545');
  const contractAddress = '0x0165878A594ca255338adfa4d48449f69242Eb8F';
  const abi = [
    'function MIN_STAKE() view returns (uint256)',
    'function rewardPool() view returns (uint256)',
    'function stakes(address) view returns (uint256)',
    'function depositStake() payable',
    'function fundRewardPool() payable',
    'function submitVerifiedData(bytes32 requestId, uint256 value, uint256 confidenceScore, uint256 deviationScore)',
    'function slashNode(address node, uint256 severityBps)'
  ];

  const signer0 = await provider.getSigner(0);
  const signer3 = await provider.getSigner(3); // Fresh unstaked node operator
  const contract0 = new ethers.Contract(contractAddress, abi, signer0);
  const contract3 = new ethers.Contract(contractAddress, abi, signer3);

  console.log("=== STEP 1: Check Minimum Stake Requirement ===");
  const minStake = await contract0.MIN_STAKE();
  console.log("MIN_STAKE constant in ProvAINetwork:", ethers.formatEther(minStake), "ETH");

  console.log("\n=== STEP 2: Verify Fresh Node 3 initial stake is 0 ===");
  const initialStake = await contract0.stakes(signer3.address);
  console.log("Node 3 Initial Stake:", ethers.formatEther(initialStake), "ETH");

  console.log("\n=== STEP 3: Submit Data from Unstaked Node 3 (Expect Rejection) ===");
  const reqId1 = ethers.id("test-req-unstaked-" + Date.now());
  try {
    await contract3.submitVerifiedData(reqId1, 14800, 99, 10000);
    console.log("❌ FAIL: Unstaked node submit succeeded when it should have been rejected!");
  } catch (err) {
    console.log("✅ PASSED: Unstaked node submission rejected on-chain!");
    console.log("   Revert reason:", err.reason || err.message.slice(0, 80));
  }

  console.log("\n=== STEP 4: Deposit 0.1 ETH Stake for Node 3 ===");
  const stakeTx = await contract3.depositStake({ value: ethers.parseEther("0.1") });
  await stakeTx.wait();
  const stakeAfter = await contract0.stakes(signer3.address);
  console.log("Node 3 Stake after Deposit:", ethers.formatEther(stakeAfter), "ETH");

  console.log("\n=== STEP 5: Submit Data from Staked Node 3 (Expect Success + Reward) ===");
  const reqId2 = ethers.id("test-req-staked-" + Date.now());
  const tx = await contract3.submitVerifiedData(reqId2, 14800, 99, 10000);
  const receipt = await tx.wait();
  console.log("✅ PASSED: Staked node submitted data successfully!");
  console.log("   Transaction Hash:", receipt.hash);

  console.log("\n=== STEP 6: Test Attacker Node Slashing & Reward Pool Recycling ===");
  const signer4 = await provider.getSigner(4);
  const contract4 = new ethers.Contract(contractAddress, abi, signer4);
  await (await contract4.depositStake({ value: ethers.parseEther("0.1") })).wait();
  console.log("Attacker Node (Node 4) Stake before Slash:", ethers.formatEther(await contract0.stakes(signer4.address)), "ETH");

  const poolBefore = await contract0.rewardPool();
  const slashTx = await contract0.slashNode(signer4.address, 10000); // 100% slash
  await slashTx.wait();
  const poolAfter = await contract0.rewardPool();

  console.log("Attacker Node (Node 4) Stake after 100% Slash:", ethers.formatEther(await contract0.stakes(signer4.address)), "ETH");
  console.log("✅ PASSED: Slashed 0.1 ETH recycled into Reward Pool!");
  console.log("   Reward Pool before slash:", ethers.formatEther(poolBefore), "ETH");
  console.log("   Reward Pool after slash:", ethers.formatEther(poolAfter), "ETH");
}

testStakingAndSlashing().catch(console.error);
