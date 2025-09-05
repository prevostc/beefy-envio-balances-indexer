import { createPublicClient, http, Chain as ViemChain } from "viem";
import { config } from "./config";
import { ChainId } from "./chain";
import { base, mainnet } from "viem/chains";

const chainMap: Record<ChainId, ViemChain> = {
    1: mainnet,
    8453: base,
}

export const getViemClient = (chainId: ChainId) => {
    const rpcUrl = config.RPC_URL[chainId];

    return createPublicClient({
        chain: chainMap[chainId],
        // Enable multicall batching for efficiency
        batch: { multicall: true },
        // Thanks to automatic Effect API batching, we can also enable batching for Viem transport level
        transport: http(rpcUrl, { batch: true }),
    });
}