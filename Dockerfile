# 1. Base Image
FROM node:20-alpine AS base
WORKDIR /app

# 2. Installer Stage: Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json ./
RUN npm install --only=production

# 3. Builder stage: Build the Next.js application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 4. Runner stage: Create the final, small production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Next.js standalone output automatically sets the PORT and HOSTNAME when running server.js

# Copy the standalone output from the builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose port 3000
EXPOSE 3000

# Command to run the app
CMD ["node", "server.js"]
