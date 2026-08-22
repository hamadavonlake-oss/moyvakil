#!/bin/bash
set -e

echo "Resetting database schema..."
npx prisma db push --force-reset --accept-data-loss

echo "Schema synced. Starting API server..."
exec node dist/main
