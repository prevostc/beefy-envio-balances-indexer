
import { getTokenMetadata } from "../effects/token.effects"
import { BigDecimal, HandlerContext } from "generated";
import { ChainId } from "../lib/chain";
import { Token_t } from "generated/src/db/Entities.gen";
import { Hex } from "viem";


export const getOrCreateToken = async ({ context, chainId, tokenAddress, blockNumber }: { context: HandlerContext, chainId: ChainId, tokenAddress: Hex, blockNumber: number }): Promise<Token_t> => {
    const maybeExistingToken = await context.Token.get(tokenAddress);
    if (maybeExistingToken) {
        return maybeExistingToken;
    }

    const tokenMetadata = await context.effect(getTokenMetadata, {
        tokenAddress: tokenAddress,
        chainId: chainId,
        blockNumber: blockNumber,
    });

    return await context.Token.getOrCreate({
        id: tokenAddress,

        contract_id: tokenAddress,
        isVirtual: false,

        name: tokenMetadata.name,
        symbol: tokenMetadata.symbol,
        decimals: tokenMetadata.decimals,

        totalSupply: new BigDecimal(0),

        holderCount: 0,
    });
};