import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get platform stats (admin)' })
  getStats() {
    return this.adminService.getStats();
  }

  @Get('documents')
  @ApiOperation({ summary: 'List all legal documents (admin)' })
  getAllDocuments() {
    return this.adminService.getAllDocuments();
  }

  @Get('sources')
  @ApiOperation({ summary: 'List all legal sources (admin)' })
  getAllSources() {
    return this.adminService.getAllSources();
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users (admin)' })
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('audit')
  @ApiOperation({ summary: 'Get recent audit events (admin)' })
  getAuditEvents(@Query('limit') limit?: string) {
    return this.adminService.getAuditEvents(limit ? parseInt(limit) : 50);
  }
}
