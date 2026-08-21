#!/bin/bash
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Seeding database..."
npx ts-node prisma/seed.ts || echo "Seed skipped (data may already exist)"

echo "Starting API server..."
node dist/main
