import { ContractFactory } from "generated";

ContractFactory.ProxyCreated.contractRegister(async ({ event, context }) => {
  const proxyAddress = event.params._0.toLowerCase();

  context.log.info("ProxyCreated", { proxyAddress });

  context.addToken(proxyAddress);
});

ContractFactory.BoostDeployed.contractRegister(async ({ event, context }) => {
  const boostAddress = event.params._0.toLowerCase();

  context.log.info("BoostDeployed", { boostAddress });

  context.addToken(boostAddress);
});

ContractFactory.ContractDeployed.contractRegister(async ({ event, context }) => {
  const contractAddress = event.params._1.toLowerCase();

  context.log.info("ContractDeployed", { contractAddress });

  context.addToken(contractAddress);
});