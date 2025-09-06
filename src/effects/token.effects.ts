import { erc20Abi } from "viem";
import { experimental_createEffect, S } from "envio";
import { getViemClient } from "../lib/viem";
import { chainIdSchema } from "../lib/chain";
import { hexSchema } from "../lib/hex";

export const getTokenMetadata = experimental_createEffect(
    {
        name: "getTokenMetadata",
        input: {
            tokenAddress: hexSchema,
            chainId: chainIdSchema,
        },
        output: S.schema({
            name: S.string,
            symbol: S.string,
            decimals: S.number,
        }),
        // Enable caching to avoid duplicated calls
        cache: true,
    },
    async ({ input, context }) => {
        const { tokenAddress, chainId } = input;

        const client = getViemClient(chainId);

        context.log.debug(`Fetching token metadata`, { tokenAddress, chainId });

        // Try standard Erc20 interface first (most common)
        const erc20 = { address: tokenAddress as `0x${string}`, abi: erc20Abi } as const;
        const [decimals, name, symbol] = await client.multicall({
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


        context.log.info(`Got token details for ${tokenAddress}: ${name} (${symbol}) with ${decimals} decimals`);

        return {
            name,
            symbol,
            decimals,
        };
    }
);