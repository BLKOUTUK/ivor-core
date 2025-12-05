# ivor-core Dockerfile for Coolify
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Expose port
EXPOSE 3001

# Run with tsx (TypeScript execution)
CMD ["npx", "tsx", "src/server.ts"]
