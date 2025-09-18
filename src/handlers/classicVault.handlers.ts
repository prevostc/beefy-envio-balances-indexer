import { ClassicVault } from 'generated';
import type { Hex } from 'viem';
import { getClassicVaultTokens } from '../effects/classicVault.effects';
import { createClassicVault } from '../entities/classicVault.entity';
import { getOrCreateToken } from '../entities/token.entity';
import { toChainId } from '../lib/chain';
import { ADDRESS_ZERO } from '../lib/decimal';
import { handleTokenTransfer } from '../lib/token';

ClassicVault.Initialized.handler(async ({ event, context }) => {
    const chainId = toChainId(event.chainId);
    const vaultAddress = event.srcAddress.toString().toLowerCase() as Hex;
    const initializedBlock = BigInt(event.block.number);

    context.log.info(`Initializing ClassicVault at ${vaultAddress} on chain ${chainId}`);

    // Fetch underlying tokens using effect
    const { shareTokenAddress, underlyingTokenAddress } = await context.effect(getClassicVaultTokens, {
        vaultAddress,
        chainId,
    });

    // sometimes the vault is not correctly initialized, and the underlying token is not set
    // ex: https://basescan.org/address/0xF42B6993304425B3D5aDF57b2DCF4A51364B6697
    if (!underlyingTokenAddress || underlyingTokenAddress === ADDRESS_ZERO) {
        context.log.error('[BLACKLIST] ClassicVault', { vaultAddress, shareTokenAddress, underlyingTokenAddress });
        return;
    }

    // Create tokens
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

    // Create vault entity
    await createClassicVault({
        context,
        chainId,
        vaultAddress,
        shareToken,
        underlyingToken,
        initializedBlock,
    });

    context.log.info(`ClassicVault ${vaultAddress} initialized successfully`);
});

ClassicVault.Transfer.handler(async ({ event, context }) => {
    const chainId = toChainId(event.chainId);
    const vaultAddress = event.srcAddress.toString().toLowerCase() as Hex;

    await handleTokenTransfer({
        context,
        chainId,
        tokenAddress: vaultAddress,
        senderAddress: event.params.from.toString().toLowerCase() as Hex,
        receiverAddress: event.params.to.toString().toLowerCase() as Hex,
        rawTransferAmount: event.params.value,
        block: event.block,
        transaction: event.transaction,
    });
});
