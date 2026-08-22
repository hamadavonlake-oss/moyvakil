#!/bin/bash
set -e

echo "Pushing Prisma schema to database..."
npx prisma db push --accept-data-loss

echo "Seeding database..."
npx prisma db seed 2>&1 || echo "WARNING: Seed failed or already seeded, skipping"
echo "Seed step finished."

echo "Starting API server..."
node dist/main
