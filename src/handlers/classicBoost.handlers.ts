import { ClassicBoost } from 'generated';
import type { ClassicBoost_t } from 'generated/src/db/Entities.gen';
import type { HandlerContext } from 'generated/src/Types';
import type { Hex } from 'viem';
import { getClassicBoostTokens } from '../effects/classicBoost.effects';
import { createClassicBoost } from '../entities/classicBoost.entity';
import { getOrCreateToken } from '../entities/token.entity';
import { logBlacklistStatus } from '../lib/blacklist';
import { type ChainId, toChainId } from '../lib/chain';
import { config } from '../lib/config';
import { handleTokenTransfer } from '../lib/token';

ClassicBoost.Initialized.handler(async ({ event, context }) => {
    const chainId = toChainId(event.chainId);
    const boostAddress = event.srcAddress.toString().toLowerCase() as Hex;
    const initializedBlock = BigInt(event.block.number);

    const boost = await initializeBoost(context, chainId, boostAddress, initializedBlock);
    if (!boost) return;

    context.log.info(`ClassicBoost ${boostAddress} initialized successfully`);
});

ClassicBoost.Staked.handler(async ({ event, context }) => {
    const chainId = toChainId(event.chainId);
    const boostAddress = event.srcAddress.toString().toLowerCase() as Hex;
    const initializedBlock = BigInt(event.block.number);

    // Ensure that the boost virtual token is created first
    // otherwise, handleTokenTransfer will try and create it and fail because
    // it's not aware it is being virtual
    const boost = await initializeBoost(context, chainId, boostAddress, initializedBlock);
    if (!boost) return;

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

    const boost = await initializeBoost(context, chainId, boostAddress, BigInt(event.block.number));
    if (!boost) return;

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

const initializeBoost = async (
    context: HandlerContext,
    chainId: ChainId,
    boostAddress: Hex,
    initializedBlock: bigint
): Promise<ClassicBoost_t | null> => {
    context.log.info(`Initializing ClassicBoost at ${boostAddress} on chain ${chainId}`);

    // Fetch underlying tokens using effect
    const { shareTokenAddress, underlyingTokenAddress, blacklistStatus } = await context.effect(getClassicBoostTokens, {
        boostAddress,
        chainId,
    });

    if (blacklistStatus !== 'ok') {
        logBlacklistStatus(context.log, blacklistStatus, 'ClassicBoost', {
            contractAddress: boostAddress,
            shareTokenAddress,
            underlyingTokenAddress,
        });
        return null;
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
    return await createClassicBoost({
        context,
        chainId,
        boostAddress,
        shareToken,
        underlyingToken,
        initializedBlock,
    });
};
