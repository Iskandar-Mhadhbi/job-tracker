import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAppConfig } from '../config/app.config';

export interface AnalysisResult {
  matchScore: number;
  matchSummary: string;
  coverLetter: string;
  missingSkills: string[];
  strengths: string[];
  suggestedNotes: string;
}

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    this.genAI = new GoogleGenerativeAI(
      getAppConfig(configService).gemini.apiKey,
    );
  }

  async analyzeJobApplication(
    cvText: string,
    jobDescription: string,
    jobTitle: string,
    companyName: string,
  ): Promise<AnalysisResult> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = 
      `You are an expert career coach and recruiter. Analyze the following CV and job description, then provide a detailed assessment.

      CV:
      ${cvText}

      Job Title: ${jobTitle}
      Company: ${companyName}
      Job Description:
      ${jobDescription}

      Respond ONLY with a valid JSON object in this exact format, no markdown, no extra text:
      {
        "matchScore": <number between 0 and 100>,
        "matchSummary": "<2-3 sentence summary of how well the candidate matches>",
        "coverLetter": "<professional cover letter tailored to this specific job>",
        "missingSkills": ["<skill1>", "<skill2>"],
        "strengths": ["<strength1>", "<strength2>"],
        "suggestedNotes": "<key points to mention in interview>"
      }`
    ;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean) as AnalysisResult;
  }
}