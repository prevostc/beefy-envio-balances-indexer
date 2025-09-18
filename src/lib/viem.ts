import type { Logger } from 'envio';
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

export const getViemClient = (chainId: ChainId, logger: Logger) => {
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
            onFetchRequest: async (request) => {
                const requestData = await request.clone().json();
                logger.debug('rpc.http: request', { request: requestData });
            },
            onFetchResponse: async (response) => {
                const responseData = await response.clone().json();
                logger.debug('rpc.http: response', { response: responseData });
            },

            // erpc batches requests for us, no need to do it on the client level
            // batch: {
            //     batchSize: 20 /* requests */,
            //     wait: 200 /* ms */,
            // },
            batch: false,

            // more aggressive retry count
            // but allow more time for backup
            // max time is Array.from({length:5}).map((_,i) => ~~(1 << i) * 500).reduce((a,i) => a+i,0)
            // => 15500ms
            retryCount: 5,
            retryDelay: 500,

            // it's ok to have a longer timeout here because we're using erpc
            // and a lot of the retry logic and fallback and stuff is handled there
            // so we are ok waiting longer but make sure we have an answer
            timeout: 30_000,
        }),
    });
};
