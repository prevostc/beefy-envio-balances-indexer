import type { BigDecimal, Block_t, handlerContext as HandlerContext } from 'generated';
import type { Account_t, Token_t, TokenBalance_t } from 'generated/src/db/Entities.gen';
import type { Hex } from 'viem';
import { getOrCreateAccount } from '../entities/account.entity';
import { getOrCreateTokenBalanceChangeEntity, getOrCreateTokenBalanceEntity } from '../entities/balance.entity';
import type { ChainId } from './chain';
import { config } from './config';
import { BIG_ZERO, interpretAsDecimal } from './decimal';

export const handleTokenTransfer = async ({
    context,
    chainId,
    token,
    senderAddress,
    receiverAddress,
    rawTransferAmount,
    block,
    transaction,
}: {
    context: HandlerContext;
    chainId: ChainId;
    token: Token_t;
    senderAddress: Hex;
    receiverAddress: Hex;
    rawTransferAmount: bigint;
    block: Block_t;
    transaction: { hash: string };
}) => {
    if (rawTransferAmount === 0n) {
        context.log.debug('Ignoring transfer with zero value', { trx: transaction.hash });
        return;
    }

    const [senderAccount, receiverAccount] = await Promise.all([
        getOrCreateAccount({
            context,
            chainId,
            accountAddress: senderAddress,
        }),
        getOrCreateAccount({
            context,
            chainId,
            accountAddress: receiverAddress,
        }),
    ]);

    const [senderBalance, receiverBalance] = await Promise.all([
        senderAccount
            ? getOrCreateTokenBalanceEntity({
                  context,
                  token,
                  account: senderAccount,
                  chainId,
              })
            : null,
        receiverAccount
            ? getOrCreateTokenBalanceEntity({
                  context,
                  token,
                  account: receiverAccount,
                  chainId,
              })
            : null,
    ]);

    const value = interpretAsDecimal(rawTransferAmount, token.decimals);

    let holderCountChange = 0;
    let totalSupplyChange = BIG_ZERO;

    if (senderAccount && senderBalance) {
        const diff = await updateAccountBalance({
            context,
            chainId,
            amountDiff: value.negated(),
            account: senderAccount,
            balance: senderBalance,
            block,
            token,
            transaction,
        });
        holderCountChange += diff.holderCountChange;
    }

    if (receiverAccount && receiverBalance) {
        const diff = await updateAccountBalance({
            context,
            chainId,
            amountDiff: value,
            account: receiverAccount,
            balance: receiverBalance,
            block,
            token,
            transaction,
        });
        holderCountChange += diff.holderCountChange;
    }

    if (senderAddress === config.MINT_ADDRESS || senderAddress === config.BURN_ADDRESS) {
        totalSupplyChange = totalSupplyChange.plus(value);
    }
    if (receiverAddress === config.BURN_ADDRESS || receiverAddress === config.MINT_ADDRESS) {
        totalSupplyChange = totalSupplyChange.minus(value);
    }

    context.Token.set({
        ...token,
        holderCount: token.holderCount + holderCountChange,
        totalSupply: token.totalSupply.plus(totalSupplyChange),
    });
};

const updateAccountBalance = async ({
    context,
    amountDiff,
    account,
    balance,
    token,
    block,
    chainId,
    transaction,
}: {
    context: HandlerContext;
    amountDiff: BigDecimal;
    account: Account_t;
    balance: TokenBalance_t;
    token: Token_t;
    block: Block_t;
    chainId: ChainId;
    transaction: { hash: string };
}) => {
    const before = balance.amount;
    const after = balance.amount.plus(amountDiff);

    context.TokenBalance.set({
        ...balance,
        amount: after,
    });

    const balanceChange = await getOrCreateTokenBalanceChangeEntity({
        context,
        token,
        account,
        block,
        balance: after,
        chainId,
        transaction,
    });
    context.TokenBalanceChange.set({
        ...balanceChange,
        balanceBefore: before,
        balanceAfter: after,
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
    };
};
