const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.$queryRawUnsafe('SELECT 1 as test')
  .then(r => { console.log('DB OK:', JSON.stringify(r)); p.$disconnect(); })
  .catch(e => { console.error('DB ERROR:', e.message); p.$disconnect(); });
