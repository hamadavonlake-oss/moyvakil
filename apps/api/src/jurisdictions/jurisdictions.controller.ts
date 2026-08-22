import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JurisdictionsService } from './jurisdictions.service';

@ApiTags('Jurisdictions')
@Controller('jurisdictions')
export class JurisdictionsController {
  constructor(private jurisdictionsService: JurisdictionsService) {}

  @Get('countries')
  @ApiOperation({ summary: 'List active countries' })
  listCountries() {
    return this.jurisdictionsService.listCountries();
  }

  @Get('countries/:code')
  @ApiOperation({ summary: 'Get a single country by code' })
  getCountryByCode(@Param('code') code: string) {
    return this.jurisdictionsService.getCountryByCode(code);
  }

  @Get('languages')
  @ApiOperation({ summary: 'List active languages' })
  listLanguages() {
    return this.jurisdictionsService.listLanguages();
  }

  @Get()
  @ApiOperation({ summary: 'List jurisdictions of a country (with parent info)' })
  listJurisdictions(@Query('countryId') countryId?: string) {
    if (!countryId) {
      throw new BadRequestException('countryId query parameter is required');
    }
    return this.jurisdictionsService.listJurisdictions(countryId);
  }
}
