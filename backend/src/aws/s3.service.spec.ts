import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, } from '@aws-sdk/client-s3';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  PutObjectCommand: jest.fn(),
  ListObjectsV2Command: jest.fn(),
}));

const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    const config: Record<string, string> = {
      AWS_ENDPOINT_URL: 'http://localhost:4566',
      AWS_REGION: 'us-east-1',
      AWS_ACCESS_KEY_ID: 'test',
      AWS_SECRET_ACCESS_KEY: 'test',
      AWS_S3_BUCKET: 'job-tracker-cvs',
      JWT_SECRET: 'test-secret',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_USER: 'admin',
      DB_PASS: 'password',
      DB_NAME: 'jobtracker_test',
      NODE_ENV: 'test',
      PORT: '3000',
      FRONTEND_URL: 'http://localhost:4200',
      JWT_EXPIRES_IN: '7d',
      GEMINI_API_KEY: 'test-gemini-key',
    };
    return config[key];
  }),
};

describe('S3Service', () => {
  let service: S3Service;
  let mockSend: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    mockSend = service['client'].send as jest.Mock;
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload a file to S3 and return the key', async () => {
      mockSend.mockResolvedValue({});

      const buffer = Buffer.from('test content');
      const key = 'cvs/test.pdf';
      const result = await service.uploadFile(buffer, key, 'application/pdf');

      expect(result).toBe(key);
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(PutObjectCommand).toHaveBeenCalledWith({
        Bucket: 'job-tracker-cvs',
        Key: key,
        Body: buffer,
        ContentType: 'application/pdf',
      });
    });
  });

  describe('listNotifications', () => {
    it('should return list of notification keys', async () => {
      mockSend.mockResolvedValue({
        Contents: [
          { Key: 'notifications/app1-123.json' },
          { Key: 'notifications/app2-456.json' },
        ],
      });

      const result = await service.listNotifications();

      expect(result).toEqual([
        'notifications/app1-123.json',
        'notifications/app2-456.json',
      ]);
    });

    it('should return empty array when no notifications exist', async () => {
      mockSend.mockResolvedValue({ Contents: undefined });

      const result = await service.listNotifications();

      expect(result).toEqual([]);
    });
  });
});