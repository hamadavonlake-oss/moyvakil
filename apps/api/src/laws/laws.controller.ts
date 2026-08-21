import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LawsService } from './laws.service';
import { CreateLawDto, UpdateLawDto, LawQueryDto } from './dto/law.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('Laws')
@Controller('laws')
export class LawsController {
  constructor(private lawsService: LawsService) {}

  @Get()
  @ApiOperation({ summary: 'List laws with filters' })
  findAll(@Query() query: LawQueryDto) {
    return this.lawsService.findAll(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get law by slug with articles' })
  findBySlug(@Param('slug') slug: string) {
    return this.lawsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new law (admin)' })
  create(@Body() dto: CreateLawDto) {
    return this.lawsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a law (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateLawDto) {
    return this.lawsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a law (super admin)' })
  delete(@Param('id') id: string) {
    return this.lawsService.delete(id);
  }
}
