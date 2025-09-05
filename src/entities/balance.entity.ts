import { BigDecimal, HandlerContext } from "generated";
import { TokenBalance_t } from "generated/src/db/Entities.gen";
import { Hex } from "viem";


export const getOrCreateTokenBalanceEntity = async ({ context, tokenAddress, accountAddress }: { context: HandlerContext, tokenAddress: Hex, accountAddress: Hex }): Promise<TokenBalance_t> => {
    const accountBalanceId = `${accountAddress}-${tokenAddress}`;

    return await context.TokenBalance.getOrCreate({
        id: accountBalanceId,

        account_id: accountAddress,
        token_id: tokenAddress,

        amount: new BigDecimal(0),
    });
};