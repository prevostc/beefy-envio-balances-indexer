import type { HandlerContext } from 'generated';
import type { Account_t } from 'generated/src/db/Entities.gen';
import type { Hex } from 'viem';

export const accountId = ({ accountAddress }: { accountAddress: Hex }) => `${accountAddress}`;

export const getOrCreateAccount = async ({
    context,
    accountAddress,
}: {
    context: HandlerContext;
    accountAddress: Hex;
}): Promise<Account_t> => {
    return await context.Account.getOrCreate({
        id: accountId({ accountAddress }),
    });
};
