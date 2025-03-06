FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY qn-stream-hook/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build || (echo "No build script found, assuming TypeScript is compiled at runtime" && npm install -g typescript && tsc --init && tsc || true)

# Expose the port the app runs on
EXPOSE 3000

WORKDIR /usr/src/app/qn-stream-hook

# Command to run the application
CMD ["npx", "ts-node", "index.ts"]
