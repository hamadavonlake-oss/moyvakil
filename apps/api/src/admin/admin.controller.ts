import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get platform stats (admin)' })
  getStats() {
    return this.adminService.getStats();
  }

  @Get('laws')
  @ApiOperation({ summary: 'List all laws for admin (admin)' })
  getAllLaws() {
    return this.adminService.getAllLaws();
  }

  @Get('lawyers')
  @ApiOperation({ summary: 'List all lawyers for admin (admin)' })
  getAllLawyers() {
    return this.adminService.getAllLawyers();
  }

  @Get('reviews')
  @ApiOperation({ summary: 'List reviews with optional status filter (admin)' })
  getAllReviews(@Query('status') status?: string) {
    return this.adminService.getAllReviews(status);
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users (admin)' })
  getAllUsers() {
    return this.adminService.getAllUsers();
  }
}
