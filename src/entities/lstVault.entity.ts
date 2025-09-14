import type { HandlerContext } from 'generated';
import type { LstVault_t, Token_t } from 'generated/src/db/Entities.gen';
import type { Hex } from 'viem';
import type { ChainId } from '../lib/chain';

export const LstVaultId = ({ chainId, lstAddress }: { chainId: ChainId; lstAddress: Hex }) =>
    `${chainId}-${lstAddress}`;

export const createLstVault = async ({
    context,
    chainId,
    lstAddress,
    shareToken,
    underlyingToken,
    initializedBlock,
}: {
    context: HandlerContext;
    chainId: ChainId;
    lstAddress: Hex;
    shareToken: Token_t;
    underlyingToken: Token_t;
    initializedBlock: bigint;
}): Promise<LstVault_t> => {
    const id = LstVaultId({ chainId, lstAddress });

    const lst: LstVault_t = {
        id,
        chainId,
        address: lstAddress,
        shareToken_id: shareToken.id,
        underlyingToken_id: underlyingToken.id,
        initializableStatus: 'INITIALIZED',
        initializedBlock,
    };

    context.LstVault.set(lst);
    return lst;
};
