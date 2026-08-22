#!/bin/bash

echo "Pushing DB schema in background..."
nohup npx prisma db push --force-reset --accept-data-loss > /tmp/db-push.log 2>&1 &

echo "Starting API server..."
exec node dist/main
