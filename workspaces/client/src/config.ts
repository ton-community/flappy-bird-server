type Url = `${string}://${string}`
type Network = 'testnet' | 'mainnet'

export type BackendConfig =
    {
        ok: false
    } |
    {
        ok: true,
        config: {
            network: Network,
            tokenMinter: string,
            tokenRecipient: string,
            achievementCollection: Record<string, string>,
        }
    }


export interface Config {
    ENDPOINT: string;
    APP_URL: Url;
    APP_MANIFEST_URL: string;
    NETWORK: Network;
    TOKEN_MASTER: string;
    TOKEN_RECIPIENT: string;
}

export async function loadConfig(): Promise<Config> {
    if (process.env.API_URL == null) {
        throw new Error('API_URL is not set.');
    }
    if (process.env.MINI_APP_URL == null) {
        throw new Error('MINI_APP_URL is not set.');
    }

    const apiUrl = process.env.API_URL;
    const miniAppUrl = process.env.MINI_APP_URL;

    const configRequest = await fetch(apiUrl + '/config');
    const configResponse: BackendConfig = await configRequest.json();
    
    if (!configResponse.ok) {
        throw new Error('Failed to load config.');
    }

    return {
        ENDPOINT: apiUrl,
        APP_URL: miniAppUrl as Url,
        APP_MANIFEST_URL: 'https://raw.githubusercontent.com/ton-defi-org/tonconnect-manifest-temp/main/tonconnect-manifest.json',
        NETWORK: configResponse.config.network,
        TOKEN_MASTER: configResponse.config.tokenMinter,
        TOKEN_RECIPIENT: configResponse.config.tokenRecipient,
    }
}