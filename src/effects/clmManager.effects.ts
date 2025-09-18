import { experimental_createEffect } from 'envio';
import { chainIdSchema } from '../lib/chain';
import { hexSchema } from '../lib/hex';
import { getViemClient } from '../lib/viem';

export const getClmManagerTokens = experimental_createEffect(
    {
        name: 'getClmManagerTokens',
        input: {
            managerAddress: hexSchema,
            chainId: chainIdSchema,
        },
        output: {
            shareTokenAddress: hexSchema,
            underlyingToken0Address: hexSchema,
            underlyingToken1Address: hexSchema,
        },
        cache: true,
    },
    async ({ input, context }) => {
        const { managerAddress, chainId } = input;
        const client = getViemClient(chainId, context.log);

        context.log.debug('Fetching ClmManager tokens', { managerAddress, chainId });

        const [wantsResult] = await client.multicall({
            allowFailure: false,
            contracts: [
                {
                    address: managerAddress as `0x${string}`,
                    abi: [
                        {
                            inputs: [],
                            name: 'wants',
                            outputs: [
                                { name: 'token0', type: 'address' },
                                { name: 'token1', type: 'address' },
                            ],
                            stateMutability: 'view',
                            type: 'function',
                        },
                    ],
                    functionName: 'wants',
                },
            ],
        });

        const [underlyingToken0Address, underlyingToken1Address] = wantsResult as [`0x${string}`, `0x${string}`];

        // The manager contract itself is the share token
        const shareTokenAddress = managerAddress;

        context.log.info(
            `ClmManager ${managerAddress}: shareTokenAddress=${shareTokenAddress}, underlyingToken0Address=${underlyingToken0Address}, underlyingToken1Address=${underlyingToken1Address}`
        );

        return {
            shareTokenAddress,
            underlyingToken0Address,
            underlyingToken1Address,
        };
    }
);
