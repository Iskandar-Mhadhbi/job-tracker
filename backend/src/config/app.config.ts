import { ConfigService } from '@nestjs/config';

const required = (configService: ConfigService, key: string): string => {
  const value = configService.get<string>(key);
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

export const getAppConfig = (configService: ConfigService) => ({
  jwt: {
    secret: required(configService, 'JWT_SECRET'),
    expiresIn: configService.get<string>('JWT_EXPIRES_IN') ?? '7d',
  },
  bcrypt: {
    rounds: parseInt(configService.get<string>('BCRYPT_ROUNDS') ?? '10'),
  },
  app: {
    port: parseInt(configService.get<string>('PORT') ?? '3000'),
    nodeEnv: configService.get<string>('NODE_ENV') ?? 'development',
    frontendUrl: configService.get<string>('FRONTEND_URL') ?? 'http://localhost:4200',
  },
  db: {
    host: required(configService, 'DB_HOST'),
    port: parseInt(required(configService, 'DB_PORT')),
    username: required(configService, 'DB_USER'),
    password: required(configService, 'DB_PASS'),
    database: required(configService, 'DB_NAME'),
  },
  gemini: {
    apiKey: required(configService, 'GEMINI_API_KEY'),
  },
  aws: {
  endpointUrl: required(configService, 'AWS_ENDPOINT_URL'),
  region: required(configService, 'AWS_REGION'),
  accessKeyId: required(configService, 'AWS_ACCESS_KEY_ID'),
  secretAccessKey: required(configService, 'AWS_SECRET_ACCESS_KEY'),
  s3Bucket: required(configService, 'AWS_S3_BUCKET'),
},
});