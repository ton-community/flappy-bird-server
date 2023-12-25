import TonConnect, { TonConnectOptions } from "@tonconnect/sdk";

let connector: TonConnect | null = null;
export function getConnector(options?: TonConnectOptions): TonConnect {
    if (connector === null) {
        connector = new TonConnect(options);
    }

    return connector;
}