
import { getTokenMetadata } from "../effects/erc20.effects"
import { BigDecimal, HandlerContext } from "generated";
import { ChainId } from "../lib/chain";
import { ERC20Token_t } from "generated/src/db/Entities.gen";
import { Hex } from "viem";


export const getOrCreateERC20Token = async ({ context, chainId, tokenAddress }: { context: HandlerContext, chainId: ChainId, tokenAddress: Hex }): Promise<ERC20Token_t> => {
    const maybeExistingToken = await context.ERC20Token.get(tokenAddress);
    if (maybeExistingToken) {
        return maybeExistingToken;
    }

    const tokenMetadata = await context.effect(getTokenMetadata, {
        tokenAddress: tokenAddress,
        chainId: chainId,
    });

    return await context.ERC20Token.getOrCreate({
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