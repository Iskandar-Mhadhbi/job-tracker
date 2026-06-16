import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { getAppConfig } from '../config/app.config';

interface StatusChangePayload {
  applicationId: string;
  oldStatus: string;
  newStatus: string;
  userId: string;
}

@Injectable()
export class EventBridgeService {
  private client: EventBridgeClient;

  constructor(configService: ConfigService) {
    const config = getAppConfig(configService);
    this.client = new EventBridgeClient({
      endpoint: config.aws.endpointUrl,
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
    });
  }

  async publishStatusChange(payload: StatusChangePayload): Promise<void> { 
    await this.client.send(
      new PutEventsCommand({
        Entries: [
          {
            Source: 'job-tracker',
            DetailType: 'ApplicationStatusChanged',
            Detail: JSON.stringify({ ...payload, timestamp: new Date().toISOString() }),
          },
        ],
      }),
    );
  }
}