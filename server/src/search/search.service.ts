import { Injectable } from '@nestjs/common';
import { SitesService } from '../sites/sites.service';

@Injectable()
export class SearchService {
  constructor(private readonly sitesService: SitesService) {}

  search(query: string) {
    return this.sitesService.search(query);
  }
}
