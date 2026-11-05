import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateVisitDto } from './dto/create-visit.dto';
import { VisitsService } from './visits.service';

@Controller('users/:userId/visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Get()
  list(@Param('userId') userId: string) {
    return this.visitsService.list(userId);
  }

  @Post()
  create(
    @Param('userId') userId: string,
    @Body() input: CreateVisitDto,
  ) {
    return this.visitsService.create(userId, input);
  }
}
