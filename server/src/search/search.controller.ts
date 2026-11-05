import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query('q') query?: string) {
    if (query !== undefined && typeof query !== 'string') {
      throw new BadRequestException('q must be a string.');
    }
    return this.searchService.search(query ?? '');
  }
}
