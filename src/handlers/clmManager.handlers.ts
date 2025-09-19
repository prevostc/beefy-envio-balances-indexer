import { ClmManager } from 'generated';
import type { Hex } from 'viem';
import { getClmManagerTokens } from '../effects/clmManager.effects';
import { createClmManager } from '../entities/clmManager.entity';
import { getOrCreateToken } from '../entities/token.entity';
import { logBlacklistStatus } from '../lib/blacklist';
import { toChainId } from '../lib/chain';
import { handleTokenTransfer } from '../lib/token';

ClmManager.Initialized.handler(async ({ event, context }) => {
    const chainId = toChainId(event.chainId);
    const managerAddress = event.srcAddress.toString().toLowerCase() as Hex;
    const initializedBlock = BigInt(event.block.number);

    context.log.info(`Initializing ClmManager at ${managerAddress} on chain ${chainId}`);

    // Fetch underlying tokens using effect
    const { shareTokenAddress, underlyingToken0Address, underlyingToken1Address, blacklistStatus } =
        await context.effect(getClmManagerTokens, {
            managerAddress,
            chainId,
        });

    if (blacklistStatus !== 'ok') {
        logBlacklistStatus(context.log, blacklistStatus, 'ClmManager', {
            contractAddress: managerAddress,
            shareTokenAddress,
            underlyingToken0Address,
            underlyingToken1Address,
        });
        return;
    }

    // Create tokens - share token is virtual for CLM manager
    const [shareToken, underlyingToken0, underlyingToken1] = await Promise.all([
        getOrCreateToken({
            context,
            chainId,
            tokenAddress: shareTokenAddress,
            virtual: false,
        }),
        getOrCreateToken({
            context,
            chainId,
            tokenAddress: underlyingToken0Address,
            virtual: false,
        }),
        getOrCreateToken({
            context,
            chainId,
            tokenAddress: underlyingToken1Address,
            virtual: false,
        }),
    ]);

    // Create CLM manager entity
    await createClmManager({
        context,
        chainId,
        managerAddress,
        shareToken,
        underlyingToken0,
        underlyingToken1,
        initializedBlock,
    });

    context.log.info(`ClmManager ${managerAddress} initialized successfully`);
});

ClmManager.Transfer.handler(async ({ event, context }) => {
    const chainId = toChainId(event.chainId);
    const managerAddress = event.srcAddress.toString().toLowerCase() as Hex;

    await handleTokenTransfer({
        context,
        chainId,
        tokenAddress: managerAddress,
        senderAddress: event.params.from.toString().toLowerCase() as Hex,
        receiverAddress: event.params.to.toString().toLowerCase() as Hex,
        rawTransferAmount: event.params.value,
        block: event.block,
        transaction: event.transaction,
    });
});
