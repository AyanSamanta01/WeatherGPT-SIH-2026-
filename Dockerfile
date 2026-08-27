# Multi-stage production build for full-stack WeatherGPT
# Builds React+Vite frontend and serves it via Express Backend + Prisma

FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl curl

# Install backend dependencies & generate Prisma client
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma/
WORKDIR /app/backend
RUN npm install
RUN npx prisma generate

# Copy backend source code & built frontend assets
COPY backend/ /app/backend/
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/weather/current?city=Mumbai || exit 1

CMD ["node", "server.js"]
