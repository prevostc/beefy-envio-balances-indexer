import { experimental_createEffect, S } from 'envio';
import type { handlerContext as HandlerContext } from 'generated';
import { decodeFunctionData } from 'viem';
import type { ChainId } from '../lib/chain';
import { chainIdSchema } from '../lib/chain';
import { hexSchema } from '../lib/hex';
import { getViemClient } from '../lib/viem';

const detectClassicVaultOrStrategyWithEthCall = async ({
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
    const client = getViemClient(chainId, log);

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
                args: [],
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
                args: [],
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

const vaultOrStrategyFactoryAbi = [
    {
        inputs: [{ internalType: 'address', name: 'implementation', type: 'address' }],
        name: 'cloneContract',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'cloneVault',
        outputs: [{ internalType: 'contract BeefyVaultV7', name: '', type: 'address' }],
        stateMutability: 'nonpayable',
        type: 'function',
    },
];

const detectClassicVaultOrStrategyWithTransactionInput = async ({
    transactionInput,
}: {
    transactionInput: `0x${string}`;
}) => {
    const trxData = decodeFunctionData({
        abi: vaultOrStrategyFactoryAbi,
        data: transactionInput,
    });

    if (trxData.functionName === 'cloneVault') {
        return {
            isStrategy: false,
            isVault: true,
        };
    }

    if (trxData.functionName === 'cloneContract') {
        return {
            isStrategy: true,
            isVault: false,
        };
    }

    return {
        isStrategy: false,
        isVault: false,
    };
};

export async function detectClassicVaultOrStrategy({
    contractAddress,
    chainId,
    transactionInput,
    blockNumber,
    log,
}: {
    contractAddress: `0x${string}`;
    chainId: ChainId;
    transactionInput: `0x${string}`;
    blockNumber?: number;
    log: HandlerContext['log'];
}) {
    try {
        // try the fast decode of trx input first
        const { isStrategy, isVault } = await detectClassicVaultOrStrategyWithTransactionInput({ transactionInput });

        log.debug('detected classic vault or strategy with transaction input', {
            isStrategy,
            isVault,
            transactionInput,
            contractAddress,
            chainId,
            blockNumber,
        });
        return { isStrategy, isVault };
    } catch (error) {
        // fallback to slow eth call
        log.warn('Failed to decode transaction input, falling back to eth call', { error });
        const { isStrategy, isVault } = await detectClassicVaultOrStrategyWithEthCall({
            contractAddress,
            chainId,
            blockNumber,
            log,
        });
        log.debug('detected classic vault or strategy with eth call', {
            isStrategy,
            isVault,
            contractAddress,
            chainId,
            blockNumber,
        });
        return { isStrategy, isVault };
    }
}

export const detectClassicVaultOrStrategyEffect = experimental_createEffect(
    {
        name: 'detectClassicVaultOrStrategyEffect',
        input: {
            contractAddress: hexSchema,
            chainId: chainIdSchema,
            blockNumber: S.number,
            transactionInput: hexSchema,
        },
        output: {
            isStrategy: S.boolean,
            isVault: S.boolean,
        },
        cache: true,
    },
    async ({ input, context }) => {
        const { contractAddress, chainId, blockNumber, transactionInput } = input;
        const { isStrategy, isVault } = await detectClassicVaultOrStrategy({
            contractAddress,
            chainId,
            log: context.log,
            blockNumber,
            transactionInput,
        });
        return { isStrategy, isVault };
    }
);
