import { S } from "envio";
import { ChainId } from "./chain";

const configSchema = S.schema({
    ADDRESS_ZERO: S.string,
    BURN_ADDRESS: S.string,
    MINT_ADDRESS: S.string,
    ZERO_BI: S.bigint,
    RPC_URL: S.schema({ 1: S.string, 8453: S.string } satisfies Record<ChainId, any>),
});

export const config = S.parseOrThrow({
    ADDRESS_ZERO: '0x0000000000000000000000000000000000000000',
    BURN_ADDRESS: '0x000000000000000000000000000000000000dead',
    MINT_ADDRESS: '0x0000000000000000000000000000000000000000',
    ZERO_BI: 0n,
    RPC_URL: {
        1: process.env.ETHEREUM_RPC_URL ?? null,
        8453: process.env.BASE_RPC_URL ?? null,
    } satisfies Record<ChainId, string | null>,
}, configSchema);
