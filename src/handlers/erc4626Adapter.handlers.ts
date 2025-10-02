import { Erc4626Adapter } from 'generated';
import type { Erc4626Adapter_t } from 'generated/src/db/Entities.gen';
import type { HandlerContext } from 'generated/src/Types';
import type { Hex } from 'viem';
import { getErc4626AdapterTokens } from '../effects/erc4626Adapter.effects';
import { createErc4626Adapter } from '../entities/classicErc4626Adapter.entity';
import { getOrCreateToken } from '../entities/token.entity';
import { logBlacklistStatus } from '../lib/blacklist';
import { type ChainId, toChainId } from '../lib/chain';
import { handleTokenTransfer } from '../lib/token';

Erc4626Adapter.Initialized.handler(async ({ event, context }) => {
    const chainId = toChainId(event.chainId);
    const adapterAddress = event.srcAddress.toString().toLowerCase() as Hex;
    const initializedBlock = BigInt(event.block.number);

    const adapter = await initializeErc4626Adapter({ context, chainId, adapterAddress, initializedBlock });
    if (!adapter) return;

    context.log.info(`Erc4626Adapter ${adapterAddress} initialized successfully`);
});

Erc4626Adapter.Transfer.handler(async ({ event, context }) => {
    const chainId = toChainId(event.chainId);
    const adapterAddress = event.srcAddress.toString().toLowerCase() as Hex;

    // Ensure that the adapter is initialized first
    const adapter = await initializeErc4626Adapter({
        context,
        chainId,
        adapterAddress,
        initializedBlock: BigInt(event.block.number),
    });
    if (!adapter) return;

    await handleTokenTransfer({
        context,
        chainId,
        tokenAddress: adapterAddress,
        senderAddress: event.params.from.toString().toLowerCase() as Hex,
        receiverAddress: event.params.to.toString().toLowerCase() as Hex,
        rawTransferAmount: event.params.value,
        block: event.block,
        transaction: event.transaction,
    });
});

const initializeErc4626Adapter = async ({
    context,
    chainId,
    adapterAddress,
    initializedBlock,
}: {
    context: HandlerContext;
    chainId: ChainId;
    adapterAddress: Hex;
    initializedBlock: bigint;
}): Promise<Erc4626Adapter_t | null> => {
    context.log.info(`Initializing Erc4626Adapter at ${adapterAddress} on chain ${chainId}`);

    // Fetch underlying tokens using effect
    const { shareTokenAddress, underlyingTokenAddress, blacklistStatus } = await context.effect(
        getErc4626AdapterTokens,
        {
            adapterAddress,
            chainId,
        }
    );

    if (blacklistStatus !== 'ok') {
        logBlacklistStatus(context.log, blacklistStatus, 'Erc4626Adapter', {
            contractAddress: adapterAddress,
            shareTokenAddress,
            underlyingTokenAddress,
        });
        return null;
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

    // Create ERC4626 adapter entity
    return await createErc4626Adapter({
        context,
        chainId,
        adapterAddress,
        shareToken,
        underlyingToken,
        initializedBlock,
    });
};
