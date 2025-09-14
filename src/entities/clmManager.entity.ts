import type { HandlerContext } from 'generated';
import type { ClmManager_t, Token_t } from 'generated/src/db/Entities.gen';
import type { Hex } from 'viem';
import type { ChainId } from '../lib/chain';

export const clmManagerId = ({ chainId, managerAddress }: { chainId: ChainId; managerAddress: Hex }) =>
    `${chainId}-${managerAddress}`;

export const createClmManager = async ({
    context,
    chainId,
    managerAddress,
    shareToken,
    underlyingToken0,
    underlyingToken1,
    initializedBlock,
}: {
    context: HandlerContext;
    chainId: ChainId;
    managerAddress: Hex;
    shareToken: Token_t;
    underlyingToken0: Token_t;
    underlyingToken1: Token_t;
    initializedBlock: bigint;
}): Promise<ClmManager_t> => {
    const id = clmManagerId({ chainId, managerAddress });

    const manager: ClmManager_t = {
        id,
        chainId,
        address: managerAddress,
        shareToken_id: shareToken.id,
        underlyingToken0_id: underlyingToken0.id,
        underlyingToken1_id: underlyingToken1.id,
        initializableStatus: 'INITIALIZED',
        initializedBlock,
    };

    context.ClmManager.set(manager);
    return manager;
};
