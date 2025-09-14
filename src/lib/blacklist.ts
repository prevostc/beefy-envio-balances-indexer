import type { ChainId } from './chain';

export const vaultBlacklist: Record<ChainId, string[]> = {
    1: [],
    56: [
        '0x355ecddb484541796c6cbe4e21dc4994d46c096e',
        '0xe444df32778bbd2afbe0e81d368421f609733ec4',
        '0x12c409605e6cc819395422cf77049b18d76437ad',
    ],
    137: [],
    8453: [
        '0xa725c4f6f7dca3148d372dea1d0e92945256de2e',
        '0xb6f855e6457b7966d7b2faf013db6702dceaae81',
        '0x4ad02bf095b8ffb6e0ac687beee5610ca3ebe6b1',
    ],
};
