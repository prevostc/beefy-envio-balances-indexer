import type { Hex } from 'viem';
import type { ChainId } from './chain';

const vaultBlacklist: Record<ChainId, Hex[]> = {
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
        '0x46d54e9595d61b2f6764c77a1d6448158f4245af',
        '0x8ca034a6a1662e207514fd17c1c69ee317b2c58b',
        '0xa8492c7112e86244317e666b3a856713dff1226a',
        '0xdd8800d70cf9edc73f9d73852db08121237ebe6a',
        '0x2b8d8cff6d660290e3d98405b1770c8bab9f125c',
    ],
};

// Ensure all addresses in the blacklist are lowercase at runtime (defensive check)
for (const address of Object.values(vaultBlacklist).flat()) {
    if (address !== address.toLowerCase()) {
        throw new Error(`Address ${address} is not lowercase`);
    }
}

export function isVaultBlacklisted(chainId: ChainId, address: string) {
    return (vaultBlacklist[chainId] ?? []).includes(address.toLowerCase() as Hex);
}
