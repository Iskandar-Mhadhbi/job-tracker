import { Controller, Post, UseGuards, UseInterceptors, UploadedFiles, Body, } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 
import { extractTextFromPdf } from './pdf.util';

interface UploadedFileType {
  fieldname: string;
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'cv', maxCount: 1 },
        { name: 'jobDescription', maxCount: 1 },
      ],
      { storage: memoryStorage() },
    ),
  )
  async analyze(
    @UploadedFiles()
    files: {
      cv?: UploadedFileType[];
      jobDescription?: UploadedFileType[];
    },
    @Body() body: { jobTitle: string; companyName: string; jobDescriptionText?: string },
  ) {
    const cvFile = files.cv?.[0];
    const jdFile = files.jobDescription?.[0];

    if (!cvFile) {
      throw new Error('CV file is required');
    }

    const cvText = await extractTextFromPdf(cvFile.buffer);

    let jobDescriptionText = body.jobDescriptionText ?? '';
    if (jdFile) {
      jobDescriptionText = await extractTextFromPdf(jdFile.buffer);
    }

    return this.aiService.analyzeJobApplication(
      cvText,
      jobDescriptionText,
      body.jobTitle,
      body.companyName,
    );
  }
}