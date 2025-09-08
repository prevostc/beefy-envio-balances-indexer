import { S } from 'envio';

export const chainIdSchema = S.union([
    S.schema(1), // ethereum
    S.schema(56), // bsc
    S.schema(137), // polygon
    S.schema(8453), // base
]);
export type ChainId = S.Infer<typeof chainIdSchema>;

export const toChainId = (chainId: number): ChainId => {
    return S.parseOrThrow(chainId, chainIdSchema);
};
