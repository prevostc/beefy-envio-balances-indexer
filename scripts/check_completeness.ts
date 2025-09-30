import { getAllBeefyConfigs } from './lib/getAllBeefyConfigs';

const main = async () => {
    const configs = await getAllBeefyConfigs('one');

    const allVaultAddresses = configs.map((config) => config.vault_address);

    console.log(allVaultAddresses);
};
main();
