import { Erc4626AdapterFactory } from 'generated';

Erc4626AdapterFactory.Erc4626AdapterCreated.contractRegister(async ({ event, context }) => {
    const adapterAddress = event.params.proxy.toString().toLowerCase();

    context.addErc4626Adapter(adapterAddress);

    context.log.info('Erc4626AdapterCreated', { adapterAddress });
});
