#!/bin/bash
set -e

echo "Pushing Prisma schema to database..."
npx prisma db push --accept-data-loss

echo "Schema synced. Starting API server..."
exec node dist/main
