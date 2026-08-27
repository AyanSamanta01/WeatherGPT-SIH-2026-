# -------------------------------------------------------------
# WeatherGPT Backend Dockerfile (Node.js 20 Alpine)
# -------------------------------------------------------------
FROM node:20-alpine AS base

WORKDIR /app

# Install OpenSSL for Prisma client compatibility
RUN apk add --no-cache openssl curl

# Copy package manifests
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma Client
RUN npm install
RUN npx prisma generate

# Copy source files
COPY . .

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/weather/current?city=Kolkata || exit 1

CMD ["node", "server.js"]
