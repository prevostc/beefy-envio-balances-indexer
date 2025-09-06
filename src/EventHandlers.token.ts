import { BigDecimal, Token, HandlerContext, Token_Transfer_event } from "generated";
import { getOrCreateToken } from "./entities/token.entity";
import { toChainId, ChainId } from "./lib/chain";
import { config } from "./lib/config";
import { Hex } from "viem";
import { getOrCreateTokenBalanceEntity, getOrCreateTokenBalanceSnapshotEntity } from "./entities/balance.entity";
import { BIG_ZERO, interpretAsDecimal } from "./lib/decimal";

const ignoredAddresses = [
  config.ADDRESS_ZERO,
  config.BURN_ADDRESS,
  config.MINT_ADDRESS,
]

Token.Transfer.handler(async ({ event, context }) => {
  const chainId = toChainId(event.chainId)
  const tokenAddress = event.srcAddress.toString().toLowerCase() as Hex
  const senderAddress = event.params.from.toString().toLowerCase() as Hex
  const receiverAddress = event.params.to.toString().toLowerCase() as Hex
  const rawTransferAmount = event.params.value

  if (rawTransferAmount === 0n) {
    context.log.debug("Ignoring transfer with zero value")
    return
  }

  const [senderBalance, receiverBalance, token] = await Promise.all([
    getOrCreateTokenBalanceEntity({ context, tokenAddress, accountAddress: senderAddress, chainId }),
    getOrCreateTokenBalanceEntity({ context, tokenAddress, accountAddress: receiverAddress, chainId }),
    getOrCreateToken({ context, chainId, tokenAddress }),
  ]);

  const value = interpretAsDecimal(rawTransferAmount, token.decimals)

  let holderCountChange = 0;
  let totalSupplyChange = BIG_ZERO;

  if (!ignoredAddresses.includes(senderAddress)) {
    const diff = await updateAccountBalance({ context, amountDiff: value.negated(), accountAddress: senderAddress, tokenAddress, event, chainId })
    holderCountChange += diff.holderCountChange
  }

  if (!ignoredAddresses.includes(receiverAddress)) {
    const diff = await updateAccountBalance({ context, amountDiff: value, accountAddress: receiverAddress, tokenAddress, event, chainId })
    holderCountChange += diff.holderCountChange
  }

  if (senderAddress === config.MINT_ADDRESS) {
    totalSupplyChange = totalSupplyChange.plus(value)
  }
  if (receiverAddress === config.BURN_ADDRESS) {
    totalSupplyChange = totalSupplyChange.minus(value)
  }

  context.Token.set({
    ...token,
    holderCount: token.holderCount + holderCountChange,
    totalSupply: token.totalSupply.plus(totalSupplyChange),
  })
});


const updateAccountBalance = async ({ context, amountDiff, accountAddress, tokenAddress, event, chainId }: { context: HandlerContext, amountDiff: BigDecimal, accountAddress: Hex, tokenAddress: Hex, event: Token_Transfer_event, chainId: ChainId }) => {

  const balance = await getOrCreateTokenBalanceEntity({ context, tokenAddress, accountAddress, chainId });

  const before = balance.amount
  const after = balance.amount.plus(amountDiff)

  context.Account.getOrCreate({
    id: accountAddress,
  })

  context.TokenBalance.set({
    ...balance,
    amount: after,
  })

  const balanceSnapshot = await getOrCreateTokenBalanceSnapshotEntity({ context, tokenAddress, accountAddress, block: event.block, balance: after, chainId })
  context.TokenBalanceSnapshot.set({
    ...balanceSnapshot,
    balance: after,
  });

  let holderCountChange = 0;
  if (before.eq(BIG_ZERO) && !after.eq(BIG_ZERO)) {
    holderCountChange = 1;
  }
  if (!before.eq(BIG_ZERO) && after.eq(BIG_ZERO)) {
    holderCountChange = -1;
  }

  return {
    before,
    after,
    holderCountChange,
  }
}