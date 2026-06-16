import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ApplicationsModule } from './applications/applications.module';
import { User } from './auth/user.entity';
import { Application } from './applications/application.entity';
import { getAppConfig } from './config/app.config';
import { MetricsModule } from './metrics/metrics.module';
import { AiModule } from './ai/ai.module';
import { AwsModule } from './aws/aws.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
          type: 'postgres',
          ...getAppConfig(configService).db,
          entities: [User, Application],
          synchronize: getAppConfig(configService).app.nodeEnv !== 'production',
        }),
        inject: [ConfigService],
    }),
    AuthModule,
    ApplicationsModule,
    MetricsModule,
    AiModule,
    AwsModule
  ],
})
export class AppModule {}