import { join } from 'node:path';
import type { Hex } from 'viem';
import { isVaultBlacklisted, rawVaultBlacklist } from '../src/lib/blacklist';
import type { ChainId } from '../src/lib/chain';

async function main() {
    const text = await Bun.file(join(__dirname, '../config.yaml')).text();

    const addyRe = /0x[0-9a-fA-F]{40}/;
    let currentChainId = 0;

    const toUnblacklist: { chainId: ChainId; address: Hex }[] = [];

    for (const line of text.split('\n')) {
        if (line.includes('id:')) {
            currentChainId = parseInt(line.split(':')[1].trim(), 10);
        }

        if (addyRe.test(line)) {
            const address = line.match(addyRe)?.[0];
            if (isVaultBlacklisted(currentChainId as ChainId, address as Hex)) {
                toUnblacklist.push({ chainId: currentChainId as ChainId, address: address.toLowerCase() as Hex });
            }
        }
    }

    console.log(toUnblacklist);

    if (toUnblacklist.length === 0) {
        console.log('No addresses to unblacklist');
        return;
    }

    const newBlacklist = rawVaultBlacklist.filter(
        (entry) =>
            !toUnblacklist.some(
                (toUnblacklistEntry) =>
                    toUnblacklistEntry.chainId === entry.chainId && toUnblacklistEntry.address === entry.address
            )
    );

    for (const entry of newBlacklist) {
        console.log(`{ chainId: ${entry.chainId}, address: "${entry.address}" },`);
    }
}

main();
