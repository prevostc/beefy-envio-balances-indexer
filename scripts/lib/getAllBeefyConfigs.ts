import * as R from 'remeda';
import type { Hex } from 'viem';
import { type BeefyChainId, getWNativeToken, isNativeToken } from './addressbook';

type BeefyVault = {
    id: string;
    vault_address: Hex;
    undelying_lp_address: Hex;
    strategy_address: Hex;
    vault_token_symbol: string;
    chain: string;
    reward_pools: BeefyRewardPool[];
    boosts: BeefyBoost[];
    pointStructureIds: string[];
    platformId: ApiPlatformId;
    status: 'active' | 'eol';
    underlyingPlatform: string | null;
} & (
    | {
          protocol_type: 'beefy_clm_vault';
          beefy_clm_manager: BeefyVault;
      }
    | {
          protocol_type: Exclude<BeefyProtocolType, 'beefy_clm_vault'>;
      }
);

type BeefyRewardPool = {
    id: string;
    clm_address: Hex;
    reward_pool_address: Hex;
};

type BeefyBoost = {
    id: string;
    boost_address: Hex;
    underlying_address: Hex;
};

export type BeefyProtocolType =
    | 'aave'
    | 'balancer'
    | 'balancer_aura'
    | 'beefy_clm_vault'
    | 'beefy_clm'
    | 'curve'
    | 'gamma'
    | 'ichi'
    | 'pendle_equilibria'
    | 'solidly';

type ApiPlatformId =
    | 'aerodrome'
    | 'aura'
    | 'beefy'
    | 'curve'
    | 'equilibria'
    | 'gamma'
    | 'ichi'
    | 'lendle'
    | 'lynex'
    | 'magpie'
    | 'mendi'
    | 'nile'
    | 'velodrome';

type ApiStrategyTypeId = 'lp' | 'multi-lp' | 'multi-lp-locked' | 'cowcentrated';

type ApiVault = {
    id: string;
    name: string;
    status: 'active' | 'eol';
    earnedTokenAddress: string;
    depositTokenAddresses?: string[];
    chain: string;
    platformId: ApiPlatformId;
    token: string;
    tokenAddress?: string;
    earnedToken: string;
    isGovVault?: boolean;
    strategyTypeId?: ApiStrategyTypeId;
    bridged?: object;
    assets?: string[];
    strategy: Hex;
    pointStructureIds?: string[];
};

type ApiClmManager = {
    id: string;
    name: string;
    status: 'active' | 'eol';
    version: number;
    platformId: ApiPlatformId;
    strategyTypeId?: ApiStrategyTypeId;
    earnedToken: string;
    strategy: string;
    chain: string;
    type: 'cowcentrated' | 'others';
    tokenAddress: string; // underlying pool address
    depositTokenAddresses: string[]; // token0 and token1
    earnContractAddress: string; // reward pool address
    earnedTokenAddress: string; // clm manager address
    pointStructureIds?: string[];
    tokenProviderId?: string;
};

type ApiClmRewardPool = {
    id: string;
    status: 'active' | 'eol';
    version: number;
    platformId: ApiPlatformId;
    strategyTypeId?: ApiStrategyTypeId;
    chain: string;
    tokenAddress: string; // clm address (want)
    earnContractAddress: string; // reward pool address
    earnedTokenAddresses: string[]; // reward tokens
};

type ApiGovVault = {
    id: string;
    status: 'active' | 'eol';
    version: number;
    chain: string;
    tokenAddress: string; // clm address
    earnContractAddress: string; // reward pool address
    earnedTokenAddresses: string[];
};

type ApiBoost = {
    id: string;
    poolId: string;

    version: number;
    chain: string;
    status: 'active' | 'eol';

    tokenAddress: string; // underlying
    earnedTokenAddress: string; // reward token address
    earnContractAddress: string; // reward pool address
};

const protocol_map: Record<ApiPlatformId, BeefyProtocolType> = {
    aerodrome: 'solidly',
    aura: 'balancer_aura',
    beefy: 'beefy_clm',
    curve: 'curve',
    equilibria: 'pendle_equilibria',
    gamma: 'gamma',
    ichi: 'ichi',
    lendle: 'aave',
    lynex: 'solidly',
    magpie: 'pendle_equilibria',
    mendi: 'aave',
    nile: 'solidly',
    velodrome: 'solidly',
};

const platformIdToProtocolType: Record<string, BeefyProtocolType> = {
    balancer: 'balancer',
};

const BEEFY_MOO_VAULT_API = 'https://api.beefy.finance/vaults';
const BEEFY_COW_VAULT_API = 'https://api.beefy.finance/cow-vaults';
const BEEFY_GOV_API = 'https://api.beefy.finance/gov-vaults';
const BEEFY_BOOST_API = 'https://api.beefy.finance/boosts';

