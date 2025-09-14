import { RewardPool } from 'generated';
import type { Hex } from 'viem';
import { getRewardPoolTokens } from '../effects/rewardPool.effects';
import { createRewardPool } from '../entities/rewardPool.entity';
import { getOrCreateToken } from '../entities/token.entity';
import { toChainId } from '../lib/chain';
import { handleTokenTransfer } from '../lib/token';

RewardPool.Initialized.handler(async ({ event, context }) => {
    const chainId = toChainId(event.chainId);
    const rewardPoolAddress = event.srcAddress.toString().toLowerCase() as Hex;
    const initializedBlock = BigInt(event.block.number);

    context.log.info(`Initializing ClassicRewardPool at ${rewardPoolAddress} on chain ${chainId}`);

    // Fetch underlying tokens using effect
    const { shareTokenAddress, underlyingTokenAddress } = await context.effect(getRewardPoolTokens, {
        rewardPoolAddress,
        chainId,
    });

    // Create tokens - share token is virtual for reward pool
    const [shareToken, underlyingToken] = await Promise.all([
        getOrCreateToken({
            context,
            chainId,
            tokenAddress: shareTokenAddress,
            virtual: false,
        }),
        getOrCreateToken({
            context,
            chainId,
            tokenAddress: underlyingTokenAddress,
            virtual: false,
        }),
    ]);

    // Create reward pool entity
    await createRewardPool({
        context,
        chainId,
        rewardPoolAddress,
        shareToken,
        underlyingToken,
        initializedBlock,
    });

    context.log.info(`ClassicRewardPool ${rewardPoolAddress} initialized successfully`);
});

RewardPool.Transfer.handler(async ({ event, context }) => {
    const chainId = toChainId(event.chainId);
    const rewardPoolAddress = event.srcAddress.toString().toLowerCase() as Hex;

    await handleTokenTransfer({
        context,
        chainId,
        tokenAddress: rewardPoolAddress,
        senderAddress: event.params.from.toString().toLowerCase() as Hex,
        receiverAddress: event.params.to.toString().toLowerCase() as Hex,
        rawTransferAmount: event.params.value,
        block: event.block,
        transaction: event.transaction,
    });
});
