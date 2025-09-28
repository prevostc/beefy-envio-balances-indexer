import { ClassicBoostFactory } from 'generated';

ClassicBoostFactory.BoostCreated.contractRegister(async ({ event, context }) => {
    const boostAddress = event.params.proxy.toString().toLowerCase();

    context.addClassicBoost(boostAddress);

    context.log.info('BoostDeployed', { boostAddress });
});

ClassicBoostFactory.BoostDeployed.contractRegister(async ({ event, context }) => {
    const boostAddress = event.params.boost.toString().toLowerCase();

    context.addClassicBoost(boostAddress);

    context.log.info('BoostDeployed', { boostAddress });
});
