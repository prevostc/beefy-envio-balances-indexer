import {
    CLMManagerFactory,
    ClassicBoostFactory,
    ClassicVaultFactory,
    ContractFactory,
    RewardPoolFactory,
} from 'generated';
import { getDetectClassicVaultOrStrategy } from './effects/factory.effects';
import { vaultBlacklist } from './lib/blacklist';

ClassicVaultFactory.VaultOrStrategyCreated.contractRegister(async ({ event, context }) => {
    const proxyAddress = event.params.proxy.toString().toLowerCase();
    if ((vaultBlacklist[event.chainId] ?? []).includes(proxyAddress)) {
        context.log.debug('Blacklisted proxy address', { proxyAddress });
        return;
    }

    const { isVault, isStrategy } = await getDetectClassicVaultOrStrategy({
        log: context.log,
        contractAddress: proxyAddress as `0x${string}`,
        chainId: event.chainId,
        blockNumber: event.block.number,
    });

    if (isVault) {
        context.addToken(proxyAddress);
        context.log.info('Vault detected, adding to context', { proxyAddress });
    } else if (isStrategy) {
        context.log.info('Strategy detected, ignoring', { proxyAddress });
    }
});

ClassicBoostFactory.BoostCreated.contractRegister(async ({ event, context }) => {
    const boostAddress = event.params.proxy.toString().toLowerCase();

    context.addToken(boostAddress);

    context.log.info('BoostDeployed', { boostAddress });
});

RewardPoolFactory.RewardPoolCreated.contractRegister(async ({ event, context }) => {
    const contractAddress = event.params.proxy.toString().toLowerCase();

    context.addToken(contractAddress);

    context.log.info('RewardPoolCreated', { contractAddress });
});

CLMManagerFactory.CLMManagerCreated.contractRegister(async ({ event, context }) => {
    const contractAddress = event.params.proxy.toString().toLowerCase();

    context.addToken(contractAddress);

    context.log.info('CLMManagerCreated', { contractAddress });
});

ContractFactory.ContractDeployed.contractRegister(async ({ event, context }) => {
    const contractAddress = event.params.proxy.toString().toLowerCase();

    context.addToken(contractAddress);

    context.log.info('ContractDeployed', { contractAddress });
});
