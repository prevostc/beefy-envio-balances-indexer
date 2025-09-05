import { Initializable } from "generated";

Initializable.Initialized.contractRegister(async ({ event, context }) => {
  const tokenAddress = event.srcAddress;

  context.addERC20Token(tokenAddress);
});
