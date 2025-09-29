import { addressBookByChainId } from 'blockchain-addressbook';
import { type Logger, S } from 'envio';
import type { HandlerContext } from 'generated/src/Types';
import * as R from 'remeda';
import type { Hex } from 'viem';
import { isClassicBoost } from '../entities/classicBoost.entity';
import { isErc4626Adapter } from '../entities/classicErc4626Adapter.entity';
import { isRewardPool } from '../entities/rewardPool.entity';
import { allChainIds, type ChainId } from './chain';
import { config } from './config';

const vaultBlacklist = R.pipe(
    [
        { chainId: 10, address: '0x2da2d873450d2f0b3c1c7893f16dfb342f9c8492' },
        { chainId: 10, address: '0x3d5dfb6241bf611e472df9affc44711b2f81939e' },
        { chainId: 10, address: '0x44913882fe27452e51bfce17849df7ffc3e9ba0f' },
        { chainId: 10, address: '0x6521a5b613e35c30980fe38e87aac3aa73e1713d' },
        { chainId: 10, address: '0x9793831abec4563975da7b01f7f9ba5df61b44c7' },
        { chainId: 10, address: '0xec4b69ff273be97874d063d18082da911a4fb135' },
        { chainId: 100, address: '0x47b75ddc83c0012f2b35f248a3188a977f8b326b' },
        { chainId: 100, address: '0x481f365b3f086d76a55b8df589b791a3fb51a94b' },
        { chainId: 100, address: '0x99b2b3330d68f9acfd9a5b09b92158f4857a3bef' },
        { chainId: 100, address: '0xddf0c27c6f6be455fefbf563dd95d8833f1d7af7' },
        { chainId: 100, address: '0xf1fbf36124c00567748782df54d47e7f09c91ab4' },
        { chainId: 1284, address: '0x21f6a933f3dc7f34a1908dffff7d9fec699cfd95' },
        { chainId: 1284, address: '0x57de8fafb97a0a8e051fd01a91f707280cba809b' },
        { chainId: 1284, address: '0xb7eae5ec5c002f8f747df6c671aaa4fa51bb630f' },
        { chainId: 137, address: '0x0d269aac25ad33653185ccdaf2239b7bcd0f5fc2' },
        { chainId: 137, address: '0x10510c6c9989fbb54e56658a47ce4b837553c5db' },
        { chainId: 137, address: '0x14bce5a8023a6264bbee3d2ef4586f633eb901d1' },
        { chainId: 137, address: '0x1697eb773c8d626f8d80e0923279d97348b47029' },
        { chainId: 137, address: '0x27822f864b584daa61b51d324fc11d27a74b5410' },
        { chainId: 137, address: '0x2eb75a5e6e227006a01ca49e2c8231a439d24e08' },
        { chainId: 137, address: '0x3c7b7ac6ddac2fcf2e903267199b7f7a125948fb' },
        { chainId: 137, address: '0x42b661e3f4acee1d496f7133fc545dd6ba25d493' },
        { chainId: 137, address: '0x45c11d160935b69cc8400d4b5a15d011a7618de6' },
        { chainId: 137, address: '0x4c08295817485141c3a89202843b4405701d42e1' },
        { chainId: 137, address: '0x4e6d94e9a719f5c48274402668f6abe4d95ceeed' },
        { chainId: 137, address: '0x503f5d70ed1056d38f35032882fd98649acef8d9' },
        { chainId: 137, address: '0x51fc4371d03534f378b86498041995714b3562d4' },
        { chainId: 137, address: '0x5666778cbdce7e5b7666c25aec05720ad8654231' },
        { chainId: 137, address: '0x58acfe5479f5460b90046586ddee82e620c1b82f' },
        { chainId: 137, address: '0x5b76906663b4ae740aca844b11ea28b36f1aa8be' },
        { chainId: 137, address: '0x6c7bc79594a59ff517d8e19b7cb8ae6d896082b2' },
        { chainId: 137, address: '0x6f0d573ff8a8af15c47475450bd250161b6501cb' },
        { chainId: 137, address: '0x72d7c295e7945a09affc14c656e898a79b7eac4e' },
        { chainId: 137, address: '0x761d99ca021ac8b138fc598ffba322e07ab247f9' },
        { chainId: 137, address: '0x7841d96596cef1eaf18aaa8389df3cf2f3e12101' },
        { chainId: 137, address: '0x78a2470889231521b9ffc59fffbaa051b20e2c09' },
        { chainId: 137, address: '0x79305315e406756d3965a770fd54ae7d853bd437' },
        { chainId: 137, address: '0x7f1dfc6e3cbabd0df7d861cedbff31e8c569eadb' },
        { chainId: 137, address: '0x7f9d2ce4aa46ee6d42de55e338b0f040e88d41e0' },
        { chainId: 137, address: '0x82692d5fa7681010d292770dc81b9fd33087e750' },
        { chainId: 137, address: '0x858d68e03f2104494678e4e78445ff4c6e3fdb57' },
        { chainId: 137, address: '0x895fced0160ed5a25c20daef3bf560a6193b547e' },
        { chainId: 137, address: '0x8fb2da68e12e9927fe675387b336352c7652905c' },
        { chainId: 137, address: '0x96ad60be6da9829a0135409e010d05099700d692' },
        { chainId: 137, address: '0x97aecfa31106ce9a327d05303a01219ad7c61fea' },
        { chainId: 137, address: '0x9ed8a96409206ad6ed3f007f16c714452912b017' },
        { chainId: 137, address: '0x9f17ca3dc9efe20e90980b1ea32ac2f610665cf1' },
        { chainId: 137, address: '0xa664dc64d801e487ff123992ef2c9949b4955b87' },
        { chainId: 137, address: '0xab542e4099102b6a47cf09af1a1c038fc2629457' },
        { chainId: 137, address: '0xae22cb29b290c0780b782ef53a5c24718722c761' },
        { chainId: 137, address: '0xae85e4608c709a509fd7d690c9ef58e8751dae69' },
        { chainId: 137, address: '0xaecf34b292c92a90778377b485c48d8dd4641007' },
        { chainId: 137, address: '0xb6c0e4674b67650b76d59a7f0f4d92b5b3790ef3' },
        { chainId: 137, address: '0xb7d58c9d8537fa4b83e2b1cf53f73c8f7709b45b' },
        { chainId: 137, address: '0xbe8178575873f111d4a47ff5963cdd6750f5ff6e' },
        { chainId: 137, address: '0xc0163ae9e9dceff030249f33036a01520dc29684' },
        { chainId: 137, address: '0xc0cb143bb85470dbe20c787c4bbcac68ed632613' },
        { chainId: 137, address: '0xc63395ab04e08fe2e48b97dc917130bb47641736' },
        { chainId: 137, address: '0xc67c3af465ccfb4eb5f48f8f95e1222242653256' },
        { chainId: 137, address: '0xc8436638acfaebbde20f6e1757901990df6814ed' },
        { chainId: 137, address: '0xcb14efcfcd4890f5b1084024a8a781721124460d' },
        { chainId: 137, address: '0xce09d8d2bf3a1c1dcfb7252b2a3e0314e53fcdc6' },
        { chainId: 137, address: '0xd060a6a135477a33af5324e785c9cd8ef515cbdc' },
        { chainId: 137, address: '0xd5b7a7fead9ea985d78dc64da6ed9ba2fd560667' },
        { chainId: 137, address: '0xd6e22ea2df2f929c4ec1cfd3630d4b67cadcbd87' },
        { chainId: 137, address: '0xd903f9a2c1c4d4a3cd1aac7021333549e717fcee' },
        { chainId: 137, address: '0xda0841b0be1428c7195bbad5d650839c37e68407' },
        { chainId: 137, address: '0xdc2ade1e285c78b8a3d6d455bb0e1d9ecbad4761' },
        { chainId: 137, address: '0xe1c615248f786bb7f37fdcbbb40f436ca935a073' },
        { chainId: 137, address: '0xe4d610537a2ee2b58568d735807338d9cc65b41b' },
        { chainId: 137, address: '0xe5b36d6f9881df006c964e455ef4c09ab775edc3' },
        { chainId: 137, address: '0xe60527a7a83f0ebaa4a8c8ae360bc18d58f0ab4c' },
        { chainId: 137, address: '0xe87cbd763517760277abed58d5baefcf0af11581' },
        { chainId: 137, address: '0xe94f29067205de23ddd4d8ed1b4e61b25bb37e4b' },
        { chainId: 137, address: '0xf3e4042e66a31268ef4750b85ecedaead60b93ca' },
        { chainId: 250, address: '0x8afc0f9BdC5DcA9f0408Df03A03520bFa98A15aF' },
        { chainId: 324, address: '0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4' },
        { chainId: 34443, address: '0x4ad02bf095b8ffb6e0ac687beee5610ca3ebe6b1' },
        { chainId: 34443, address: '0xde59ca36f43ed1fa7ab67c419fc20be12a868712' },
        { chainId: 42161, address: '0x0311372fc28f1be254853005b67e0e82942cbd4d' },
        { chainId: 42161, address: '0x1871e965a4ee3c31967c12a498cfe2906bc24c73' },
        { chainId: 42161, address: '0x293bf49df5400692c603ebdec52ef2b5dcb4a0c0' },
        { chainId: 42161, address: '0x332d4f7960fd8a927e40313f6d60c6f980cc593e' },
        { chainId: 42161, address: '0xd28a4ca0fdab6fcdb09427e20d8190f86469e89a' },
        { chainId: 43114, address: '0x6674f3961C5908B086A5551377806f4BA8F0Ac99' },
        { chainId: 56, address: '0x12c409605e6cc819395422cf77049b18d76437ad' },
        { chainId: 56, address: '0x19daae2ae9ded737d980e328b509986bce27ad91' },
        { chainId: 56, address: '0x22f4eb9514fd01a7909215656643880a060c4f6f' },
        { chainId: 56, address: '0x2cb78da6342e13f10bd88d5d16cc24a3f499539b' },
        { chainId: 56, address: '0x2fedb6a32d02c7ed7c8596f12f7c7e302e17bfb3' },
        { chainId: 56, address: '0x355ecddb484541796c6cbe4e21dc4994d46c096e' },
        { chainId: 56, address: '0x35a1cb20f7a8c717c83037fb67b733584f05fb17' },
        { chainId: 56, address: '0x4405a1eb4c4be56e34358a8ebd77705f56c56e03' },
        { chainId: 56, address: '0x52bee14ddc0bdd9c97838f28eee10aea2d056cf5' },
        { chainId: 56, address: '0x54e88c45b1766f1c10ab4d3933f6fbf7101d70af' },
        { chainId: 56, address: '0x856d44f47ffd7166d183dc5feeb54ba95fe30cd2' },
        { chainId: 56, address: '0xa8054c5af2597f2b83ae91476d13b1aa14a608cd' },
        { chainId: 56, address: '0xcd54d818d3fb15f3919dc384aa3a5e6d914d3996' },
        { chainId: 56, address: '0xd40acf71871d84eb87b13c9639e9fcd28a0630c2' },
        { chainId: 56, address: '0xd5b292e6691618b8c4d8aede8f0fd71ddfa9c05f' },
        { chainId: 56, address: '0xe444df32778bbd2afbe0e81d368421f609733ec4' },
        { chainId: 56, address: '0xe95af6f8d87b937a7cb033542032a888b33063f3' },
        { chainId: 56, address: '0xef2b7166d389b5726de4ca634c9ed1fbd8ccead4' },
        { chainId: 56, address: '0xf0ead8d70f65a162fb88f481c7c306b27309a119' },
        { chainId: 59144, address: '0x3d80b49fc4dc9e450efac1bd34cdeb2f303c2e81' },
        { chainId: 59144, address: '0x719b6c7c4c0ad965bc972ccba4a37544a11c766e' },
        { chainId: 59144, address: '0xdd43c6e636fac90598dde21e57e8e9cbb1a6d8fd' },
        { chainId: 8453, address: '0x0a1bbea11423f0cd2c247a9ad2ae6bd06aebc60d' },
        { chainId: 8453, address: '0x0bd1ecea83b07ec9836f82236567bcbc4f0862f0' },
        { chainId: 8453, address: '0x0d6a63dc3b82792ae127c224217e04f2ac580947' },
        { chainId: 8453, address: '0x11da70a4389d68cdaa5079b1e8fb5f580bccd6be' },
        { chainId: 8453, address: '0x14f610d02da4440a908ddeb7fb0a9a0f0e7ecf0a' },
        { chainId: 8453, address: '0x18b3ff55d5a41f8b4d9610cfc9c839d2e45a4515' },
        { chainId: 8453, address: '0x2b8d8cff6d660290e3d98405b1770c8bab9f125c' },
        { chainId: 8453, address: '0x2eacd55c2a2c442d72992dd66fa11b476238cbc0' },
        { chainId: 8453, address: '0x303a1247be1dc6182a3eeff08b340f46f553f414' },
        { chainId: 8453, address: '0x305cc875b66e52ba366b630909490b88ab32f628' },
        { chainId: 8453, address: '0x3173df7ee4f27c8be26193e05b658240d60c7216' },
        { chainId: 8453, address: '0x329adbe706e87a2a1ee4c5caeece716ba4901c05' },
        { chainId: 8453, address: '0x396808b5cb13a7efe2f83b92a2083949789d044a' },
        { chainId: 8453, address: '0x3c5a2e944b97fd55a0bfeeaeefa915571f1dba35' },
        { chainId: 8453, address: '0x3dfa2304ae2ccc680e9344fb03131522307fc2a6' },
        { chainId: 8453, address: '0x3fdacf9c88ba6065004bcac97f3124f1be1959fe' },
        { chainId: 8453, address: '0x3fdacf9c88ba6065004bcac97f3124f1be1959fe' },
        { chainId: 8453, address: '0x42f1a7795083eee1f804dd4d33c5e69a0f32bca4' },
        { chainId: 8453, address: '0x43c4a608f6cfa2348d568f77a14389688788e8ee' },
        { chainId: 8453, address: '0x46d54e9595d61b2f6764c77a1d6448158f4245af' },
        { chainId: 8453, address: '0x49aebb6e20d9ff5b6426ede96fd74712db17f616' },
        { chainId: 8453, address: '0x4ad02bf095b8ffb6e0ac687beee5610ca3ebe6b1' },
        { chainId: 8453, address: '0x4b9de8f9b2b1afd77efca670821d962f2031be26' },
        { chainId: 8453, address: '0x4ff14c8f17b2ad123f04fbe85d764a627dc3223d' },
        { chainId: 8453, address: '0x52ef6f34433c5bb6fdc0c7954943f6b82eab801f' },
        { chainId: 8453, address: '0x556b04ddbdb678a9f4a6813c15760ab0e9ffe2a3' },
        { chainId: 8453, address: '0x55b61ae86e827075b5301fc4cc42cdbfcc64edef' },
        { chainId: 8453, address: '0x5af45b3a8cb44b444ddf9cceb90f5998eac0fc97' },
        { chainId: 8453, address: '0x5b9ab4958823ba8b75b4d398800a97cccb4aa8f2' },
        { chainId: 8453, address: '0x61e3dbabb0493497ba7e6bb5a59d34e79cf4263b' },
        { chainId: 8453, address: '0x61e3dbabb0493497ba7e6bb5a59d34e79cf4263b' },
        { chainId: 8453, address: '0x62f1d6f43c5ea61d1c9b687c3bc338c94906da52' },
        { chainId: 8453, address: '0x67ba56deccbe2ccdb54254c8a13df1e9a42f6b09' },
        { chainId: 8453, address: '0x6e662b6e438858a3ee6c31b651c1efd3360ae348' },
        { chainId: 8453, address: '0x8498b9268ccf4dc012301f53fd4da2fd4083e4c2' },
        { chainId: 8453, address: '0x87898dea43bfa4e99208f9eb0e1b1ee65a2f8582' },
        { chainId: 8453, address: '0x8b17e3f830d4c5c7cb06a4092126e8ce3026d548' },
        { chainId: 8453, address: '0x8ca034a6a1662e207514fd17c1c69ee317b2c58b' },
        { chainId: 8453, address: '0x8f7f80965d76797db30963c274fcf9cd06887786' },
        { chainId: 8453, address: '0x92253f6e64803fb838b0e9959d9da1b9c5c0e944' },
        { chainId: 8453, address: '0xa0f499e75972ad7c72c31b150c18a0e8a75eaa1b' },
        { chainId: 8453, address: '0xa394dd3efab3db849ef3fb81b4227eb606fc9d65' },
        { chainId: 8453, address: '0xa4dfe9c844d01c5f5c0ebd7d066f79b34032761e' },
        { chainId: 8453, address: '0xa725c4f6f7dca3148d372dea1d0e92945256de2e' },
        { chainId: 8453, address: '0xa8492c7112e86244317e666b3a856713dff1226a' },
        { chainId: 8453, address: '0xa95c5a92f50d13225f93186889d3eece0ee5dc77' },
        { chainId: 8453, address: '0xb60394ce63c2180c08e1910bfc588b0156d18149' },
        { chainId: 8453, address: '0xb6f855e6457b7966d7b2faf013db6702dceaae81' },
        { chainId: 8453, address: '0xc3e8298bdfa003a6edda09cfce8706902dc7d0a2' },
        { chainId: 8453, address: '0xc4cd7adcaba92db1c27843d971b540943ef1ea31' },
        { chainId: 8453, address: '0xc60e5e5b65b5fba8b099e21d8658b8377bf34321' },
        { chainId: 8453, address: '0xc8616746c44bfddc121887049eed96637c5ba971' },
        { chainId: 8453, address: '0xd209283562f1874f02ace3abb31e977af0ea7840' },
        { chainId: 8453, address: '0xd6881c98e6be699d972ae8c74a5b8748073e6e96' },
        { chainId: 8453, address: '0xdaa86c56c8febc471a4674a8ff59e23f73dae317' },
        { chainId: 8453, address: '0xdd8800d70cf9edc73f9d73852db08121237ebe6a' },
        { chainId: 8453, address: '0xe255486bc7128dad3e8be4abc208410e0393bff6' },
        { chainId: 8453, address: '0xebe5b28ddf72ee445081a2b7a0d3eb7c9a8eea0c' },
        { chainId: 8453, address: '0xf42b6993304425b3d5adf57b2dcf4a51364b6697' },
        { chainId: 8453, address: '0xf42b6993304425b3d5adf57b2dcf4a51364b6697' },
        { chainId: 8453, address: '0xf4ebfc69e36904b482aebcc6ca6362e92f5b176a' },
        { chainId: 8453, address: '0xf765c6d26b0b493c2e44075c0e722c3be5a40dad' },
        { chainId: 8453, address: '0xfb195045365620266ba8c300f42cf69720d2d016' },
        { chainId: 8453, address: '0xfc2f20a29697c400577b944c648378cf61cc3748' },
        { chainId: 8453, address: '0xfe3528cd1fe76745886efd655e5ab54859043df1' },
        { chainId: 8453, address: '0xfeb6d8c8571d64b7aa2c4d9b720750b0256d34fe' },
    ],
    // ensure lowercase addresses
    R.map((entry) => ({ ...entry, address: entry.address.toLowerCase() as Hex })),
    // O(1) lookup
    // { [chainId]: { [address]: true } }
    R.groupBy((entry) => entry.chainId),
    R.mapValues((addresses) =>
        R.pipe(
            addresses,
            R.indexBy(({ address }) => address),
            R.mapValues(() => true)
        )
    )
);

