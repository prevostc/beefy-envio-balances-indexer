import { ContractFactory } from "generated";

ContractFactory.ProxyCreated.contractRegister(async ({ event, context }) => {
  const proxyAddress = event.params._0.toLowerCase();

  context.addInitializable(proxyAddress);
});
