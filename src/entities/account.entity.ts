import type { HandlerContext } from 'generated';
import type { Account_t } from 'generated/src/db/Entities.gen';
import type { Hex } from 'viem';
import { IGNORED_ADDRESSES } from '../lib/config';

export const accountId = ({ accountAddress }: { accountAddress: Hex }) => `${accountAddress}`;

export const getOrCreateAccount = async ({
    context,
    accountAddress,
}: {
    context: HandlerContext;
    accountAddress: Hex;
}): Promise<Account_t | null> => {
    if (IGNORED_ADDRESSES.includes(accountAddress.toLowerCase() as Hex)) {
        return null;
    }
    return await context.Account.getOrCreate({
        id: accountId({ accountAddress }),
        address: accountAddress,
    });
};