export function isVaultBlacklisted(chainId: ChainId, address: string) {
    if (!(chainId in vaultBlacklist)) {
        return false;
    }
    return vaultBlacklist[chainId as keyof typeof vaultBlacklist]?.[address.toLowerCase() as Hex] ?? false;
}

const allAccountBlacklist = R.pipe(
    // raw account blacklist
    [
        { chainId: 56, address: '0x03c509fd85d51dc7e75fa2de06276cfa147486ea' },
        { chainId: 56, address: '0xac18fcb470f913b94946bee43dc52e197d765791' },
        { chainId: 56, address: '0x31fe02b9ea5501bfe8a872e205dfe6b6a79435ed' },
        { chainId: 137, address: '0xf039fe26456901f863c873556f40fb207c6c9c18' },
        { chainId: 137, address: '0x540a9f99bb730631bf243a34b19fd00ba8cf315c' },
        { chainId: 8453, address: '0x6f19da51d488926c007b9ebaa5968291a2ec6a63' },
    ],
    // ignore addresses from address book to all chains
    R.concat(
        R.pipe(
            addressBookByChainId,
            R.entries(),
            R.flatMap(([chainId, cfg]) =>
                R.pipe(
                    [
                        cfg.platforms.beefyfinance.beefySwapper,
                        cfg.platforms.beefyfinance.zap,
                        cfg.platforms.beefyfinance.zapTokenManager,
                    ],
                    R.filter((address) => address !== undefined),
                    R.map((address) => ({ chainId, address }))
                )
            )
        )
    ),
    // add config addresses to all chains (concatenate arrays)
    R.concat(
        R.pipe(
            allChainIds,
            R.flatMap((chainId) =>
                R.pipe(
                    [config.ADDRESS_ZERO, config.BURN_ADDRESS, config.MINT_ADDRESS],
                    R.map((address) => ({ chainId, address }))
                )
            )
        )
    ),

    // ensure lowercase addresses
    R.map((entry) => ({ ...entry, address: entry.address.toLowerCase() as Hex })),
    // O(1) lookup
    // { [chainId]: { [address]: true } }
    R.groupBy((entry) => entry.chainId),
    R.mapValues((addresses) =>
        R.pipe(
            addresses,
            R.indexBy(({ address }) => address),
            R.mapValues(() => true)
        )
    )
);

