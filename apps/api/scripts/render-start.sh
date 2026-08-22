#!/bin/bash
set -e

echo "Pushing Prisma schema to database..."
npx prisma db push

echo "Cleaning fabricated data..."
npx prisma db execute --file prisma/cleanup.sql --schema prisma/schema.prisma 2>&1 || echo "WARNING: Cleanup SQL had errors"
echo "Cleanup step finished."

echo "Seeding database..."
npx prisma db seed 2>&1 || echo "WARNING: Seed had errors"
echo "Seed step finished."

echo "Starting API server..."
node dist/main
