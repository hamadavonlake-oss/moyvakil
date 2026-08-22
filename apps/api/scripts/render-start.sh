#!/bin/bash
set -e

echo "Dropping all existing tables..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const tables = await prisma.\$queryRaw\`SELECT tablename FROM pg_tables WHERE schemaname = 'public'\`;
  for (const t of tables) {
    await prisma.\$executeRawUnsafe('DROP TABLE IF EXISTS \"' + t.tablename + '\" CASCADE');
    console.log('Dropped: ' + t.tablename);
  }
  await prisma.\$disconnect();
})();
"

echo "Pushing new Prisma schema..."
npx prisma db push

echo "Schema synced. Starting API server..."
exec node dist/main
