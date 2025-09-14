import { experimental_createEffect } from 'envio';
import { chainIdSchema } from '../lib/chain';
import { hexSchema } from '../lib/hex';
import { getViemClient } from '../lib/viem';

export const getRewardPoolTokens = experimental_createEffect(
    {
        name: 'getRewardPoolTokens',
        input: {
            rewardPoolAddress: hexSchema,
            chainId: chainIdSchema,
        },
        output: {
            shareTokenAddress: hexSchema,
            underlyingTokenAddress: hexSchema,
        },
        cache: true,
    },
    async ({ input, context }) => {
        const { rewardPoolAddress, chainId } = input;
        const client = getViemClient(chainId);

        context.log.debug('Fetching RewardPool tokens', { rewardPoolAddress, chainId });

        const [underlyingTokenAddress] = await client.multicall({
            allowFailure: false,
            contracts: [
                {
                    address: rewardPoolAddress as `0x${string}`,
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

        // The reward pool contract itself is the share token (virtual token)
        const shareTokenAddress = rewardPoolAddress;

        context.log.info(
            `RewardPool ${rewardPoolAddress}: shareTokenAddress=${shareTokenAddress}, underlyingTokenAddress=${underlyingTokenAddress}`
        );

        return {
            shareTokenAddress,
            underlyingTokenAddress,
        };
    }
);
