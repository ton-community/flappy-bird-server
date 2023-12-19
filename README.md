# flappy-bird-server

Also see [ARCHITECTURE.md](/ARCHITECTURE.md)

## Setting up

### Preparation
1. Register create and setup your [Ngrok account](https://dashboard.ngrok.com/get-started/your-authtoken). After getting your auth token, [create a domain](https://dashboard.ngrok.com/cloud-edge/domains). Ngrok is used to expose your local server to the internet. It's necessary to make your app accessible to Telegram via real domain name with SSL enabled. For example, your `http://localhost:3000` will be available at `https://your-domain.ngrok.io`
1. Create and setup your [Pinata account](https://app.pinata.cloud/developers/api-keys). Pinata is used to store your game assets, like achievement badges. You can select admin privileges for your API key. Save your `API key` and `API secret`. You can not to reveal `API secret` again.
1. Run `./setup.sh`. If you use Windows you can run in from `Git Bash CLI` which comes with `Git` or you can run the project using [Windows Subsystem for Linux (WSL)](https://learn.microsoft.com/en-us/windows/wsl/install). Follow the instructions

Conceptually, the process can be separated in two parts: the general part and web 3 part.

General part will setup database settings, ngrok & pinata services, Telegram bot, etc.

Web 3 part will setup your wallet, top up the wallet with test coins and jetton and collections for the achievements.

### Running manually

Run `npm start`.

### Running using Docker

Ensure you have [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed. Run Docker.

Run `docker-compose -f ./docker-compose.dev.yaml up` to start the app.

## Migrations

* Create a new migration after changing entities `npm run typeorm:generate-migration --name=[NAME]`
* Create an empty migration (for seeding, etc.) `npm run typeorm:create-migration --name=[NAME]`
* Run migrations `npm run typeorm:run-migrations`
