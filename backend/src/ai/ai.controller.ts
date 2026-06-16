import { Controller, Post, UseGuards, UseInterceptors, UploadedFiles, Body, } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 
import { extractTextFromPdf } from './pdf.util';
import { S3Service } from '../aws/s3.service';
import { RequirePdfFilePipe } from './pdf-file.pipe';

interface UploadedFileType {
  fieldname: string;
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

interface AnalyzeFiles {
  cv: UploadedFileType[];
  jobDescription?: UploadedFileType[];
}

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService, private readonly s3Service: S3Service,) {}

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
    @UploadedFiles(RequirePdfFilePipe) files: AnalyzeFiles, 
    @Body() body: { jobTitle: string; companyName: string; jobDescriptionText?: string },
  ) { 
    const cvFile = files.cv[0];
    const jdFile = files.jobDescription?.[0];

    try {
      const s3Key = `cvs/${Date.now()}-${cvFile.originalname}`;
      await this.s3Service.uploadFile(cvFile.buffer, s3Key, cvFile.mimetype);
    } catch (error) {
      console.error('Failed to upload CV to S3:', error);
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