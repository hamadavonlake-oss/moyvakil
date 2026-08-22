#!/bin/bash
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Cleaning fabricated data..."
npx prisma db execute --file prisma/cleanup.sql --schema prisma/schema.prisma 2>&1 || echo "WARNING: Cleanup SQL had errors"
echo "Cleanup step finished."

echo "Starting API server..."
node dist/main
