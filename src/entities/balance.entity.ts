import { BigDecimal, Block_t, HandlerContext } from "generated";
import { ChainId } from "../lib/chain";
import { TokenBalance_t } from "generated/src/db/Entities.gen";
import { Hex } from "viem";


export const getOrCreateTokenBalanceEntity = async ({ context, tokenAddress, accountAddress, chainId }: { context: HandlerContext, tokenAddress: Hex, accountAddress: Hex, chainId: ChainId }): Promise<TokenBalance_t> => {
    const accountBalanceId = `${accountAddress}-${tokenAddress}`;

    return await context.TokenBalance.getOrCreate({
        id: accountBalanceId,

        chainId: chainId,

        account_id: accountAddress,
        token_id: tokenAddress,

        amount: new BigDecimal(0),
    });
};

export const getOrCreateTokenBalanceSnapshotEntity = async ({ context, tokenAddress, accountAddress, block, balance, chainId }: { context: HandlerContext, tokenAddress: Hex, accountAddress: Hex, block: Block_t, balance: BigDecimal, chainId: ChainId }) => {
    return await context.TokenBalanceSnapshot.getOrCreate({
        id: `${accountAddress}-${tokenAddress}-${block.number}`,

        chainId: chainId,

        tokenBalance_id: `${accountAddress}-${tokenAddress}`,
        account_id: accountAddress,
        token_id: tokenAddress,

        balance: balance,
        blockNumber: BigInt(block.number),
        blockTimestamp: new Date(block.timestamp * 1000),
    });
};