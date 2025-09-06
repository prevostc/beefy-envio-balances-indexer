import { S } from "envio";
import { ChainId } from "./chain";

const configSchema = S.schema({
    ADDRESS_ZERO: S.string,
    BURN_ADDRESS: S.string,
    MINT_ADDRESS: S.string,
    RPC_URL: S.schema({ 1: S.string, 56: S.string, 8453: S.string } satisfies Record<ChainId, any>),
});

export const config = S.parseOrThrow({
    ADDRESS_ZERO: '0x0000000000000000000000000000000000000000',
    BURN_ADDRESS: '0x000000000000000000000000000000000000dead',
    MINT_ADDRESS: '0x0000000000000000000000000000000000000000',
    RPC_URL: {
        1: process.env.ETHEREUM_RPC_URL ?? 'https://eth.drpc.org',
        56: process.env.BSC_RPC_URL ?? 'https://bsc.drpc.org',
        8453: process.env.BASE_RPC_URL ?? 'https://mainnet.base.org',
    } satisfies Record<ChainId, string>,
}, configSchema);


