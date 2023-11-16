#!/bin/bash

# Function to ask for user confirmation
ask_for_confirmation() {
    local prompt=$1
    local response=""

    while true; do
        read -p "$prompt [Y/n]: " response

        if [[ $response =~ ^([yY][eE][sS]|[yY])$ ]]; then
            return 0
        elif [[ $response =~ ^([nN][oO]|[nN])$ ]]; then
            return 1
        else
            echo "Invalid response. Please enter Y or n." >&2
        fi
    done
}

# Function to install yarn
install_yarn() {
    echo "Installing yarn..."
    npm install -g yarn
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
    # Generating secrets for DB_USER and DB_PASSWORD
    local DB_USER=$(openssl rand -hex 12)
    local DB_PASSWORD=$(openssl rand -hex 16)
    local NETWORK="testnet"
    local MNEMONIC=$(ts-node ./scripts/generate-mnemonic.ts)
    local CORS_ENABLED="false"
    local CORS_ORIGIN="*"
    local NGROK_ENABLED="false"
    local NGROK_AUTHTOKEN=""
    local NGROK_DOMAIN=""

    # Reading user input with validation
    DB_USER=$(read_input_and_validate "Please enter your DB_USER or press Enter to use the generated [$DB_USER]:" "$DB_USER" validate_non_empty)
    DB_PASSWORD=$(read_input_and_validate "Please enter your DB_PASSWORD or press Enter to use the generated [hidden]:" "$DB_PASSWORD" validate_non_empty)

    if ask_for_confirmation "Do you want to enable CORS?"; then
        CORS_ENABLED="true"
        CORS_ORIGIN=$(read_input_and_validate "Please enter your CORS_ORIGIN (e.g. http://localhost:3000) or press Enter to use the default [*]:" "*" validate_non_empty)
    else
        CORS_ENABLED="false"
        CORS_ORIGIN="*"
    fi

    if ask_for_confirmation "Do you want to enable ngrok?"; then
        NGROK_ENABLED="true"
        NGROK_AUTHTOKEN=$(read_input_and_validate "Please enter your NGROK_AUTHTOKEN (e.g. 0A1B2C3D4E5F6G7H8I9J0K1L2M3_4N5O6P7Q8R9S0T1U2V3W4):" "" validate_non_empty)
        NGROK_DOMAIN=$(read_input_and_validate "Please enter your NGROK_DOMAIN (this requires registering in the https://dashboard.ngrok.com/cloud-edge/domains):" "" validate_non_empty)
    else
        NGROK_ENABLED="false"
        NGROK_AUTHTOKEN=""
        NGROK_DOMAIN=""
    fi

    NETWORK=$(read_input_and_validate "Please enter your NETWORK (mainnet or testnet) or press Enter to use the default [$NETWORK]:" "$NETWORK" validate_network)
    MNEMONIC=$(read_input_and_validate "Please enter your MNEMONIC (24 words separated by spaces) or press Enter to use the generated [hidden]:" "$MNEMONIC" validate_mnemonic)
    local PINATA_API_KEY=$(read_input_and_validate "Please enter your PINATA_API_KEY (20 characters long):" "" validate_pinata_api_key)
    local PINATA_SECRET=$(read_input_and_validate "Please enter your PINATA_SECRET (64 characters long):" "" validate_pinata_secret)
    local TELEGRAM_BOT_TOKEN=$(read_input_and_validate "Please enter your TELEGRAM_BOT_TOKEN (in the format 1234567890:ABCdefGHIjklMNoPQRsTUVwxyZ):" "" validate_telegram_bot_token)

    # Creating the .env file
    cat << EOF > .env
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=flappy-bird-db
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

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
    if ! ts-node ./scripts/deploy-wallet.ts; then
        echo "Failed to deploy wallet contract." >&2
        exit 1
    fi
}

# Check if yarn is installed
if ! command -v yarn &> /dev/null; then
  if ask_for_confirmation "yarn could not be found. Do you want to install yarn?"; then
    install_yarn
  else
    echo "Please install yarn and run this script again." >&2
    exit 1
  fi
fi

# Running yarn install with frozen lockfile
echo "Running yarn install..."
yarn install --frozen-lockfile

# Check if .env file already exists
if [ -f ".env" ]; then
    if ask_for_confirmation ".env file already exists. Do you want to overwrite it?"; then
        initialize_env_file
    else
        echo "Skipping .env file initialization." >&2
    fi
fi

# Deploying wallet contract (if no, write note to deploy it later and exit)
if [[ $(ts-node ./scripts/get-wallet-state.ts | tail -n 1) != "active" ]]; then
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
        JETTON_ADDRESS=$(ts-node ./scripts/deploy-jetton.ts | tail -n 1)

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
        FIRST_TIME_SBT_COLLECTION_ADDRESS=$(ts-node ./scripts/deploy-sbt-collection.ts first-time | tail -n 1)

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
        FIVE_TIMES_SBT_COLLECTION_ADDRESS=$(ts-node ./scripts/deploy-sbt-collection.ts five-times | tail -n 1)

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
