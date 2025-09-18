import { LstVault } from 'generated';
import type { Hex } from 'viem';
import { getLstVaultTokens } from '../effects/lstVault.effects';
import { createLstVault } from '../entities/lstVault.entity';
import { getOrCreateToken } from '../entities/token.entity';
import { toChainId } from '../lib/chain';
import { ADDRESS_ZERO } from '../lib/decimal';
import { handleTokenTransfer } from '../lib/token';

LstVault.Initialized.handler(async ({ event, context }) => {
    const chainId = toChainId(event.chainId);
    const lstAddress = event.srcAddress.toString().toLowerCase() as Hex;
    const initializedBlock = BigInt(event.block.number);

    context.log.info(`Initializing LstVault at ${lstAddress} on chain ${chainId}`);

    // Fetch underlying tokens using effect
    const { shareTokenAddress, underlyingTokenAddress } = await context.effect(getLstVaultTokens, {
        lstAddress,
        chainId,
    });

    // sometimes the vault is not correctly initialized, and the underlying token is not set
    if (!underlyingTokenAddress || underlyingTokenAddress === ADDRESS_ZERO) {
        context.log.error('[BLACKLIST] LstVault', { lstAddress, shareTokenAddress, underlyingTokenAddress });
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

    // Create LST vault entity
    await createLstVault({
        context,
        chainId,
        lstAddress,
        shareToken,
        underlyingToken,
        initializedBlock,
    });

    context.log.info(`LstVault ${lstAddress} initialized successfully`);
});

LstVault.Transfer.handler(async ({ event, context }) => {
    const chainId = toChainId(event.chainId);
    const lstAddress = event.srcAddress.toString().toLowerCase() as Hex;

    await handleTokenTransfer({
        context,
        chainId,
        tokenAddress: lstAddress,
        senderAddress: event.params.from.toString().toLowerCase() as Hex,
        receiverAddress: event.params.to.toString().toLowerCase() as Hex,
        rawTransferAmount: event.params.value,
        block: event.block,
        transaction: event.transaction,
    });
});
