import { S } from 'envio';

export const chainIdSchema = S.union([
    S.schema(42161), // arbitrum
    S.schema(43114), // avax
    S.schema(8453), // base
    S.schema(80094), // berachain
    S.schema(56), // bsc
    S.schema(1), // ethereum
    S.schema(250), // fantom
    S.schema(252), // fraxtal
    S.schema(100), // gnosis
    S.schema(999), // hyperevm
    S.schema(59144), // linea
    S.schema(1135), // lisk
    S.schema(169), // manta
    S.schema(5000), // mantle
    S.schema(1088), // metis
    S.schema(34443), // mode
    S.schema(1284), // moonbeam
    S.schema(10), // optimism
    S.schema(9745), // plasma
    S.schema(137), // polygon
    S.schema(30), // rootstock
    S.schema(5464), // saga
    S.schema(534352), // scroll
    S.schema(1329), // sei
    S.schema(146), // sonic
    S.schema(130), // unichain
    S.schema(324), // zksync
]);

export type ChainId = S.Infer<typeof chainIdSchema>;

export const toChainId = (chainId: number): ChainId => {
    return S.parseOrThrow(chainId, chainIdSchema);
};
