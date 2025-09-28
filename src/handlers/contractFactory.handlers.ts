import { ContractFactory } from 'generated';
import { isVaultBlacklisted } from '../lib/blacklist';

ContractFactory.ContractDeployed.contractRegister(async ({ event, context }) => {
    const contractAddress = event.params.proxy.toString().toLowerCase();
    if (isVaultBlacklisted(event.chainId, contractAddress)) return;

    // const rewardPoolName = event.params.rewardPoolName; // Property doesn't exist

    // Generic contract factory - determine type based on rewardPoolName or add as token
    // For now, we'll skip adding these until we can determine the specific type
    // context.addToken(contractAddress); // TODO: Determine contract type

    context.log.info('ContractDeployed', { contractAddress });
});
