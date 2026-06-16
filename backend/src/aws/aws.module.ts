import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { EventBridgeService } from './eventbridge.service';
import { AwsController } from './aws.controller';

@Module({
  controllers: [AwsController],
  providers: [S3Service, EventBridgeService],
  exports: [S3Service, EventBridgeService],
})
export class AwsModule {}