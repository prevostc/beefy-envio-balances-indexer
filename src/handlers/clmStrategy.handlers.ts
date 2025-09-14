import { ClmStrategy } from 'generated';
import type { Hex } from 'viem';
import { getOrCreateToken } from '../entities/token.entity';
import { toChainId } from '../lib/chain';
import { handleTokenTransfer } from '../lib/token';

ClmStrategy.Initialized.handler(async ({ event, context }) => {
    const chainId = toChainId(event.chainId);
    const strategyAddress = event.srcAddress.toString().toLowerCase() as Hex;

    context.log.info(`Initializing ClmStrategy at ${strategyAddress} on chain ${chainId}`);

    // Create the strategy token - the strategy contract itself is the token
    await getOrCreateToken({
        context,
        chainId,
        tokenAddress: strategyAddress,
        virtual: false,
    });

    context.log.info(`ClmStrategy ${strategyAddress} initialized successfully`);
});

ClmStrategy.Transfer.handler(async ({ event, context }) => {
    const chainId = toChainId(event.chainId);
    const strategyAddress = event.srcAddress.toString().toLowerCase() as Hex;

    await handleTokenTransfer({
        context,
        chainId,
        tokenAddress: strategyAddress,
        senderAddress: event.params.from.toString().toLowerCase() as Hex,
        receiverAddress: event.params.to.toString().toLowerCase() as Hex,
        rawTransferAmount: event.params.value,
        block: event.block,
    });
});
