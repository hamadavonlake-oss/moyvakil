import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LawsService } from './laws.service';
import {
  CreateLegalDocumentDto,
  UpdateLegalDocumentDto,
  LegalDocumentQueryDto,
  SectionQueryDto,
} from './dto/law.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@ApiTags('Laws')
@Controller('laws')
export class LawsController {
  constructor(private lawsService: LawsService) {}

  @Get()
  @ApiOperation({ summary: 'List legal documents with filters' })
  findAll(@Query() query: LegalDocumentQueryDto) {
    return this.lawsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a legal document with versions and sections' })
  findById(@Param('id') id: string) {
    return this.lawsService.findById(id);
  }

  @Get(':id/sections')
  @ApiOperation({ summary: 'List sections of a legal document' })
  getSections(@Param('id') id: string, @Query() query: SectionQueryDto) {
    return this.lawsService.getSections(id, query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a legal document (admin+)' })
  create(@Body() dto: CreateLegalDocumentDto) {
    return this.lawsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a legal document (admin+)' })
  update(@Param('id') id: string, @Body() dto: UpdateLegalDocumentDto) {
    return this.lawsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a legal document (super admin)' })
  delete(@Param('id') id: string) {
    return this.lawsService.delete(id);
  }
}

@ApiTags('Legal Sections')
@Controller('sections')
export class LegalSectionsController {
  constructor(private lawsService: LawsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a single section with full text' })
  getSectionById(@Param('id') id: string) {
    return this.lawsService.getSectionById(id);
  }
}