export async function isAccountBlacklisted(context: HandlerContext, chainId: ChainId, address: string) {
    const lowerAddress = address.toLowerCase() as Hex;
    if (allAccountBlacklist[chainId][lowerAddress]) {
        return true;
    }
    // don't track balances for ERC4626 adapters
    // we'll track that separately as vault breakdown
    const [erc4626Adapter, rewardPool] = await Promise.all([
        isErc4626Adapter(context, chainId, lowerAddress),
        isRewardPool(context, chainId, lowerAddress),
        isClassicBoost(context, chainId, lowerAddress),
    ]);
    if (erc4626Adapter || rewardPool) {
        return true;
    }
    return false;
}

export const blacklistStatus = S.union([
    // all is green
    'ok',
    // definitly malformed contract
    'blacklisted',
    // we won't be able to index it for now
    // but that does not mean it's malformed
    // maybe it can be indexed later when rpc is available
    // but can also be a bug in the indexer
    // but can also be a bug in the contract
    'maybe_blacklisted',
]);
export type BlacklistStatus = S.Output<typeof blacklistStatus>;

// have a common log function for blacklist status
// that makes it easy to grep all blacklist logs and inspect them:
// tail -f ./generated/hyperindex.log | rg -i 'BLACKLIST' | jq '{chainId, contractAddress}'
export const logBlacklistStatus = (
    log: Logger,
    status: BlacklistStatus,
    type: string,
    data: Record<string, unknown> & { contractAddress: string }
) => {
    log.error(`[BLACKLIST] ${type}`, { status, ...data, contractAddress: data.contractAddress });
};
