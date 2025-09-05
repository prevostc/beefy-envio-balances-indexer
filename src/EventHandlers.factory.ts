import { ContractFactory } from "generated";

ContractFactory.ProxyCreated.contractRegister(async ({ event, context }) => {
  const proxyAddress = event.params._0.toLowerCase();

  context.addInitializable(proxyAddress);
});

ContractFactory.BoostDeployed.contractRegister(async ({ event, context }) => {
  const boostAddress = event.params._0.toLowerCase();

  context.addInitializable(boostAddress);
});

ContractFactory.ContractDeployed.contractRegister(async ({ event, context }) => {
  const contractAddress = event.params._1.toLowerCase();

  context.addInitializable(contractAddress);
});