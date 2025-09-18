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
        '0x0a1bbea11423f0cd2c247a9ad2ae6bd06aebc60d',
        '0x0bd1ecea83b07ec9836f82236567bcbc4f0862f0',
        '0x0d6a63dc3b82792ae127c224217e04f2ac580947',
        '0x11da70a4389d68cdaa5079b1e8fb5f580bccd6be',
        '0x14f610d02da4440a908ddeb7fb0a9a0f0e7ecf0a',
        '0x18b3ff55d5a41f8b4d9610cfc9c839d2e45a4515',
        '0x2b8d8cff6d660290e3d98405b1770c8bab9f125c',
        '0x2eacd55c2a2c442d72992dd66fa11b476238cbc0',
        '0x303a1247be1dc6182a3eeff08b340f46f553f414',
        '0x305cc875b66e52ba366b630909490b88ab32f628',
        '0x3173df7ee4f27c8be26193e05b658240d60c7216',
        '0x3c5a2e944b97fd55a0bfeeaeefa915571f1dba35',
        '0x3fdacf9c88ba6065004bcac97f3124f1be1959fe',
        '0x3fdacf9c88ba6065004bcac97f3124f1be1959fe',
        '0x42f1a7795083eee1f804dd4d33c5e69a0f32bca4',
        '0x43c4a608f6cfa2348d568f77a14389688788e8ee',
        '0x46d54e9595d61b2f6764c77a1d6448158f4245af',
        '0x49aebb6e20d9ff5b6426ede96fd74712db17f616',
        '0x4ad02bf095b8ffb6e0ac687beee5610ca3ebe6b1',
        '0x52ef6f34433c5bb6fdc0c7954943f6b82eab801f',
        '0x5af45b3a8cb44b444ddf9cceb90f5998eac0fc97',
        '0x61e3dbabb0493497ba7e6bb5a59d34e79cf4263b',
        '0x61e3dbabb0493497ba7e6bb5a59d34e79cf4263b',
        '0x6e662b6e438858a3ee6c31b651c1efd3360ae348',
        '0x87898dea43bfa4e99208f9eb0e1b1ee65a2f8582',
        '0x8ca034a6a1662e207514fd17c1c69ee317b2c58b',
        '0x92253f6e64803fb838b0e9959d9da1b9c5c0e944',
        '0xa0f499e75972ad7c72c31b150c18a0e8a75eaa1b',
        '0xa4dfe9c844d01c5f5c0ebd7d066f79b34032761e',
        '0xa725c4f6f7dca3148d372dea1d0e92945256de2e',
        '0xa8492c7112e86244317e666b3a856713dff1226a',
        '0xa95c5a92f50d13225f93186889d3eece0ee5dc77',
        '0xb60394ce63c2180c08e1910bfc588b0156d18149',
        '0xb6f855e6457b7966d7b2faf013db6702dceaae81',
        '0xc3e8298bdfa003a6edda09cfce8706902dc7d0a2',
        '0xc60e5e5b65b5fba8b099e21d8658b8377bf34321',
        '0xc8616746c44bfddc121887049eed96637c5ba971',
        '0xd209283562f1874f02ace3abb31e977af0ea7840',
        '0xdaa86c56c8febc471a4674a8ff59e23f73dae317',
        '0xdd8800d70cf9edc73f9d73852db08121237ebe6a',
        '0xebe5b28ddf72ee445081a2b7a0d3eb7c9a8eea0c',
        '0xf42b6993304425b3d5adf57b2dcf4a51364b6697',
        '0xf42b6993304425b3d5adf57b2dcf4a51364b6697',
        '0xf4ebfc69e36904b482aebcc6ca6362e92f5b176a',
        '0xf765c6d26b0b493c2e44075c0e722c3be5a40dad',
        '0xfb195045365620266ba8c300f42cf69720d2d016',
        '0xfeb6d8c8571d64b7aa2c4d9b720750b0256d34fe',
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
