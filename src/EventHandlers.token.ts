import { BigDecimal, Token, TokenBalance, HandlerContext } from "generated";
import { getOrCreateToken } from "./entities/token.entity";
import { toChainId } from "./lib/chain";
import { config } from "./lib/config";
import { toHex } from "viem";
import { getOrCreateTokenBalanceEntity } from "./entities/balance.entity";
import { BIG_ZERO, interpretAsDecimal } from "./lib/decimal";
import { getOrCreateAccount } from "./entities/account.entity";

const ignoredAddresses = [
  config.ADDRESS_ZERO,
  config.BURN_ADDRESS,
  config.MINT_ADDRESS,
]

Token.Transfer.handler(async ({ event, context }) => {
  const chainId = toChainId(event.chainId)
  const tokenAddress = toHex(event.srcAddress)
  const senderAddress = toHex(event.params._0)
  const receiverAddress = toHex(event.params._1)
  const rawTransferAmount = event.params._2

  if (rawTransferAmount === 0n) {
    context.log.debug("Ignoring transfer with zero value", { transactionHash: event.transaction })
    return
  }

  const [, , senderBalance, receiverBalance, token] = await Promise.all([
    getOrCreateAccount({ context, accountAddress: senderAddress }),
    getOrCreateAccount({ context, accountAddress: receiverAddress }),
    getOrCreateTokenBalanceEntity({ context, tokenAddress, accountAddress: senderAddress }),
    getOrCreateTokenBalanceEntity({ context, tokenAddress, accountAddress: receiverAddress }),
    getOrCreateToken({ context, chainId, tokenAddress, blockNumber: event.block.number }),
  ]);

  const value = interpretAsDecimal(rawTransferAmount, token.decimals)

  let holderCountChange = 0;
  let totalSupplyChange = BIG_ZERO;

  if (!ignoredAddresses.includes(senderAddress)) {
    const diff = await updateAccountBalance({ context, balance: senderBalance, amountDiff: value.negated() })
    holderCountChange += diff.holderCountChange
  }

  if (!ignoredAddresses.includes(receiverAddress)) {
    const diff = await updateAccountBalance({ context, balance: receiverBalance, amountDiff: value })
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


const updateAccountBalance = async ({ context, balance, amountDiff }: { context: HandlerContext, balance: TokenBalance, amountDiff: BigDecimal }) => {
  const before = balance.amount
  const after = balance.amount.plus(amountDiff)

  context.TokenBalance.set({
    ...balance,
    amount: after,
  })

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