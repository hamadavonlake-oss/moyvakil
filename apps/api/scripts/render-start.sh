#!/bin/bash
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Seeding database (cleanup + seed)..."
npx ts-node prisma/seed.ts 2>&1 || echo "WARNING: Seed had errors (data may already exist)"

echo "Starting API server..."
node dist/main
