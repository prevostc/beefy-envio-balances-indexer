import { BigDecimal, type Block_t, type handlerContext as HandlerContext } from 'generated';
import type { Account_t, Token_t, TokenBalance_t } from 'generated/src/db/Entities.gen';
import type { Hex } from 'viem';
import type { ChainId } from '../lib/chain';
import { BIG_ZERO } from '../lib/decimal';
import { accountId } from './account.entity';
import { tokenId } from './token.entity';

export const tokenBalanceId = ({ chainId, account, token }: { chainId: ChainId; account: Account_t; token: Token_t }) =>
    `${chainId}-${account.address}-${token.address}`;

export const TokenBalanceChangeId = ({
    chainId,
    account,
    token,
    blockNumber,
}: {
    chainId: ChainId;
    account: Account_t;
    token: Token_t;
    blockNumber: number;
}) => `${chainId}-${account.address}-${token.address}-${blockNumber}`;

export const getOrCreateTokenBalanceEntity = async ({
    context,
    token,
    account,
    chainId,
}: {
    context: HandlerContext;
    account: Account_t;
    token: Token_t;
    chainId: ChainId;
}): Promise<TokenBalance_t> => {
    return await context.TokenBalance.getOrCreate({
        id: tokenBalanceId({ chainId, account, token }),

        chainId: chainId,

        account_id: accountId({ accountAddress: account.address as Hex }),
        token_id: tokenId({ chainId, tokenAddress: token.address as Hex }),

        amount: new BigDecimal(0),
    });
};

export const getOrCreateTokenBalanceChangeEntity = async ({
    context,
    token,
    account,
    block,
    balance,
    chainId,
    transaction,
}: {
    context: HandlerContext;
    chainId: ChainId;
    token: Token_t;
    account: Account_t;
    block: Block_t;
    transaction: { hash: string };
    balance: BigDecimal;
}) => {
    return await context.TokenBalanceChange.getOrCreate({
        id: TokenBalanceChangeId({ chainId, account, token, blockNumber: block.number }),

        chainId: chainId,

        tokenBalance_id: tokenBalanceId({ chainId, account, token }),
        account_id: accountId({ accountAddress: account.address as Hex }),
        token_id: tokenId({ chainId, tokenAddress: token.address as Hex }),

        balanceBefore: BIG_ZERO,
        balanceAfter: balance,

        trxHash: transaction.hash,
        blockNumber: BigInt(block.number),
        blockTimestamp: new Date(block.timestamp * 1000),
    });
};
