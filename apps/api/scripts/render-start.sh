#!/bin/bash

echo "Starting DB migration in background..."
(npx prisma db push --force-reset --accept-data-loss 2>&1 && echo "DB push SUCCESS") || echo "DB push FAILED"
(npx prisma db execute --file prisma/cleanup.sql --schema prisma/schema.prisma 2>&1) || true
(npx prisma db seed 2>&1 && echo "Seed SUCCESS") || echo "Seed FAILED or already done"

echo "Starting API server..."
exec node dist/main
