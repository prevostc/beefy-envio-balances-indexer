import type { HandlerContext } from 'generated';
import type { ChainId } from '../lib/chain';
import { getViemClient } from '../lib/viem';

export const getDetectClassicVaultOrStrategy = async ({
    contractAddress,
    chainId,
    blockNumber,
    log,
}: {
    contractAddress: `0x${string}`;
    chainId: ChainId;
    blockNumber?: number;
    log: HandlerContext['log'];
}): Promise<{
    isVault: boolean;
    isStrategy: boolean;
}> => {
    const client = getViemClient(chainId);

    // Try standard Erc20 interface first (most common)
    const [vault, strategy] = await client.multicall({
        allowFailure: true,
        contracts: [
            {
                address: contractAddress as `0x${string}`,
                abi: [
                    {
                        name: 'vault',
                        type: 'function',
                        inputs: [],
                        outputs: [],
                    },
                ],
                functionName: 'vault',
            },
            {
                address: contractAddress as `0x${string}`,
                abi: [
                    {
                        name: 'strategy',
                        type: 'function',
                        inputs: [],
                        outputs: [],
                    },
                ],
                functionName: 'strategy',
            },
        ],
        blockNumber: blockNumber ? BigInt(blockNumber) : undefined,
    });

    log.debug('vault or strategy detection', {
        contractAddress,
        vault: vault.status,
        strategy: strategy.status,
        blockNumber,
    });

    if (vault.status === 'failure' && strategy.status === 'failure') {
        log.error('.vault() and .strategy() calls both failed on contract', {
            chainId,
            contractAddress,
            vault: vault.error,
            strategy: strategy.error,
            blockNumber,
        });
        throw new Error(`.vault() and .strategy() calls both FAILED for contract ${chainId}:${contractAddress}`);
    }

    if (vault.status === 'success' && strategy.status === 'success') {
        // try the latest block number instead of the block number passed in
        // this will bust any rpc cache so it's not done by default
        if (blockNumber) {
            log.debug('vault and strategy calls both succeeded on contract, trying latest block number', {
                contractAddress,
                blockNumber,
            });
            return getDetectClassicVaultOrStrategy({ contractAddress, chainId, log });
        }
        log.error('vault and strategy calls both succeeded on contract', {
            contractAddress,
            blockNumber,
        });
        throw new Error(`vault and strategy calls both SUCCESS for contract ${chainId}:${contractAddress}`);
    }

    return {
        isVault: strategy.status === 'success',
        isStrategy: vault.status === 'success',
    };
};
