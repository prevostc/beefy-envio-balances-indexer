import type { ChainId } from './chain';

export const vaultBlacklist: Record<ChainId, string[]> = {
    1: [],
    56: [],
    137: [],
    8453: ['0xa725c4f6f7dca3148d372dea1d0e92945256de2e', '0xb6f855e6457b7966d7b2faf013db6702dceaae81'],
};
