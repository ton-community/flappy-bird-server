import { mnemonicNew } from '@ton/crypto';

async function generateMnemonic() {
    const mnemonic = await mnemonicNew();
    console.log(mnemonic.join(' '));
}

generateMnemonic();