export const getAllBeefyConfigs = async (chain: BeefyChainId): Promise<BeefyVault[]> => {
    const [cowVaultsData, mooVaultsData, clmRewardPoolData, [boostData, vaultRewardPoolData]] = await Promise.all([
        fetch(`${BEEFY_COW_VAULT_API}/${chain}`)
            .then((res) => res.json())
            .then((res) => (res as ApiClmManager[]).filter((vault) => vault.chain === chain)),
        fetch(`${BEEFY_MOO_VAULT_API}/${chain}`)
            .then((res) => res.json())
            .then((res) =>
                (res as ApiVault[])
                    .filter((vault) => vault.chain === chain)
                    .filter((vault) => vault.isGovVault !== true)
            ),
        fetch(`${BEEFY_GOV_API}/${chain}`)
            .then((res) => res.json())
            .then((res) => (res as ApiClmRewardPool[]).filter((g) => g.chain === chain).filter((g) => g.version === 2)),
        fetch(`${BEEFY_BOOST_API}/${chain}`)
            .then((res) => res.json())
            .then((res) => [
                (res as ApiBoost[]).filter((g) => g.chain === chain).filter((g) => g.version !== 2),
                (res as ApiBoost[]).filter((g) => g.chain === chain).filter((g) => g.version === 2),
            ]),
    ]);

    const clmManagerAddresses = new Set(cowVaultsData.map((v) => v.earnedTokenAddress.toLocaleLowerCase()));
    const boostPerUnderlyingAddress = R.groupBy(boostData, (b) => b.tokenAddress?.toLocaleLowerCase());
    const vaultRewardPoolDataPerVaultAddress = R.groupBy(vaultRewardPoolData, (v) =>
        v.tokenAddress.toLocaleLowerCase()
    );
    const clmRewardPoolDataPerClmAddress = R.groupBy(clmRewardPoolData, (c) => c.tokenAddress.toLocaleLowerCase());

    const clmVaultConfigs = cowVaultsData.map((vault): BeefyVault => {
        const undelying_lp_address = vault.tokenAddress.toLocaleLowerCase() as Hex;
        const vault_address = vault.earnedTokenAddress.toLocaleLowerCase() as Hex;

        let protocol_type: BeefyProtocolType | undefined =
            vault.type === 'cowcentrated' ? 'beefy_clm' : protocol_map[vault.platformId];
        if (!protocol_type) {
            const mappedProtocolType = platformIdToProtocolType[vault.platformId];
            if (mappedProtocolType) {
                protocol_type = mappedProtocolType;
            }
        }
        if (protocol_type === 'beefy_clm_vault') {
            throw new Error('Invalid protocol');
        }

        const reward_pools = clmRewardPoolDataPerClmAddress[vault_address] ?? [];

        const boosts = boostPerUnderlyingAddress[vault_address] ?? [];
        const underlyingPlatform = vault.tokenProviderId ?? null;

        return {
            id: vault.id,
            vault_address,
            chain: vault.chain,
            vault_token_symbol: vault.earnedToken,
            protocol_type,
            platformId: vault.platformId,
            status: vault.status,
            strategy_address: vault.strategy.toLocaleLowerCase() as Hex,
            undelying_lp_address,
            underlyingPlatform,
            reward_pools: reward_pools.map((pool) => ({
                id: pool.id,
                clm_address: pool.tokenAddress.toLocaleLowerCase() as Hex,
                reward_pool_address: pool.earnContractAddress.toLocaleLowerCase() as Hex,
            })),
            boosts: boosts.map((boost) => ({
                id: boost.id,
                boost_address: boost.earnedTokenAddress.toLocaleLowerCase() as Hex,
                underlying_address: boost.tokenAddress.toLocaleLowerCase() as Hex,
            })),
            pointStructureIds: vault.pointStructureIds ?? [],
        };
    });

    const mooVaultCofigs = mooVaultsData
        .filter((vault) => {
            const dropEol = ['aave-matic-eol'];
            return !dropEol.includes(vault.id);
        })
        .map((vault): BeefyVault => {
            let underlying_lp_address = vault.tokenAddress?.toLocaleLowerCase() as Hex | undefined;
            const vault_address = vault.earnedTokenAddress.toLocaleLowerCase() as Hex;

            if (!underlying_lp_address && (isNativeToken(chain, vault.token) || isNativeToken(chain, vault.name))) {
                const wnative = getWNativeToken(chain);
                underlying_lp_address = wnative.address as Hex;
            }

            if (!underlying_lp_address) {
                throw new Error(`Missing "tokenAddress" field for vault ${vault.id}.`);
            }

            let protocol_type: BeefyProtocolType | undefined = clmManagerAddresses.has(underlying_lp_address)
                ? 'beefy_clm_vault'
                : protocol_map[vault.platformId];

            if (!protocol_type) {
                const mappedProtocolType = platformIdToProtocolType[vault.platformId];
                if (mappedProtocolType) {
                    protocol_type = mappedProtocolType;
                }
            }

            const additionalConfig =
                protocol_type === 'beefy_clm_vault'
                    ? {
                          protocol_type,
                          platformId: vault.platformId,
                          beefy_clm_manager: clmVaultConfigs.find(
                              (v) => v.vault_address.toLowerCase() === underlying_lp_address.toLowerCase()
                          ) as BeefyVault,
                      }
                    : { protocol_type, platformId: vault.platformId };
            const reward_pools = vaultRewardPoolDataPerVaultAddress[vault_address] ?? [];
            const boosts = boostPerUnderlyingAddress[vault_address] ?? [];

            const underlyingPlatform = vault.platformId ?? null;

            return {
                id: vault.id,
                vault_address,
                chain: vault.chain,
                vault_token_symbol: vault.earnedToken,
                ...additionalConfig,
                underlyingPlatform,
                strategy_address: vault.strategy?.toLocaleLowerCase() as Hex,
                undelying_lp_address: underlying_lp_address,
                status: vault.status,
                reward_pools: reward_pools.map((pool) => ({
                    id: pool.id,
                    clm_address: pool.tokenAddress.toLocaleLowerCase() as Hex,
                    reward_pool_address: pool.earnContractAddress.toLocaleLowerCase() as Hex,
                })),
                boosts: boosts.map((boost) => ({
                    id: boost.id,
                    boost_address: boost.earnedTokenAddress.toLocaleLowerCase() as Hex,
                    underlying_address: boost.tokenAddress.toLocaleLowerCase() as Hex,
                })),
                pointStructureIds: vault.pointStructureIds ?? [],
            };
        });

    const allConfigs = clmVaultConfigs.concat(mooVaultCofigs);
    return allConfigs;
};
