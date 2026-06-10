import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, UpdateApplicationDto } from './application.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApplicationStatus } from './application.entity';
import type  { AuthRequest } from '../auth/auth-request.interface';

@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Get()
  findAll(@Request() req: AuthRequest, @Query('status') status?: ApplicationStatus) {
    return this.service.findAll(req.user.id, status);
  }

  @Get('stats')
  getStats(@Request() req: AuthRequest) {
    return this.service.getStats(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.service.findOne(id, req.user.id);
  }

  @Post()
  create(@Body() dto: CreateApplicationDto, @Request() req: AuthRequest) {
    return this.service.create(dto, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateApplicationDto, @Request() req: AuthRequest) {
    return this.service.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.service.remove(id, req.user.id);
  }
}