import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  IsUrl,
} from 'class-validator';
import { ApplicationStatus } from './application.entity';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  company_name: string;

  @IsString()
  @IsNotEmpty()
  role_title: string;

  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;

  @IsDateString()
  applied_date: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  follow_up_date?: string;

  @IsUrl()
  @IsOptional()
  job_url?: string;

  @IsString()
  @IsOptional()
  location?: string;
}

export class UpdateApplicationDto {
  @IsString()
  @IsOptional()
  company_name?: string;

  @IsString()
  @IsOptional()
  role_title?: string;

  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;

  @IsDateString()
  @IsOptional()
  applied_date?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  follow_up_date?: string;

  @IsUrl()
  @IsOptional()
  job_url?: string;

  @IsString()
  @IsOptional()
  location?: string;
}
