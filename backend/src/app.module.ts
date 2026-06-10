import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ApplicationsModule } from './applications/applications.module';
import { User } from './auth/user.entity';
import { Application } from './applications/application.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432'),
      username: process.env.DB_USER ?? 'admin',
      password: process.env.DB_PASS ?? 'password',
      database: process.env.DB_NAME ?? 'jobtracker',
      entities: [User, Application],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    AuthModule,
    ApplicationsModule,
  ],
})
export class AppModule {}