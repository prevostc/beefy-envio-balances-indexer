import { RewardPool } from 'generated';
import type { RewardPool_t } from 'generated/src/db/Entities.gen';
import type { HandlerContext } from 'generated/src/Types';
import type { Hex } from 'viem';
import { getRewardPoolTokens } from '../effects/rewardPool.effects';
import { createRewardPool } from '../entities/rewardPool.entity';
import { getOrCreateToken } from '../entities/token.entity';
import { logBlacklistStatus } from '../lib/blacklist';
import { type ChainId, toChainId } from '../lib/chain';
import { handleTokenTransfer } from '../lib/token';

RewardPool.Initialized.handler(async ({ event, context }) => {
    const chainId = toChainId(event.chainId);
    const rewardPoolAddress = event.srcAddress.toString().toLowerCase() as Hex;
    const initializedBlock = BigInt(event.block.number);

    const rewardPool = await initializeRewardPool({ context, chainId, rewardPoolAddress, initializedBlock });
    if (!rewardPool) return;

    context.log.info(`ClassicRewardPool ${rewardPoolAddress} initialized successfully`);
});

RewardPool.Transfer.handler(async ({ event, context }) => {
    const chainId = toChainId(event.chainId);
    const rewardPoolAddress = event.srcAddress.toString().toLowerCase() as Hex;

    // Ensure that the reward pool is initialized first
    const rewardPool = await initializeRewardPool({
        context,
        chainId,
        rewardPoolAddress,
        initializedBlock: BigInt(event.block.number),
    });
    if (!rewardPool) return;

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

const initializeRewardPool = async ({
    context,
    chainId,
    rewardPoolAddress,
    initializedBlock,
}: {
    context: HandlerContext;
    chainId: ChainId;
    rewardPoolAddress: Hex;
    initializedBlock: bigint;
}): Promise<RewardPool_t | null> => {
    context.log.info(`Initializing ClassicRewardPool at ${rewardPoolAddress} on chain ${chainId}`);

    // Fetch underlying tokens using effect
    const { shareTokenAddress, underlyingTokenAddress, blacklistStatus } = await context.effect(getRewardPoolTokens, {
        rewardPoolAddress,
        chainId,
    });

    if (blacklistStatus !== 'ok') {
        logBlacklistStatus(context.log, blacklistStatus, 'RewardPool', {
            contractAddress: rewardPoolAddress,
            shareTokenAddress,
            underlyingTokenAddress,
        });
        return null;
    }

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
    return await createRewardPool({
        context,
        chainId,
        rewardPoolAddress,
        shareToken,
        underlyingToken,
        initializedBlock,
    });
};
