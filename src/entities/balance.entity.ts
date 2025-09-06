import { BigDecimal, type Block_t, type HandlerContext } from 'generated';
import type { TokenBalance_t } from 'generated/src/db/Entities.gen';
import type { Hex } from 'viem';
import type { ChainId } from '../lib/chain';
import { accountId } from './account.entity';
import { tokenId } from './token.entity';

export const tokenBalanceId = ({
    chainId,
    accountAddress,
    tokenAddress,
}: {
    chainId: ChainId;
    accountAddress: Hex;
    tokenAddress: Hex;
}) => `${chainId}-${accountAddress}-${tokenAddress}`;
export const tokenBalanceSnapshotId = ({
    chainId,
    accountAddress,
    tokenAddress,
    blockNumber,
}: {
    chainId: ChainId;
    accountAddress: Hex;
    tokenAddress: Hex;
    blockNumber: number;
}) => `${chainId}-${accountAddress}-${tokenAddress}-${blockNumber}`;

export const getOrCreateTokenBalanceEntity = async ({
    context,
    tokenAddress,
    accountAddress,
    chainId,
}: {
    context: HandlerContext;
    tokenAddress: Hex;
    accountAddress: Hex;
    chainId: ChainId;
}): Promise<TokenBalance_t> => {
    return await context.TokenBalance.getOrCreate({
        id: tokenBalanceId({ chainId, accountAddress, tokenAddress }),

        chainId: chainId,

        account_id: accountId({ accountAddress }),
        token_id: tokenId({ chainId, tokenAddress }),

        amount: new BigDecimal(0),
    });
};

export const getOrCreateTokenBalanceSnapshotEntity = async ({
    context,
    tokenAddress,
    accountAddress,
    block,
    balance,
    chainId,
}: {
    context: HandlerContext;
    tokenAddress: Hex;
    accountAddress: Hex;
    block: Block_t;
    balance: BigDecimal;
    chainId: ChainId;
}) => {
    return await context.TokenBalanceSnapshot.getOrCreate({
        id: tokenBalanceSnapshotId({ chainId, accountAddress, tokenAddress, blockNumber: block.number }),

        chainId: chainId,

        tokenBalance_id: tokenBalanceId({ chainId, accountAddress, tokenAddress }),
        account_id: accountId({ accountAddress }),
        token_id: tokenId({ chainId, tokenAddress }),

        balance: balance,
        blockNumber: BigInt(block.number),
        blockTimestamp: new Date(block.timestamp * 1000),
    });
};
