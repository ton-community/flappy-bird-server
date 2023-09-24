# flappy-bird-server

Also see [ARCHITECTURE.md](/ARCHITECTURE.md)

## Setting up your own

1. Get a server and point a domain to it
1. Create a mnemonic using [@ton/crpyto](https://github.com/ton-org/ton-crypto/blob/b4b74418226f5e37165d9869aae6629c3d86b0c8/src/mnemonic/mnemonic.ts#L154)
1. Setup postgres on your server
1. Get a [pinata](https://www.pinata.cloud/) API key
1. Create a telegram bot
1. Clone this repo on your server
1. Copy the [.env.example](/.env.example) file as `.env` and fill out the fields
1. Setup node, install the packages using `npm i` or similar
1. Change `synchronize` ([here](https://github.com/ton-community/flappy-bird-server/blob/f1cf55fb70dce521d5153b013c3ecc87c9d4e24c/src/data-source.ts#L15)) to `true` temporarily (to generate database schema)
1. Run `ts-node src/index.ts` until logs show that DB is setup, close the process and change `synchronize` back to `false`
1. Send some TON your wallet (address can be found out as `sdk.sender.address` using the `sdk` from [here](https://github.com/ton-community/flappy-bird-server/blob/f1cf55fb70dce521d5153b013c3ecc87c9d4e24c/src/index.ts#L155))
1. Create a jetton minter using GameFi SDK ([this method](https://github.com/ton-community/gamefi-sdk/blob/a6bb404df2d2091e456a43cbb591bece85da715e/src/sdk.ts#L52)) and one SBT collection for each achievement type ([this method](https://github.com/ton-community/gamefi-sdk/blob/a6bb404df2d2091e456a43cbb591bece85da715e/src/sdk.ts#L115))
1. Change [these addresses](https://github.com/ton-community/flappy-bird-server/blob/main/src/consts.ts) to match the ones created in the previous step
1. Clone [this repo](https://github.com/ton-community/flappy-bird-phaser)
1. Change [these consts](https://github.com/ton-community/flappy-bird-phaser/blob/c5943ef84f2f1bc4e2028b0bcd56c18d9aa4f4f4/src/index.ts#L9-L11) to match your server endpoint, your token collection address (may be different from the token sender, up to you), and your token minter address
1. Setup [CORS](https://github.com/ton-community/flappy-bird-server/blob/f1cf55fb70dce521d5153b013c3ecc87c9d4e24c/src/index.ts#L171) if necessary
1. Serve static content in any way you like
1. Setup the telegram web app and you're done!
