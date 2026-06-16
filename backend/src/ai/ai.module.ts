import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { AwsModule } from '../aws/aws.module';

@Module({
  imports: [AwsModule],
  providers: [AiService],
  controllers: [AiController],
})
export class AiModule {}