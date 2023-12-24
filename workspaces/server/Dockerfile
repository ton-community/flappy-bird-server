# Use the official Node.js image as the base image
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Environment will be passed by docker-compose.yml
RUN echo -e "" > .env

# Install ts-node and ts-node-dev for TypeScript execution and hot reloading
RUN npm install -g ts-node ts-node-dev

# Install dependencies
COPY package*.json ./
COPY workspaces/server/package*.json workspaces/server/
RUN npm ci

# Copy the application source code
COPY tsconfig.json ./
COPY workspaces/server workspaces/server

# Run migrations
RUN npm run typeorm:run-migrations --workspace=server
