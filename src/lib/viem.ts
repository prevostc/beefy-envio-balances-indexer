import { createPublicClient, http, type Chain as ViemChain } from 'viem';
import { base, bsc, mainnet, polygon } from 'viem/chains';
import type { ChainId } from './chain';
import { config } from './config';

const chainMap: Record<ChainId, ViemChain> = {
    1: mainnet,
    56: bsc,
    137: polygon,
    8453: base,
};

export const getViemClient = (chainId: ChainId) => {
    const rpcUrl = config.RPC_URL[chainId];

    return createPublicClient({
        chain: chainMap[chainId],
        // Enable multicall batching for efficiency
        // batch: {
        //     multicall: {
        //         batchSize: 512, /* bytes */
        //         deployless: false,
        //         wait: 200, /* ms */
        //     }
        // },
        // disable multicall batching to allow downstream erpc to cache calls more granularly
        batch: {
            multicall: false,
        },
        // Thanks to automatic Effect API batching, we can also enable batching for Viem transport level
        transport: http(rpcUrl, {
            batch: {
                batchSize: 50 /* requests */,
                wait: 200 /* ms */,
            },
        }),
    });
};
