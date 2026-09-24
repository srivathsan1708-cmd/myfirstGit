import { ethers } from "hardhat";

async function main() {
  const ProvAINetwork = await ethers.getContractFactory("ProvAINetwork");
  const contract = await ProvAINetwork.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("ProvAINetwork deployed to:", address);

  // Fund reward pool with 5 ETH
  const fundTx = await contract.fundRewardPool({ value: ethers.parseEther("5.0") });
  await fundTx.wait();
  console.log("Funded Reward Pool with 5.0 ETH");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
