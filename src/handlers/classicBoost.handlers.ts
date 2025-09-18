import { ClassicBoost } from 'generated';
import type { Hex } from 'viem';
import { getClassicBoostTokens } from '../effects/classicBoost.effects';
import { createClassicBoost } from '../entities/classicBoost.entity';
import { getOrCreateToken } from '../entities/token.entity';
import { toChainId } from '../lib/chain';
import { config } from '../lib/config';
import { ADDRESS_ZERO } from '../lib/decimal';
import { handleTokenTransfer } from '../lib/token';

ClassicBoost.Initialized.handler(async ({ event, context }) => {
    const chainId = toChainId(event.chainId);
    const boostAddress = event.srcAddress.toString().toLowerCase() as Hex;
    const initializedBlock = BigInt(event.block.number);

    context.log.info(`Initializing ClassicBoost at ${boostAddress} on chain ${chainId}`);

    // Fetch underlying tokens using effect
    const { shareTokenAddress, underlyingTokenAddress } = await context.effect(getClassicBoostTokens, {
        boostAddress,
        chainId,
    });

    // sometimes the vault is not correctly initialized, and the underlying token is not set
    // in this case we want to ignore the vault and not create it
    // but we also need to log it as an error so we can add it to the blacklist and not try to index it again
    // on the next run
    if (!underlyingTokenAddress || underlyingTokenAddress === ADDRESS_ZERO) {
        context.log.error('[BLACKLIST] ClassicBoost', { boostAddress, shareTokenAddress, underlyingTokenAddress });
        return;
    }

    // Create tokens - share token is virtual for boost
    const [shareToken, underlyingToken] = await Promise.all([
        getOrCreateToken({
            context,
            chainId,
            tokenAddress: shareTokenAddress,
            virtual: {
                suffix: 'Boost',
                stakingToken: underlyingTokenAddress,
            },
        }),
        getOrCreateToken({
            context,
            chainId,
            tokenAddress: underlyingTokenAddress,
            virtual: false,
        }),
    ]);

    // Create boost entity
    await createClassicBoost({
        context,
        chainId,
        boostAddress,
        shareToken,
        underlyingToken,
        initializedBlock,
    });

    context.log.info(`ClassicBoost ${boostAddress} initialized successfully`);
});

ClassicBoost.Staked.handler(async ({ event, context }) => {
    const chainId = toChainId(event.chainId);
    const boostAddress = event.srcAddress.toString().toLowerCase() as Hex;

    await handleTokenTransfer({
        context,
        chainId,
        tokenAddress: boostAddress,
        senderAddress: config.MINT_ADDRESS,
        receiverAddress: event.params.user.toString().toLowerCase() as Hex,
        rawTransferAmount: event.params.amount,
        block: event.block,
        transaction: event.transaction,
    });
});

ClassicBoost.Withdrawn.handler(async ({ event, context }) => {
    const chainId = toChainId(event.chainId);
    const boostAddress = event.srcAddress.toString().toLowerCase() as Hex;

    await handleTokenTransfer({
        context,
        chainId,
        tokenAddress: boostAddress,
        senderAddress: event.params.user.toString().toLowerCase() as Hex,
        receiverAddress: config.BURN_ADDRESS,
        rawTransferAmount: event.params.amount,
        block: event.block,
        transaction: event.transaction,
    });
});
