
import { HandlerContext } from "generated";
import { ChainId } from "../lib/chain";
import { Account_t } from "generated/src/db/Entities.gen";
import { Hex } from "viem";


export const getOrCreateAccount = async ({ context, accountAddress }: { context: HandlerContext, accountAddress: Hex }): Promise<Account_t> => {
    return await context.Account.getOrCreate({
        id: accountAddress,
    });
};