import { BigDecimal, Block_t, HandlerContext } from "generated";
import { TokenBalance_t } from "generated/src/db/Entities.gen";
import { Hex } from "viem";


export const getOrCreateTokenBalanceEntity = async ({ context, tokenAddress, accountAddress }: { context: HandlerContext, tokenAddress: Hex, accountAddress: Hex }): Promise<TokenBalance_t> => {
    const accountBalanceId = `${accountAddress}-${tokenAddress}`;

    return await context.TokenBalance.getOrCreate({
        id: accountBalanceId,

        account_id: accountAddress,
        token_id: tokenAddress,

        amount: new BigDecimal(0),
    });
};

export const getOrCreateTokenBalanceSnapshotEntity = async ({ context, tokenAddress, accountAddress, block, balance }: { context: HandlerContext, tokenAddress: Hex, accountAddress: Hex, block: Block_t, balance: BigDecimal }) => {
    return await context.TokenBalanceSnapshot.getOrCreate({
        id: `${accountAddress}-${tokenAddress}-${block.number}`,

        tokenBalance_id: `${accountAddress}-${tokenAddress}`,
        account_id: accountAddress,
        token_id: tokenAddress,

        balance: balance,
        blockNumber: BigInt(block.number),
        blockTimestamp: new Date(block.timestamp * 1000),
    });
};