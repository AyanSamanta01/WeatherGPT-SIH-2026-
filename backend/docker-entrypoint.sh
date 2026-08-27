#!/bin/sh
set -e

echo "========================================================"
echo "🚀 Starting WeatherGPT Backend Docker Container..."
echo "========================================================"

# Check if DATABASE_URL is set and run migrations
if [ -n "$DATABASE_URL" ]; then
  echo "📡 DATABASE_URL detected. Synchronizing Prisma schema with database..."
  
  # Retry loop to wait for PostgreSQL connection if needed
  max_retries=10
  count=0
  until npx prisma db push --skip-generate || [ $count -ge $max_retries ]; do
    count=$((count + 1))
    echo "⏳ Waiting for PostgreSQL to be fully available (attempt $count/$max_retries)..."
    sleep 2
  done

  if [ $count -ge $max_retries ]; then
    echo "⚠️ Warning: Database schema sync timed out. Proceeding in standalone/fallback mode."
  else
    echo "✅ Database schema synchronized successfully."
    
    # Optionally seed initial data if SEED_DATABASE is true
    if [ "$SEED_DATABASE" = "true" ]; then
      echo "🌱 Seeding initial demo user, alerts, and locations..."
      node prisma/seed.js || echo "⚠️ Database seed skipped or already seeded."
    fi
  fi
else
  echo "ℹ️ No DATABASE_URL provided. Running backend in standalone mode."
fi

echo "✨ Launching WeatherGPT Express API Gateway..."
exec "$@"
