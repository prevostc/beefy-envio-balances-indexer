import { erc20Abi, withCache } from "viem";
import { experimental_createEffect, S } from "envio";
import { getViemClient } from "../lib/viem";
import { chainIdSchema } from "../lib/chain";
import { hexSchema } from "../lib/hex";


// Use Sury library to define the schema
const tokenMetadataSchema = S.schema({
    name: S.string,
    symbol: S.string,
    decimals: S.number,
});

// Infer the type from the schema
type TokenMetadata = S.Infer<typeof tokenMetadataSchema>;

export const getTokenMetadata = experimental_createEffect(
    {
        name: "getTokenMetadata",
        input: {
            tokenAddress: hexSchema,
            chainId: chainIdSchema,
        },
        output: tokenMetadataSchema,
        // Enable caching to avoid duplicated calls
        cache: true,
    },
    async ({ input, context }) => {
        const { tokenAddress, chainId } = input;

        const cacheKey = `${chainId}-${tokenAddress.toLowerCase()}`;

        return withCache(async () => {
            const client = getViemClient(chainId);
            let results: [number, string, string];

            // Try standard ERC20 interface first (most common)
            const erc20 = { address: tokenAddress as `0x${string}`, abi: erc20Abi } as const;
            results = await client.multicall({
                allowFailure: false,
                contracts: [
                    {
                        ...erc20,
                        functionName: "decimals",
                    },
                    {
                        ...erc20,
                        functionName: "name",
                    },
                    {
                        ...erc20,
                        functionName: "symbol",
                    },
                ],
            });

            const [decimals, name, symbol] = results;

            context.log.info(`Got token details for ${tokenAddress}: ${name} (${symbol}) with ${decimals} decimals`);

            return {
                name,
                symbol,
                decimals,
            };
        }, { cacheKey });
    }
);