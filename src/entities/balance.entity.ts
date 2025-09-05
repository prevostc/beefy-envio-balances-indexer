import { BigDecimal, HandlerContext } from "generated";
import { ERC20TokenBalance_t } from "generated/src/db/Entities.gen";
import { Hex } from "viem";


export const getOrCreateERC20TokenBalanceEntity = async ({ context, tokenAddress, accountAddress }: { context: HandlerContext, tokenAddress: Hex, accountAddress: Hex }): Promise<ERC20TokenBalance_t> => {
    const accountBalanceId = `${accountAddress}-${tokenAddress}`;

    return await context.ERC20TokenBalance.getOrCreate({
        id: accountBalanceId,

        account_id: accountAddress,
        token_id: tokenAddress,

        amount: new BigDecimal(0),
    });
};