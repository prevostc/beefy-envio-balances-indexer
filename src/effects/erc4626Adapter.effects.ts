import { experimental_createEffect } from 'envio';
import { chainIdSchema } from '../lib/chain';
import { hexSchema } from '../lib/hex';
import { getViemClient } from '../lib/viem';

export const getErc4626AdapterTokens = experimental_createEffect(
    {
        name: 'getErc4626AdapterTokens',
        input: {
            adapterAddress: hexSchema,
            chainId: chainIdSchema,
        },
        output: {
            shareTokenAddress: hexSchema,
            underlyingTokenAddress: hexSchema,
        },
        cache: true,
    },
    async ({ input, context }) => {
        const { adapterAddress, chainId } = input;
        const client = getViemClient(chainId);

        context.log.debug('Fetching Erc4626Adapter tokens', { adapterAddress, chainId });

        const [underlyingTokenAddress] = await client.multicall({
            allowFailure: false,
            contracts: [
                {
                    address: adapterAddress as `0x${string}`,
                    abi: [
                        {
                            inputs: [],
                            name: 'asset',
                            outputs: [{ name: '', type: 'address' }],
                            stateMutability: 'view',
                            type: 'function',
                        },
                    ],
                    functionName: 'asset',
                },
            ],
        });

        // The adapter contract itself is the share token
        const shareTokenAddress = adapterAddress;

        context.log.info(
            `Erc4626Adapter ${adapterAddress}: shareTokenAddress=${shareTokenAddress}, underlyingTokenAddress=${underlyingTokenAddress}`
        );

        return {
            shareTokenAddress,
            underlyingTokenAddress,
        };
    }
);
