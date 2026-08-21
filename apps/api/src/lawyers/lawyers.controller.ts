import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LawyersService } from './lawyers.service';
import { CreateLawyerDto, UpdateLawyerDto, LawyerQueryDto } from './dto/lawyer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('Lawyers')
@Controller('lawyers')
export class LawyersController {
  constructor(private lawyersService: LawyersService) {}

  @Get()
  @ApiOperation({ summary: 'List lawyers with filters' })
  findAll(@Query() query: LawyerQueryDto) {
    return this.lawyersService.findAll(query);
  }

  @Get(':slug/reviews')
  @ApiOperation({ summary: 'Get approved reviews for a lawyer by slug' })
  getReviewsBySlug(@Param('slug') slug: string) {
    return this.lawyersService.getReviewsBySlug(slug);
  }

  @Get(':slug/services')
  @ApiOperation({ summary: 'Get active services for a lawyer by slug' })
  getServicesBySlug(@Param('slug') slug: string) {
    return this.lawyersService.getServicesBySlug(slug);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get lawyer profile by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.lawyersService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a lawyer profile' })
  create(@Body() dto: CreateLawyerDto) {
    return this.lawyersService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.LAWYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a lawyer profile' })
  update(@Param('id') id: string, @Body() dto: UpdateLawyerDto) {
    return this.lawyersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a lawyer (admin)' })
  delete(@Param('id') id: string) {
    return this.lawyersService.delete(id);
  }
}
