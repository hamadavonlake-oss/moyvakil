import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  root() {
    return {
      name: 'Vakilim API',
      version: '0.1.0',
      docs: '/api',
      health: '/api/health',
    };
  }

  @Get('health')
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
