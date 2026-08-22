import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { LegalSearchDto } from './dto/search.dto';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Post('legal')
  @ApiOperation({ summary: 'Hybrid legal search (keyword)' })
  search(@Body() dto: LegalSearchDto) {
    return this.searchService.search(dto);
  }
}
