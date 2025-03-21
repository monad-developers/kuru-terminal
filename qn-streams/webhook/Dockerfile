FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files first (for better caching)
COPY package.json pnpm-lock.yaml ./

# Install pnpm and app dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript code
RUN pnpm build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["pnpm", "start"]
