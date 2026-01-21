# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/types/package*.json ./packages/types/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm ci --workspace=packages/types --workspace=packages/shared --workspace=apps/api

# Copy source code
COPY packages/types ./packages/types
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Build packages
RUN npm run build --workspace=packages/types
RUN npm run build --workspace=packages/shared

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build the API
RUN npm run build --workspace=apps/api

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install production dependencies only
RUN npm ci --workspace=apps/api --omit=dev

# Copy built files
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Set user
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start the app
CMD ["node", "apps/api/dist/main.js"]
