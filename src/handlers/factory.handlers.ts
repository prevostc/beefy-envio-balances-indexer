import {
    ClassicBoostFactory,
    ClassicVaultFactory,
    ClmManagerFactory,
    ContractFactory,
    RewardPoolFactory,
} from 'generated';
import { detectClassicVaultOrStrategy } from '../effects/classicVaultFactory.effects';
import { isVaultBlacklisted } from '../lib/blacklist';

ClassicVaultFactory.VaultOrStrategyCreated.contractRegister(async ({ event, context }) => {
    const proxyAddress = event.params.proxy.toString().toLowerCase();
    if (isVaultBlacklisted(event.chainId, proxyAddress)) return;

    const transactionInput = event.transaction.input as `0x${string}`;

    const { isVault, isStrategy } = await detectClassicVaultOrStrategy({
        log: context.log,
        contractAddress: proxyAddress as `0x${string}`,
        chainId: event.chainId,
        blockNumber: event.block.number,
        transactionInput,
    });

    if (isVault) {
        context.addClassicVault(proxyAddress);
        context.log.info('Vault detected, adding to context', { proxyAddress });
    } else if (isStrategy) {
        context.log.info('Strategy detected, ignoring', { proxyAddress });
    }
});

ClassicBoostFactory.BoostCreated.contractRegister(async ({ event, context }) => {
    const boostAddress = event.params.proxy.toString().toLowerCase();
    if (isVaultBlacklisted(event.chainId, boostAddress)) return;

    context.addClassicBoost(boostAddress);

    context.log.info('BoostDeployed', { boostAddress });
});

RewardPoolFactory.RewardPoolCreated.contractRegister(async ({ event, context }) => {
    const contractAddress = event.params.proxy.toString().toLowerCase();
    if (isVaultBlacklisted(event.chainId, contractAddress)) return;

    context.addRewardPool(contractAddress);

    context.log.info('RewardPoolCreated', { contractAddress });
});

ClmManagerFactory.ClmManagerCreated.contractRegister(async ({ event, context }) => {
    const contractAddress = event.params.proxy.toString().toLowerCase();
    if (isVaultBlacklisted(event.chainId, contractAddress)) return;

    context.addClmManager(contractAddress);

    context.log.info('ClmManagerCreated', { contractAddress });
});

ContractFactory.ContractDeployed.contractRegister(async ({ event, context }) => {
    const contractAddress = event.params.proxy.toString().toLowerCase();
    if (isVaultBlacklisted(event.chainId, contractAddress)) return;

    // const rewardPoolName = event.params.rewardPoolName; // Property doesn't exist

    // Generic contract factory - determine type based on rewardPoolName or add as token
    // For now, we'll skip adding these until we can determine the specific type
    // context.addToken(contractAddress); // TODO: Determine contract type

    context.log.info('ContractDeployed', { contractAddress });
});
