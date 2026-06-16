import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { S3Service } from './s3.service';

@UseGuards(JwtAuthGuard)
@Controller('aws')
export class AwsController {
  constructor(private readonly s3Service: S3Service) {}

  @Get('notifications')
  async getNotifications() {
    const keys = await this.s3Service.listNotifications();
    return { notifications: keys };
  }
}