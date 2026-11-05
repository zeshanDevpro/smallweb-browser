import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateSiteDto } from './dto/create-site.dto';
import { SitesService } from './sites.service';

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get(':address')
  get(@Param('address') address: string) {
    return this.sitesService.get(address);
  }

  @Post()
  create(@Body() input: CreateSiteDto) {
    return this.sitesService.create(input);
  }
}
