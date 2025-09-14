import { Erc4626Adapter } from 'generated';
import type { Hex } from 'viem';
import { getErc4626AdapterTokens } from '../effects/erc4626Adapter.effects';
import { createErc4626Adapter } from '../entities/classicErc4626Adapter.entity';
import { getOrCreateToken } from '../entities/token.entity';
import { toChainId } from '../lib/chain';
import { handleTokenTransfer } from '../lib/token';

Erc4626Adapter.Initialized.handler(async ({ event, context }) => {
    const chainId = toChainId(event.chainId);
    const adapterAddress = event.srcAddress.toString().toLowerCase() as Hex;
    const initializedBlock = BigInt(event.block.number);

    context.log.info(`Initializing Erc4626Adapter at ${adapterAddress} on chain ${chainId}`);

    // Fetch underlying tokens using effect
    const { shareTokenAddress, underlyingTokenAddress } = await context.effect(getErc4626AdapterTokens, {
        adapterAddress,
        chainId,
    });

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

    // Create ERC4626 adapter entity
    await createErc4626Adapter({
        context,
        chainId,
        adapterAddress,
        shareToken,
        underlyingToken,
        initializedBlock,
    });

    context.log.info(`Erc4626Adapter ${adapterAddress} initialized successfully`);
});

Erc4626Adapter.Transfer.handler(async ({ event, context }) => {
    const chainId = toChainId(event.chainId);
    const adapterAddress = event.srcAddress.toString().toLowerCase() as Hex;

    await handleTokenTransfer({
        context,
        chainId,
        tokenAddress: adapterAddress,
        senderAddress: event.params.from.toString().toLowerCase() as Hex,
        receiverAddress: event.params.to.toString().toLowerCase() as Hex,
        rawTransferAmount: event.params.value,
        block: event.block,
    });
});
