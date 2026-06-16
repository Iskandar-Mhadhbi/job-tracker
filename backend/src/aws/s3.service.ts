import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getAppConfig } from '../config/app.config';

@Injectable()
export class S3Service {
  private client: S3Client;
  private bucket: string;

  constructor(configService: ConfigService) {
    const config = getAppConfig(configService);
    this.client = new S3Client({
      endpoint: config.aws.endpointUrl,
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
      forcePathStyle: true,
    });
    this.bucket = config.aws.s3Bucket;
  }

  async uploadFile(buffer: Buffer, key: string, contentType: string): Promise<string> { 
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );
    return key;
  }

  async listNotifications(): Promise<string[]> {  
    const result = await this.client.send(
      new ListObjectsV2Command({ Bucket: this.bucket, Prefix: 'notifications/' }),
    );
    return (result.Contents ?? []).map((obj) => obj.Key ?? '');
  }
}