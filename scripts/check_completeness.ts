import { ChainId as AddressBookChainId, addressBook } from 'blockchain-addressbook';
import { sql } from 'bun';
import * as R from 'remeda';
import { getAllBeefyConfigs } from './lib/getAllBeefyConfigs';

process.env.DATABASE_URL = 'postgres://postgres:testing@localhost:5433/envio-dev';

const main = async () => {
    const reports: (Report & { networkId: number; chainId: string })[] = [];

    const excludedNetworks = ['emerald', 'fuse', 'heco', 'one', 'real', 'cronos', 'moonriver', 'canto'];
    const networks = R.keys(addressBook).filter((network) => !excludedNetworks.includes(network));

    const allDbClassicVaults = (await sql`select * from "ClassicVault"`) as {
        id: string;
        address: string;
        chainId: number;
    }[];
    const allDbClmVaults = (await sql`select * from "ClmManager"`) as {
        id: string;
        address: string;
        chainId: number;
    }[];
    const allDbBoosts = (await sql`select * from "ClassicBoost"`) as { id: string; address: string; chainId: number }[];
    const allDbRewardPools = (await sql`select * from "RewardPool"`) as {
        id: string;
        address: string;
        chainId: number;
    }[];

    const allTokens = (await sql`select * from "Token"`) as { id: string; address: string; chainId: number }[];

    for (const network of networks) {
        const networkId: number = AddressBookChainId[network];
        console.log({ network, networkId });

        const configs = await getAllBeefyConfigs(network);
        const classicVaults = R.pipe(
            configs,
            R.filter((config) => config.protocol_type !== 'beefy_clm'),
            R.map((config) => config.vault_address),
            R.unique()
        );
        const clmVaults = R.pipe(
            configs,
            R.filter((config) => config.protocol_type === 'beefy_clm'),
            R.map((config) => config.vault_address),
            R.unique()
        );
        const boosts = R.pipe(
            configs,
            R.flatMap((config) => config.boosts),
            R.map((boost) => boost.boost_address),
            R.unique()
        );
        const rewardPools = R.pipe(
            configs,
            R.flatMap((config) => config.reward_pools),
            R.map((pool) => pool.reward_pool_address),
            R.unique()
        );
        const allShareTokens = classicVaults.concat(clmVaults).concat(boosts).concat(rewardPools);
        // console.log({ classicVaults });
        // console.log({ clmVaults });
        // console.log({ boosts });
        // console.log({ rewardPools });

        const dbClassicVaults = R.pipe(
            allDbClassicVaults,
            R.filter((row) => row.chainId === networkId)
        );
        const dbClmVaults = R.pipe(
            allDbClmVaults,
            R.filter((row) => row.chainId === networkId)
        );
        const dbBoosts = R.pipe(
            allDbBoosts,
            R.filter((row) => row.chainId === networkId)
        );
        const dbRewardPools = R.pipe(
            allDbRewardPools,
            R.filter((row) => row.chainId === networkId)
        );
        const dbTokens = R.pipe(
            allTokens,
            R.filter((row) => row.chainId === networkId)
        );

        const addressKey = (address: string) => `${networkId}-${address.toLowerCase()}`;

        const _classicVaultReport = checkCompleteness({
            configs: classicVaults,
            dbRows: dbClassicVaults,
            configKey: addressKey,
            dbKey: (dbRow) => dbRow.id.toLowerCase(),
            ctx: 'classicVaults',
        });
        const _clmVaultReport = checkCompleteness({
            configs: clmVaults,
            dbRows: dbClmVaults,
            configKey: addressKey,
            dbKey: (dbRow) => dbRow.id.toLowerCase(),
            ctx: 'clmVaults',
        });
        const _boostReport = checkCompleteness({
            configs: boosts,
            dbRows: dbBoosts,
            configKey: addressKey,
            dbKey: (dbRow) => dbRow.id.toLowerCase(),
            ctx: 'boosts',
        });
        const _rewardPoolReport = checkCompleteness({
            configs: rewardPools,
            dbRows: dbRewardPools,
            configKey: addressKey,
            dbKey: (dbRow) => dbRow.id.toLowerCase(),
            ctx: 'rewardPools',
        });

        const tokenReport = checkCompleteness({
            configs: allShareTokens,
            dbRows: dbTokens,
            configKey: addressKey,
            dbKey: (dbRow) => dbRow.id.toLowerCase(),
            ctx: 'tokens',
        });
        // console.log({ dbClassicVaults });
        // console.log({ dbClmVaults });
        // console.log({ dbBoosts });
        // console.log({ dbRewardPools });

        // console.log({ classicVaultReport, clmVaultReport, boostReport, rewardPoolReport, tokenReport });
        reports.push({ networkId, chainId: network, ...tokenReport });
    }

    console.log(
        R.pipe(
            reports,
            R.map((report) => ({
                ctx: report.ctx,
                networkId: report.networkId,
                chainId: report.chainId,

                // missingConfigKeys: report.missingConfigKeys,
                missingDbKeys: report.missingDbKeys,
            }))
        )
    );

    // const configs = await getAllBeefyConfigs('one');

    // const allVaultAddresses = configs.map((config) => config.vault_address);

    // console.log(allVaultAddresses);
};

type Report = {
    ctx: string;
    missingConfigKeys: string[];
    missingDbKeys: string[];
};

function checkCompleteness<TConfig, TDb>({
    configs,
    dbRows,
    configKey,
    dbKey,
    ctx,
}: {
    configs: TConfig[];
    configKey: (config: TConfig) => string;
    dbRows: TDb[];
    dbKey: (dbRow: TDb) => string;
    ctx: string;
}): Report {
    const configKeys = R.pipe(configs, R.map(configKey), R.unique());
    const dbKeys = R.pipe(dbRows, R.map(dbKey), R.unique());

    const missingDbKeys = R.difference(configKeys, dbKeys);
    const missingConfigKeys = R.difference(dbKeys, configKeys);

    return {
        ctx,
        missingConfigKeys,
        missingDbKeys,
    };
}

main();
