import { getViemClient } from "../lib/viem";
import { ChainId } from "../lib/chain";

export const getDetectClassicVaultOrStrategy = async ({ contractAddress, chainId, blockNumber }: { contractAddress: `0x${string}`, chainId: ChainId, blockNumber: number }) => {
    const client = getViemClient(chainId);

    // Try standard Erc20 interface first (most common)
    const [vault, strategy] = await client.multicall({
        allowFailure: true,
        contracts: [
            {
                address: contractAddress as `0x${string}`,
                abi: [
                    {
                        name: "vault",
                        type: "function",
                        inputs: [],
                        outputs: [{
                            name: "vault",
                            type: "address",
                        }],
                    },
                ],
                functionName: "vault",
            },
            {
                address: contractAddress as `0x${string}`,
                abi: [
                    {
                        name: "strategy",
                        type: "function",
                        inputs: [],
                        outputs: [{
                            name: "strategy",
                            type: "address",
                        }],
                    },
                ],
                functionName: "strategy",
            },
        ],
        blockNumber: BigInt(blockNumber),
    });


    return {
        isVault: vault.status === "success",
        isStrategy: strategy.status === "success",
    };
};
