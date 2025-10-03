import type { Hex } from 'viem';

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

export type ApiVault = {
    id: string;
    name: string;
    status: 'active' | 'eol';
    earnedTokenAddress: string;
    earnContractAddress: string;
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

export type ApiClmManager = {
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

export type ApiClmRewardPool = {
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

export type ApiGovVault = {
    id: string;
    status: 'active' | 'eol';
    version: number;
    chain: string;
    tokenAddress: string; // clm address
    earnContractAddress: string; // reward pool address
    earnedTokenAddresses: string[];
};

export type ApiBoost = {
    id: string;
    poolId: string;

    version: number;
    chain: string;
    status: 'active' | 'eol';

    tokenAddress: string; // underlying
    earnedTokenAddress: string; // reward token address
    earnContractAddress: string; // reward pool address
};

export const BEEFY_MOO_VAULT_API = 'https://api.beefy.finance/vaults';
export const BEEFY_COW_VAULT_API = 'https://api.beefy.finance/cow-vaults';
export const BEEFY_GOV_API = 'https://api.beefy.finance/gov-vaults';
export const BEEFY_BOOST_API = 'https://api.beefy.finance/boosts';
