import type { ChainId } from 'blockchain-addressbook';
import type { PoolRewardedEvent_t, Token_t } from 'generated/src/db/Entities.gen';
import type { HandlerContext } from 'generated/src/Types';
import type { Hex } from 'viem';
import { interpretAsDecimal } from '../lib/decimal';

const poolRewardedEventId = ({ chainId, trxHash, logIndex }: { chainId: ChainId; trxHash: Hex; logIndex: number }) =>
    `${chainId}-${trxHash.toLowerCase()}-${logIndex.toString()}`;

export const createPoolRewardedEvent = async ({
    context,
    chainId,
    trxHash,
    logIndex,
    poolShareToken,
    rewardToken,
    rewardVestingSeconds,
    rawRewardAmount,
}: {
    context: HandlerContext;
    chainId: ChainId;
    trxHash: Hex;
    logIndex: number;
    poolShareToken: Token_t;
    rewardToken: Token_t;
    rewardVestingSeconds: number;
    rawRewardAmount: bigint;
}) => {
    const id = poolRewardedEventId({ chainId, trxHash, logIndex });

    const poolRewardedEvent: PoolRewardedEvent_t = {
        id,
        chainId,
        trxHash,
        logIndex,
        poolShareToken_id: poolShareToken.id,
        rewardToken_id: rewardToken.id,
        rewardAmount: interpretAsDecimal(rawRewardAmount, rewardToken.decimals),
        rewardVestingSeconds,
    };

    context.log.debug('Creating PoolRewardedEvent', poolRewardedEvent);

    const evt = await context.PoolRewardedEvent.get(id);
    if (evt) {
        throw new Error(`PoolRewardedEvent ${id} already exists`);
    }

    context.PoolRewardedEvent.set(poolRewardedEvent);
    return poolRewardedEvent;
};
