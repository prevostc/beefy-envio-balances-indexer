import { experimental_createEffect } from 'envio';
import { chainIdSchema } from '../lib/chain';
import { hexSchema } from '../lib/hex';
import { getViemClient } from '../lib/viem';

export const getLstVaultTokens = experimental_createEffect(
    {
        name: 'getLstVaultTokens',
        input: {
            lstAddress: hexSchema,
            chainId: chainIdSchema,
        },
        output: {
            shareTokenAddress: hexSchema,
            underlyingTokenAddress: hexSchema,
        },
        cache: true,
    },
    async ({ input, context }) => {
        const { lstAddress, chainId } = input;
        const client = getViemClient(chainId);

        context.log.debug('Fetching LstVault tokens', { lstAddress, chainId });

        const [underlyingTokenAddress] = await client.multicall({
            allowFailure: false,
            contracts: [
                {
                    address: lstAddress as `0x${string}`,
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

        // The LST contract itself is the share token
        const shareTokenAddress = lstAddress;

        context.log.info(
            `LstVault ${lstAddress}: shareTokenAddress=${shareTokenAddress}, underlyingTokenAddress=${underlyingTokenAddress}`
        );

        return {
            shareTokenAddress,
            underlyingTokenAddress,
        };
    }
);
