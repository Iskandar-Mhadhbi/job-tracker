import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';

interface UploadedFileType {
  fieldname: string;
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Injectable()
export class RequirePdfFilePipe implements PipeTransform {
  transform(files: { cv?: UploadedFileType[]; jobDescription?: UploadedFileType[] }) {
    const cvFile = files?.cv?.[0];

    if (!cvFile) {
      throw new BadRequestException('CV file is required');
    }

    if (cvFile.mimetype !== 'application/pdf') {
      throw new BadRequestException('CV must be a PDF file');
    }

    if (files.jobDescription?.[0]) {
      const jdFile = files.jobDescription[0];
      if (jdFile.mimetype !== 'application/pdf') {
        throw new BadRequestException('Job description file must be a PDF');
      }
    }

    return files;
  }
}