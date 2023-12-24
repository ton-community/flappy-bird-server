#!/bin/bash

# Function to ask for user confirmation
ask_for_confirmation() {
    local prompt=$1
    local response=""

    while true; do
        read -p "$prompt [y/n]: " response

        if [[ $response =~ ^([yY][eE][sS]|[yY])$ ]]; then
            return 0
        elif [[ $response =~ ^([nN][oO]|[nN])$ ]]; then
            return 1
        else
            echo "Invalid response. Please enter y or n." >&2
        fi
    done
}

# Function to read and validate user input
read_input_and_validate() {
    local prompt=$1
    local default=$2
    local validation_func=$3
    local valid=false
    local input=""

    # While input is invalid, keep asking for input
    while [[ $valid == false ]]; do
        read -p "$prompt " input

        # Trim leading and trailing spaces
        input=$(echo "$input" | xargs)

        # If input is empty, use default value
        if [[ -z $input ]]; then
            input=$default
        fi

        # Validate input
        if $validation_func "$input"; then
            valid=true
        fi
    done

    echo "$input"
}

# Function to validate NETWORK
validate_network() {
    if [[ $1 != "mainnet" && $1 != "testnet" ]]; then
        echo "Invalid NETWORK. It should be either mainnet or testnet." >&2
        return 1
    fi
    return 0
}

# Function to validate MNEMONIC
validate_mnemonic() {
    if [[ $(echo $1 | wc -w) -ne 24 ]]; then
        echo "Invalid MNEMONIC. It should be 24 words separated by spaces." >&2
        return 1
    fi
    return 0
}

# Function to validate Pinata API KEY (20 characters long)
validate_pinata_api_key() {
    if [[ ! $1 =~ ^[a-zA-Z0-9]+$ ]]; then
        echo "Invalid PINATA_API_KEY. It should be 20 characters long." >&2
        echo "Please visit https://app.pinata.cloud/developers/api-keys to get your API keys." >&2
        return 1
    fi
    return 0
}

# Function to validate Pinata SECRET KEY (64 characters long)
validate_pinata_secret() {
    if [[ ! $1 =~ ^[a-zA-Z0-9]+$ ]]; then
        echo "Invalid PINATA_SECRET. It should be 64 characters long." >&2
        echo "Please visit https://app.pinata.cloud/developers/api-keys to get your API keys." >&2
        return 1
    fi
    return 0
}

# Function to validate Telegram Bot Token
validate_telegram_bot_token() {
    if [[ ! $1 =~ ^[0-9]+:[a-zA-Z0-9_-]+$ ]]; then
        echo "Invalid TELEGRAM_BOT_TOKEN. It should be in the format 1234567890:ABCdefGHIjklMNoPQRsTUVwxyZ." >&2
        echo "Please visit https://core.telegram.org/bots#how-do-i-create-a-bot to get your API keys." >&2
        return 1
    fi
    return 0
}

validate_env_mode() {
    if [[ $1 != "development" && $1 != "production" ]]; then
        echo "Enter either development or production." >&2
        return 1
    fi
    return 0
}

