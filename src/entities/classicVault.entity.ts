import type { handlerContext as HandlerContext } from 'generated';
import type { ClassicVault_t, ClassicVaultStrategy_t, Token_t } from 'generated/src/db/Entities.gen';
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
    strategyAddress,
    initializedBlock,
}: {
    context: HandlerContext;
    chainId: ChainId;
    vaultAddress: Hex;
    shareToken: Token_t;
    underlyingToken: Token_t;
    strategyAddress: Hex;
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

    await createClassicVaultStrategy({
        context,
        chainId,
        strategyAddress: strategyAddress,
        classicVault: vault,
    });

    return vault;
};

export const classicVaultStrategyId = ({ chainId, strategyAddress }: { chainId: ChainId; strategyAddress: Hex }) =>
    `${chainId}-${strategyAddress.toLowerCase()}`;

export const createClassicVaultStrategy = async ({
    context,
    chainId,
    strategyAddress,
    classicVault,
}: {
    context: HandlerContext;
    chainId: ChainId;
    strategyAddress: Hex;
    classicVault: ClassicVault_t;
}): Promise<ClassicVaultStrategy_t> => {
    const id = classicVaultStrategyId({ chainId, strategyAddress });

    const strategy: ClassicVaultStrategy_t = {
        id,
        chainId,
        address: strategyAddress,
        classicVault_id: classicVault.id,
    };

    context.ClassicVaultStrategy.set(strategy);
    return strategy;
};

export const isClassicVaultStrategy = async (context: HandlerContext, chainId: ChainId, strategyAddress: Hex) => {
    const id = classicVaultStrategyId({ chainId, strategyAddress });
    const strategy = await context.ClassicVaultStrategy.get(id);
    return strategy !== undefined;
};
