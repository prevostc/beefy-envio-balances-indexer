import type { handlerContext as HandlerContext } from 'generated';
import type { ClassicVault_t, Token_t } from 'generated/src/db/Entities.gen';
import type { Hex } from 'viem';
import type { ChainId } from '../lib/chain';

export const classicVaultId = ({ chainId, vaultAddress }: { chainId: ChainId; vaultAddress: Hex }) =>
    `${chainId}-${vaultAddress.toLowerCase()}`;

export const createClassicVault = async ({
    context,
    chainId,
    vaultAddress,
    shareToken,
    underlyingToken,
    initializedBlock,
}: {
    context: HandlerContext;
    chainId: ChainId;
    vaultAddress: Hex;
    shareToken: Token_t;
    underlyingToken: Token_t;
    initializedBlock: bigint;
}): Promise<ClassicVault_t> => {
    const id = classicVaultId({ chainId, vaultAddress });

    const vault: ClassicVault_t = {
        id,
        chainId,
        address: vaultAddress,
        shareToken_id: shareToken.id,
        underlyingToken_id: underlyingToken.id,
        initializableStatus: 'INITIALIZED',
        initializedBlock,
    };

    context.ClassicVault.set(vault);
    return vault;
};
