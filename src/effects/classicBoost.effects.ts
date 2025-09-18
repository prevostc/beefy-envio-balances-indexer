import { experimental_createEffect } from 'envio';
import { chainIdSchema } from '../lib/chain';
import { hexSchema } from '../lib/hex';
import { getViemClient } from '../lib/viem';

export const getClassicBoostTokens = experimental_createEffect(
    {
        name: 'getClassicBoostTokens',
        input: {
            boostAddress: hexSchema,
            chainId: chainIdSchema,
        },
        output: {
            shareTokenAddress: hexSchema,
            underlyingTokenAddress: hexSchema,
        },
        cache: true,
    },
    async ({ input, context }) => {
        const { boostAddress, chainId } = input;
        const client = getViemClient(chainId, context.log);

        context.log.debug('Fetching ClassicBoost tokens', { boostAddress, chainId });

        const [underlyingTokenAddress] = await client.multicall({
            allowFailure: false,
            contracts: [
                {
                    address: boostAddress as `0x${string}`,
                    abi: [
                        {
                            inputs: [],
                            name: 'stakedToken',
                            outputs: [{ name: '', type: 'address' }],
                            stateMutability: 'view',
                            type: 'function',
                        },
                    ],
                    functionName: 'stakedToken',
                },
            ],
        });

        // The boost contract itself is the share token (virtual token)
        const shareTokenAddress = boostAddress;

        context.log.info(
            `ClassicBoost ${boostAddress}: shareTokenAddress=${shareTokenAddress}, underlyingTokenAddress=${underlyingTokenAddress}`
        );

        return {
            shareTokenAddress,
            underlyingTokenAddress,
        };
    }
);
