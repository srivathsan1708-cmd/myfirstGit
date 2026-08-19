import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ProvAINetworkModule", (m) => {
  const provAI = m.contract("ProvAINetwork");

  return { provAI };
});