# Stage 1: Dependencies and Prisma Generation
FROM node:20-alpine AS builder

WORKDIR /app

# Install openssl required by Prisma on Alpine
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Generate Prisma client binary
RUN npx prisma generate

# Stage 2: Production Execution
FROM node:20-alpine AS runner

WORKDIR /app

# Install openssl for Prisma runtime
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=5000

# Copy application files and entrypoint with non-root node user ownership
COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma/
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node src ./src/
COPY --chown=node:node server.js ./server.js
COPY --chown=node:node docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

# Security: Run as non-root user
USER node

EXPOSE 5000

HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/ || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
