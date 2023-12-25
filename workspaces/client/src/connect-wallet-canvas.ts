import { ConnectTelegramWalletButton, ConnectTelegramWalletParams } from "../../phaser-ton";

export class ConnectWalletCanvasScene extends Phaser.Scene {
    public static sceneKey = 'ConnectWalletCanvasScene';
    button!: ConnectTelegramWalletButton;

    constructor(private params: ConnectTelegramWalletParams) {
        super({ key: ConnectWalletCanvasScene.sceneKey, active: false });
    }

    create() {
        this.button = new ConnectTelegramWalletButton(
            this,
            0,
            0,
            this.params
        );
    }

    toCenter() {
        this.button.setPosition(
            this.game.scale.displaySize.width * 0.5 - this.button.width * 0.5,
            this.game.scale.displaySize.height * 0.5 - this.button.height * 0.5
        );
    }

    toRight() {
        this.button.setPosition(
            this.game.scale.displaySize.width - this.button.width - 16,
            16
        );
    }
}