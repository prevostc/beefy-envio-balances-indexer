import { experimental_createEffect } from 'envio';
import { blacklistStatus } from '../lib/blacklist';
import { chainIdSchema } from '../lib/chain';
import { ADDRESS_ZERO } from '../lib/decimal';
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
            strategyAddress: hexSchema,
            blacklistStatus: blacklistStatus,
        },
        cache: true,
    },
    async ({ input, context }) => {
        const { vaultAddress, chainId } = input;
        const client = getViemClient(chainId, context.log);

        context.log.debug('Fetching ClassicVault tokens', { vaultAddress, chainId });

        const [wantResult, strategyResult] = await client.multicall({
            allowFailure: true,
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
                    args: [],
                },
                {
                    address: vaultAddress as `0x${string}`,
                    abi: [
                        {
                            inputs: [],
                            name: 'strategy',
                            outputs: [{ name: '', type: 'address' }],
                            stateMutability: 'view',
                            type: 'function',
                        },
                    ],
                    functionName: 'strategy',
                    args: [],
                },
            ],
        });

        // The vault contract itself is the share token
        const shareTokenAddress = vaultAddress;

        if (wantResult.status === 'failure') {
            context.log.error('ClassicVault want call failed', { vaultAddress, chainId });
            return {
                shareTokenAddress,
                underlyingTokenAddress: ADDRESS_ZERO,
                strategyAddress: ADDRESS_ZERO,
                blacklistStatus: 'blacklisted' as const,
            };
        }

        if (strategyResult.status === 'failure') {
            context.log.error('ClassicVault strategy call failed', { vaultAddress, chainId });
            throw new Error('ClassicVault strategy call failed');
        }

        const underlyingTokenAddress = wantResult.result;
        const strategyAddress = strategyResult.result;

        context.log.info('ClassicVault data fetched', {
            vaultAddress,
            shareTokenAddress,
            underlyingTokenAddress,
            strategyAddress,
        });

        if (underlyingTokenAddress === ADDRESS_ZERO) {
            return {
                shareTokenAddress,
                underlyingTokenAddress,
                strategyAddress,
                blacklistStatus: 'blacklisted' as const,
            };
        }

        return {
            shareTokenAddress,
            underlyingTokenAddress,
            strategyAddress,
            blacklistStatus: 'ok' as const,
        };
    }
);
