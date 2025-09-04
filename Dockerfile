FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and lock file first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the code
COPY . .

# Build the frontend
RUN npm run build:prod

# Expose the port Railway will map
EXPOSE 4100

# Start in production mode
CMD ["npx", "serve", "-s", "dist", "-l", "4100"]
