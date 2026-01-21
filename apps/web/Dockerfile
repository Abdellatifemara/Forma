# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/types/package*.json ./packages/types/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm ci --workspace=packages/types --workspace=packages/shared --workspace=apps/web

# Copy source code
COPY packages/types ./packages/types
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

# Build packages
RUN npm run build --workspace=packages/types
RUN npm run build --workspace=packages/shared

# Build the web app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace=apps/web

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy necessary files
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

# Set user
USER nextjs

# Expose port
EXPOSE 3000

# Set port
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the app
CMD ["node", "apps/web/server.js"]
