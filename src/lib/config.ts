import { S } from 'envio';
import type { Hex } from 'viem';
import type { ChainId } from './chain';
import { hexSchema } from './hex';

const configSchema = S.schema({
    ADDRESS_ZERO: hexSchema,
    BURN_ADDRESS: hexSchema,
    MINT_ADDRESS: hexSchema,
    RPC_URL: S.schema({
        1: S.string,
        56: S.string,
        137: S.string,
        8453: S.string,
        // biome-ignore lint/suspicious/noExplicitAny: it's fine here
    } satisfies Record<ChainId, any>),
});

export const config = S.parseOrThrow(
    {
        ADDRESS_ZERO: '0x0000000000000000000000000000000000000000',
        BURN_ADDRESS: '0x000000000000000000000000000000000000dead',
        MINT_ADDRESS: '0x0000000000000000000000000000000000000000',
        RPC_URL: {
            1: process.env.ETHEREUM_RPC_URL ?? 'https://eth.drpc.org',
            56: process.env.BSC_RPC_URL ?? 'https://bsc.drpc.org',
            137: process.env.POLYGON_RPC_URL ?? 'https://polygon.drpc.org',
            8453: process.env.BASE_RPC_URL ?? 'https://mainnet.base.org',
        } satisfies Record<ChainId, string>,
    },
    configSchema
);

export const IGNORED_ADDRESSES = [config.ADDRESS_ZERO, config.BURN_ADDRESS, config.MINT_ADDRESS].map(
    (address) => address.toLowerCase() as Hex
);
