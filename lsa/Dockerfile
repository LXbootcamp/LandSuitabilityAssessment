# Use the official Node.js image as a base image
FROM node:20

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npx webpack --config webpack.config.js

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
