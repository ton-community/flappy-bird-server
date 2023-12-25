import { TonConnectUI } from "@tonconnect/ui";

export class ConnectWalletHtmlScene {
    connectDiv: HTMLDivElement = document.getElementById('connect') as HTMLDivElement;

    constructor(private tc: TonConnectUI) {}

    show() {
        this.connectDiv.style.display = 'flex';
        this.connectDiv.addEventListener('click', () => {
            this.tc.connectWallet();
        });
    }

    hide() {
        this.connectDiv.style.display = 'none';
    }
}