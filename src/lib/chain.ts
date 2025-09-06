import { S } from "envio";

export const chainIdSchema = S.union([S.schema(1), S.schema(56), S.schema(8453)]);
export type ChainId = S.Infer<typeof chainIdSchema>;

export const toChainId = (chainId: number): ChainId => {
    return S.parseOrThrow(chainId, chainIdSchema);
};