import { experimental_createEffect } from 'envio';
import { chainIdSchema } from '../lib/chain';
import { hexSchema } from '../lib/hex';
import { getViemClient } from '../lib/viem';

export const getClassicVaultTokens = experimental_createEffect(
    {
        name: 'getClassicVaultTokens',
        input: {
            vaultAddress: hexSchema,
            chainId: chainIdSchema,
        },
        output: {
            shareTokenAddress: hexSchema,
            underlyingTokenAddress: hexSchema,
        },
        cache: true,
    },
    async ({ input, context }) => {
        const { vaultAddress, chainId } = input;
        const client = getViemClient(chainId, context.log);

        context.log.debug('Fetching ClassicVault tokens', { vaultAddress, chainId });

        const [underlyingTokenAddress] = await client.multicall({
            allowFailure: false,
            contracts: [
                {
                    address: vaultAddress as `0x${string}`,
                    abi: [
                        {
                            inputs: [],
                            name: 'want',
                            outputs: [{ name: '', type: 'address' }],
                            stateMutability: 'view',
                            type: 'function',
                        },
                    ],
                    functionName: 'want',
                },
            ],
        });

        // The vault contract itself is the share token
        const shareTokenAddress = vaultAddress;

        context.log.info('ClassicVault data fetched', { vaultAddress, shareTokenAddress, underlyingTokenAddress });

        return {
            shareTokenAddress,
            underlyingTokenAddress,
        };
    }
);
