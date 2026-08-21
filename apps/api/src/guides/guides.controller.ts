import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GuidesService } from './guides.service';
import { CreateGuideDto, UpdateGuideDto, GuideQueryDto } from './dto/guide.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('Guides')
@Controller('guides')
export class GuidesController {
  constructor(private guidesService: GuidesService) {}

  @Get()
  @ApiOperation({ summary: 'List published guides' })
  findAll(@Query() query: GuideQueryDto) {
    return this.guidesService.findAll(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get guide by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.guidesService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a guide (admin)' })
  create(@Body() dto: CreateGuideDto) {
    return this.guidesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a guide (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateGuideDto) {
    return this.guidesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a guide (super admin)' })
  delete(@Param('id') id: string) {
    return this.guidesService.delete(id);
  }
}
