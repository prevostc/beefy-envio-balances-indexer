import { BigDecimal, type HandlerContext } from 'generated';
import type { Token_t } from 'generated/src/db/Entities.gen';
import type { Hex } from 'viem';
import { getTokenMetadata } from '../effects/token.effects';
import type { ChainId } from '../lib/chain';

export const tokenId = ({ chainId, tokenAddress }: { chainId: ChainId; tokenAddress: Hex }) =>
    `${chainId}-${tokenAddress}`;

export const getOrCreateToken = async ({
    context,
    chainId,
    tokenAddress,
}: {
    context: HandlerContext;
    chainId: ChainId;
    tokenAddress: Hex;
}): Promise<Token_t> => {
    const id = tokenId({ chainId, tokenAddress });
    const maybeExistingToken = await context.Token.get(id);
    if (maybeExistingToken) {
        return maybeExistingToken;
    }

    const tokenMetadata = await context.effect(getTokenMetadata, {
        tokenAddress: tokenAddress,
        chainId: chainId,
    });

    return await context.Token.getOrCreate({
        id: id,

        chainId: chainId,

        isVirtual: false,

        name: tokenMetadata.name,
        symbol: tokenMetadata.symbol,
        decimals: tokenMetadata.decimals,

        totalSupply: new BigDecimal(0),

        holderCount: 0,
    });
};
