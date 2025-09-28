import { ClmStrategyFactory } from 'generated';

ClmStrategyFactory.ClmStrategyCreated.contractRegister(async ({ event, context }) => {
    const proxyAddress = event.params.proxy.toString().toLowerCase();

    context.log.info('Strategy detected, ignoring', { proxyAddress });
});
