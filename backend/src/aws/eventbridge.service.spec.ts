import { Test, TestingModule } from '@nestjs/testing';
import { EventBridgeService } from './eventbridge.service';
import { ConfigService } from '@nestjs/config';
import { PutEventsCommand } from '@aws-sdk/client-eventbridge';

interface EventBridgeEntry {
  Source: string;
  DetailType: string;
  Detail: string;
}

interface PutEventsInput {
  Entries: EventBridgeEntry[];
}

interface NotificationDetail {
  applicationId: string;
  oldStatus: string;
  newStatus: string;
  userId: string;
  timestamp: string;
}

jest.mock('@aws-sdk/client-eventbridge', () => ({
  EventBridgeClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  PutEventsCommand: jest.fn(),
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

describe('EventBridgeService', () => {
  let service: EventBridgeService;
  let mockSend: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventBridgeService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<EventBridgeService>(EventBridgeService);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    mockSend = service['client'].send as jest.Mock;
    jest.clearAllMocks();
  });

  describe('publishStatusChange', () => {
    it('should publish a status change event to EventBridge', async () => {
        mockSend.mockResolvedValue({});

        await service.publishStatusChange({
            applicationId: 'app-uuid-1',
            oldStatus: 'applied',
            newStatus: 'interview',
            userId: 'user-uuid-1',
        });

        expect(mockSend).toHaveBeenCalledTimes(1);
        });

    it('should include correct event detail', async () => {
        mockSend.mockResolvedValue({});

        await service.publishStatusChange({
            applicationId: 'app-uuid-1',
            oldStatus: 'applied',
            newStatus: 'interview',
            userId: 'user-uuid-1',
        });

         
        const callArg = (PutEventsCommand as unknown as jest.Mock).mock.calls[0][0] as PutEventsInput;
        const detail = JSON.parse(callArg.Entries[0].Detail) as NotificationDetail;

        expect(detail.timestamp).toBeDefined();
        expect(detail.applicationId).toBe('app-uuid-1');
        expect(detail.oldStatus).toBe('applied');
        expect(detail.newStatus).toBe('interview');
        expect(detail.userId).toBe('user-uuid-1');
    });
  });
});