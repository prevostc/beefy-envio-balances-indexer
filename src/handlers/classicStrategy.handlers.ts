import { ClassicStrategy } from 'generated';
import type { Hex } from 'viem/_types/types/misc';
import { toChainId } from '../lib/chain';

ClassicStrategy.Initialized.handler(async ({ event, context }) => {
    const chainId = toChainId(event.chainId);
    const strategyAddress = event.srcAddress.toString().toLowerCase() as Hex;
    const initializedBlock = BigInt(event.block.number);

    context.log.info('Initializing ClassicStrategy', { strategyAddress, chainId, initializedBlock });

    context.log.info('ClassicStrategy initialized successfully', { strategyAddress });
});
