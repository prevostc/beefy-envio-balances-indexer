import { ClassicBoostFactory, ClassicVaultFactory, CLMManagerFactory, ContractFactory, RewardPoolFactory } from "generated";
import { getDetectClassicVaultOrStrategy } from "./effects/factory.effects";

ClassicVaultFactory.VaultOrStrategyCreated.contractRegister(async ({ event, context }) => {
  const proxyAddress = event.params._0.toLowerCase();


  const { isVault, isStrategy } = await getDetectClassicVaultOrStrategy({ contractAddress: proxyAddress as `0x${string}`, chainId: 8453, blockNumber: event.block.number });

  if (isVault) {
    context.addToken(proxyAddress);
    context.log.info("Vault detected, adding to context", { proxyAddress });
  } else if (isStrategy) {
    context.log.info("Strategy detected, ignoring", { proxyAddress });
  }
});

ClassicBoostFactory.BoostCreated.contractRegister(async ({ event, context }) => {
  const boostAddress = event.params._0.toLowerCase();

  context.addToken(boostAddress);

  context.log.info("BoostDeployed", { boostAddress });
});

RewardPoolFactory.RewardPoolCreated.contractRegister(async ({ event, context }) => {
  const contractAddress = event.params._0.toLowerCase();

  context.addToken(contractAddress);

  context.log.info("RewardPoolCreated", { contractAddress });
});

CLMManagerFactory.CLMManagerCreated.contractRegister(async ({ event, context }) => {
  const contractAddress = event.params._0.toLowerCase();

  context.addToken(contractAddress);

  context.log.info("CLMManagerCreated", { contractAddress });
});

ContractFactory.ContractDeployed.contractRegister(async ({ event, context }) => {
  const contractAddress = event.params._0.toLowerCase();

  context.addToken(contractAddress);

  context.log.info("ContractDeployed", { contractAddress });
});