validate_telegram_url() {
    if [[ ! $1 =~ ^https://t.me/.+/.+$ ]]; then
        echo "Invalid Telegram link. It should start from https://t.me." >&2
        return 1
    fi
    return 0
}

# Function to validate non-empty input
validate_non_empty() {
    if [[ -z $1 ]]; then
        echo "Input cannot be empty." >&2
        return 1
    fi
    return 0
}

# Function to initialize .env file
initialize_env_file() {
    local NODE_ENV="development"
    local NETWORK="testnet"
    local MNEMONIC=$(node_modules/.bin/ts-node ./scripts/generate-mnemonic.ts)
    local CORS_ENABLED="false"
    local CORS_ORIGIN="*"
    local NGROK_ENABLED="false"
    local NGROK_AUTHTOKEN=""
    local NGROK_DOMAIN=""
    local API_URL="http://localhost:4000/api"

    local TELEGRAM_BOT_TOKEN=$(read_input_and_validate "Enter TELEGRAM_BOT_TOKEN (e.g. 1234567890:ABCdefGHIjklMNoPQRsTUVwxyZ):" "" validate_telegram_bot_token)
    local MINI_APP_URL=$(read_input_and_validate "Enter MINI_APP_URL (e.g. https://t.me/mybot/myapp):" "" validate_telegram_url)
    NGROK_DOMAIN=$(read_input_and_validate "Enter APP_URL. Use the same URL you sent to BotFather (for development input Ngrok domain, check out https://dashboard.ngrok.com/cloud-edge/domains):" "" validate_non_empty)
    NGROK_DOMAIN=$(echo $NGROK_DOMAIN | sed 's~http[s]*://~~')
    if [[ $NGROK_DOMAIN == *ngrok-free.app ]]; then
        NGROK_ENABLED="true"
        NGROK_AUTHTOKEN=$(read_input_and_validate "Enter NGROK_AUTHTOKEN (e.g. 0A1B2C3D4E5F6G7H8I9J0K1L2M3_4N5O6P7Q8R9S0T1U2V3W4):" "" validate_non_empty)
    fi

    CORS_ENABLED="true"
    CORS_ORIGIN=https://$NGROK_DOMAIN

    API_URL=$(read_input_and_validate "Enter API_URL. If you use Ngrok continue with the default value. Otherwise specify dedicated backend URL: [$API_URL]:" "$API_URL" validate_non_empty)
    if [[ $API_URL != http* ]]; then
        API_URL="https://$API_URL"
    fi

    NETWORK=$(read_input_and_validate "Enter blockhain NETWORK (mainnet or testnet), default [$NETWORK]:" "$NETWORK" validate_network)
    NODE_ENV=$(read_input_and_validate "Enter NODE_ENV (development or production), default [$NODE_ENV]:" "$NODE_ENV" validate_env_mode)
    local PINATA_API_KEY=$(read_input_and_validate "Please enter your PINATA_API_KEY (20 characters long):" "" validate_pinata_api_key)
    local PINATA_SECRET=$(read_input_and_validate "Please enter your PINATA_SECRET (64 characters long):" "" validate_pinata_secret)
    
    MNEMONIC=$(read_input_and_validate "Enter MNEMONIC (24 words separated by spaces) or press Enter to use the generated [hidden]:" "$MNEMONIC" validate_mnemonic)

    # Creating the .env file
    cat << EOF > .env
NODE_ENV=$NODE_ENV

# Client Configuration
API_URL=$API_URL
MINI_APP_URL=$MINI_APP_URL

# Web Server Configuration
CORS_ENABLED=$CORS_ENABLED
CORS_ORIGIN=$CORS_ORIGIN
NGROK_ENABLED=$NGROK_ENABLED
NGROK_AUTHTOKEN=$NGROK_AUTHTOKEN
NGROK_DOMAIN=$NGROK_DOMAIN

# Network Configuration
NETWORK=$NETWORK

# Your MNEMONIC
MNEMONIC="$MNEMONIC"

# Pinata API Keys
PINATA_API_KEY=$PINATA_API_KEY
PINATA_SECRET=$PINATA_SECRET

# Telegram Bot Token
TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN

# Jetton
JETTON_ADDRESS=

# SBT Collection
FIRST_TIME_SBT_COLLECTION_ADDRESS=
FIVE_TIMES_SBT_COLLECTION_ADDRESS=
EOF

    echo ".env file successfully created."
}

# Function to deploy wallet contract
deploy_wallet_contract() {
    echo "Deploying wallet contract..."
    if ! node_modules/.bin/ts-node ./scripts/deploy-wallet.ts; then
        echo "Failed to deploy wallet contract." >&2
        exit 1
    fi
}

# Running npm install with frozen lockfile
echo "Running npm install..."
npm install

# Check if .env file already exists
if [ -f ".env" ]; then
    if ask_for_confirmation ".env file already exists. Do you want to overwrite it?"; then
        initialize_env_file
    else
        echo "Skipping .env file initialization." >&2
    fi
else
    initialize_env_file
fi

# Initialize database
if [ ! -f "./workspaces/server/db.sqlite" ]; then
    echo "Initializing database..."
    npm run typeorm:run-migrations --workspace=server
fi

# Deploying wallet contract (if no, write note to deploy it later and exit)
if [[ $(node_modules/.bin/ts-node ./scripts/get-wallet-state.ts | tail -n 1) != "active" ]]; then
  if ask_for_confirmation "Do you want to deploy the wallet contract now?"; then
      deploy_wallet_contract
  else
      echo "Please restart the ./setup.sh script to deploy the wallet contract later." >&2
      exit 1
  fi
fi

# Load all variables from .env file
set -o allexport
source .env
set +o allexport

# Check if jetton address is not set in .env file
if [[ -z $JETTON_ADDRESS ]]; then
    if ask_for_confirmation "JETTON_ADDRESS is not set in .env file. Do you want to deploy it now?"; then
        # Deploy jetton address from wallet contract
        echo "Deploying jetton address from wallet contract..."
        JETTON_ADDRESS=$(node_modules/.bin/ts-node ./scripts/deploy-jetton.ts | tail -n 1)

        # Check if jetton address is empty
        if [[ -z $JETTON_ADDRESS ]]; then
            echo "Failed to get jetton address from wallet contract." >&2
            exit 1
        fi

        # Update .env file
        echo "Updating .env file..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i "" "s/^JETTON_ADDRESS=.*/JETTON_ADDRESS=\"$JETTON_ADDRESS\"/" .env
        else
            sed -i "s/^JETTON_ADDRESS=.*/JETTON_ADDRESS=\"$JETTON_ADDRESS\"/" .env
        fi
    else
        echo "Please set JETTON_ADDRESS in .env file and run this script again." >&2
        exit 1
    fi
fi

# Print out the JETTON_ADDRESS
echo "JETTON_ADDRESS is set to $JETTON_ADDRESS"

# Check if FIRST_TIME_SBT_COLLECTION_ADDRESS is not set in .env file
if [[ -z $FIRST_TIME_SBT_COLLECTION_ADDRESS ]]; then
    if ask_for_confirmation "FIRST_TIME_SBT_COLLECTION_ADDRESS is not set in .env file. Do you want to deploy it now?"; then
        # Deploy first time sbt collection address from wallet contract
        echo "Getting first time sbt collection address from wallet contract..."
        FIRST_TIME_SBT_COLLECTION_ADDRESS=$(node_modules/.bin/ts-node ./scripts/deploy-sbt-collection.ts first-time | tail -n 1)

        # Check if first time sbt collection address is empty
        if [[ -z $FIRST_TIME_SBT_COLLECTION_ADDRESS ]]; then
            echo "Failed to get first time sbt collection address from wallet contract." >&2
            exit 1
        fi

        # Update .env file
        echo "Updating .env file..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i "" "s/^FIRST_TIME_SBT_COLLECTION_ADDRESS=.*/FIRST_TIME_SBT_COLLECTION_ADDRESS=\"$FIRST_TIME_SBT_COLLECTION_ADDRESS\"/" .env
        else
            sed -i "s/^FIRST_TIME_SBT_COLLECTION_ADDRESS=.*/FIRST_TIME_SBT_COLLECTION_ADDRESS=\"$FIRST_TIME_SBT_COLLECTION_ADDRESS\"/" .env
        fi
    else
        echo "Please set FIRST_TIME_SBT_COLLECTION_ADDRESS in .env file and run this script again." >&2
        exit 1
    fi
fi

# Print out the FIRST_TIME_SBT_COLLECTION_ADDRESS
echo "FIRST_TIME_SBT_COLLECTION_ADDRESS is set to $FIRST_TIME_SBT_COLLECTION_ADDRESS"

# Check if FIVE_TIMES_SBT_COLLECTION_ADDRESS is not set in .env file
if [[ -z $FIVE_TIMES_SBT_COLLECTION_ADDRESS ]]; then
    if ask_for_confirmation "FIVE_TIMES_SBT_COLLECTION_ADDRESS is not set in .env file. Do you want to deploy it now?"; then
        # Deploy five times sbt collection address from wallet contract
        echo "Getting five times sbt collection address from wallet contract..."
        FIVE_TIMES_SBT_COLLECTION_ADDRESS=$(node_modules/.bin/ts-node ./scripts/deploy-sbt-collection.ts five-times | tail -n 1)

        # Check if five times sbt collection address is empty
        if [[ -z $FIVE_TIMES_SBT_COLLECTION_ADDRESS ]]; then
            echo "Failed to get five times sbt collection address from wallet contract." >&2
            exit 1
        fi

        # Update .env file
        echo "Updating .env file..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i "" "s/^FIVE_TIMES_SBT_COLLECTION_ADDRESS=.*/FIVE_TIMES_SBT_COLLECTION_ADDRESS=\"$FIVE_TIMES_SBT_COLLECTION_ADDRESS\"/" .env
        else
            sed -i "s/^FIVE_TIMES_SBT_COLLECTION_ADDRESS=.*/FIVE_TIMES_SBT_COLLECTION_ADDRESS=\"$FIVE_TIMES_SBT_COLLECTION_ADDRESS\"/" .env
        fi
    else
        echo "Please set FIVE_TIMES_SBT_COLLECTION_ADDRESS in .env file and run this script again." >&2
        exit 1
    fi
fi

# Print out the FIVE_TIMES_SBT_COLLECTION_ADDRESS
echo "FIVE_TIMES_SBT_COLLECTION_ADDRESS is set to $FIVE_TIMES_SBT_COLLECTION_ADDRESS"

# Finished
echo "Setup finished successfully. Please run the following command to start the app:"
echo ""
echo "docker-compose -f ./docker-compose.dev.yaml up"
