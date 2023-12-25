# Use the official Node.js image as the base image
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Environment will be passed by docker-compose.yml
RUN echo -e "" > .env

# Install dependencies
COPY package*.json ./
COPY workspaces/client/package*.json workspaces/client/
RUN npm ci

# Copy the application source code
COPY tsconfig.json ./
COPY workspaces/client workspaces/client
