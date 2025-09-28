import { ClmStrategy } from 'generated';
import type { Hex } from 'viem';
import { toChainId } from '../lib/chain';

ClmStrategy.Initialized.handler(async ({ event, context }) => {
    const chainId = toChainId(event.chainId);
    const strategyAddress = event.srcAddress.toString().toLowerCase() as Hex;

    context.log.info(`Initializing ClmStrategy at ${strategyAddress} on chain ${chainId}`);

    context.log.info(`ClmStrategy ${strategyAddress} initialized successfully`);
});
