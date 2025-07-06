# Dockerfile for Next.js Application

# Stage 1: Install dependencies
# Use a specific version of Node.js for consistency. Alpine is a lightweight Linux distribution.
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package.json and lock file to leverage Docker layer caching.
COPY package.json package-lock.json* ./
# Install dependencies.
RUN npm install

# Stage 2: Build the application
# Use the same Node.js version.
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from the 'deps' stage.
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the application source code.
COPY . .

# Set build-time arguments for environment variables if needed.
# Note: For security, runtime secrets should come from the .env file in docker-compose, not here.

# Build the Next.js application.
# This will leverage the "output: 'standalone'" mode in next.config.ts for a minimal production server.
RUN npm run build

# Stage 3: Production image
# Use the same lightweight Node.js Alpine image.
FROM node:20-alpine AS runner
WORKDIR /app

# Set the environment to production.
ENV NODE_ENV=production

# Copy the standalone output from the builder stage.
# This includes only the necessary files to run the app in production.
COPY --from=builder /app/.next/standalone ./

# Copy the public and static assets.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Expose the port the app runs on.
EXPOSE 3000

# The command to start the Next.js server.
# The standalone output creates a minimal server.js file.
CMD ["node", "server.js"]
