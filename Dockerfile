# Use the official Node.js image as the base image
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Install ts-node and ts-node-dev for TypeScript execution and hot reloading
RUN npm install -g ts-node ts-node-dev

# Copy package.json, package-lock.json and yarn.lock files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the application source code
COPY . .

# Expose the port the app runs on
EXPOSE 3000
