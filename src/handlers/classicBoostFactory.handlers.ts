import { ClassicBoostFactory } from 'generated';
import { isVaultBlacklisted } from '../lib/blacklist';

ClassicBoostFactory.BoostCreated.contractRegister(async ({ event, context }) => {
    const boostAddress = event.params.proxy.toString().toLowerCase();
    if (isVaultBlacklisted(event.chainId, boostAddress)) return;

    context.addClassicBoost(boostAddress);

    context.log.info('BoostDeployed', { boostAddress });
});
