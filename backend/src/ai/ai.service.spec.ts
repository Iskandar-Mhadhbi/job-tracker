jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue(
            JSON.stringify({
              matchScore: 75,
              matchSummary: 'Good match for the role.',
              coverLetter: 'Dear Hiring Manager...',
              missingSkills: ['Python', 'Machine Learning'],
              strengths: ['TypeScript', 'NestJS', 'Docker'],
              suggestedNotes: 'Highlight your full-stack experience.',
            }),
          ),
        },
      }),
    }),
  })),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { ConfigService } from '@nestjs/config';

const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    const config: Record<string, string> = {
      GEMINI_API_KEY: 'test-gemini-key',
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
      AWS_ENDPOINT_URL: 'http://localhost:4566',
      AWS_REGION: 'us-east-1',
      AWS_ACCESS_KEY_ID: 'test',
      AWS_SECRET_ACCESS_KEY: 'test',
      AWS_S3_BUCKET: 'job-tracker-cvs',
    };
    return config[key];
  }),
};

describe('AiService', () => {
  let service: AiService;
  let mockGenerateContent: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
     mockGenerateContent = (service as any).genAI.getGenerativeModel().generateContent;

    jest.clearAllMocks();
  });

  describe('analyzeJobApplication', () => {
    it('should return a structured analysis result', async () => {
      mockGenerateContent.mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            matchScore: 75,
            matchSummary: 'Good match for the role.',
            coverLetter: 'Dear Hiring Manager...',
            missingSkills: ['Python', 'Machine Learning'],
            strengths: ['TypeScript', 'NestJS', 'Docker'],
            suggestedNotes: 'Highlight your full-stack experience.',
          }),
        },
      });   
      
      const result = await service.analyzeJobApplication(
        'My CV content here',
        'We are looking for a TypeScript developer',
        'Software Engineer',
        'Google',
      );

      expect(result.matchScore).toBe(75);
      expect(result.matchSummary).toBe('Good match for the role.');
      expect(result.coverLetter).toBe('Dear Hiring Manager...');
      expect(result.missingSkills).toEqual(['Python', 'Machine Learning']);
      expect(result.strengths).toEqual(['TypeScript', 'NestJS', 'Docker']);
      expect(result.suggestedNotes).toBe('Highlight your full-stack experience.');
    });

    it('should call generateContent with a prompt containing job and CV info', async () => {
        await service.analyzeJobApplication(
            'My CV content',
            'Job description here',
            'Frontend Engineer',
            'Meta',
        ); 

        expect(mockGenerateContent).toHaveBeenCalledTimes(1);
        const prompt = mockGenerateContent.mock.calls[0][0] as string;
        expect(prompt).toContain('Frontend Engineer');
        expect(prompt).toContain('Meta');
        expect(prompt).toContain('My CV content');
    });

    it('should strip markdown code fences from response', async () => { 
        mockGenerateContent.mockResolvedValue({
            response: {
            text: () =>
                '```json\n' +
                JSON.stringify({
                matchScore: 60,
                matchSummary: 'Partial match.',
                coverLetter: 'Dear Team...',
                missingSkills: ['Go'],
                strengths: ['React'],
                suggestedNotes: 'Focus on frontend skills.',
                }) +
                '\n```',
            },
        });

        const result = await service.analyzeJobApplication('CV', 'Job desc', 'Engineer', 'Apple');
        expect(result.matchScore).toBe(60);
        expect(result.coverLetter).toBe('Dear Team...');
        });
    });
});