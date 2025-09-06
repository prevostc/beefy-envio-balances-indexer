import { getViemClient } from "../lib/viem";
import { ChainId } from "../lib/chain";
import { HandlerContext } from "generated";

export const getDetectClassicVaultOrStrategy = async ({ contractAddress, chainId, blockNumber, log }: { contractAddress: `0x${string}`, chainId: ChainId, blockNumber: number, log: HandlerContext["log"] }) => {
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

    log.info("vault or strategy", { vault: vault.status, strategy: strategy.status });

    if (vault.status === "failure" && strategy.status === "failure") {
        log.error(".vault() and .strategy() calls both failed on contract", { contractAddress, vault: vault.error, strategy: strategy.error });
        throw new Error(".vault() and .strategy() calls both failed");
    }

    return {
        isVault: vault.status === "success",
        isStrategy: strategy.status === "success",
    };
};
