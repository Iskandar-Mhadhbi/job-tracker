
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.entity';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword'),
  compare: jest.fn(),
}));

const mockUser: Partial<User> = {
  id: 'uuid-1',
  email: 'test@test.com',
  password: 'hashedpassword',
  name: 'Test User',
  created_at: new Date(),
};

const mockUserRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
        {provide: ConfigService,useValue: {
          get: jest.fn().mockImplementation((key: string) => {
            const config: Record<string, string> = { JWT_SECRET: 'test-secret',
              BCRYPT_ROUNDS: '10',
              DB_HOST: 'localhost',
              DB_PORT: '5432',
              DB_USER: 'admin',
              DB_PASS: 'password',
              DB_NAME: 'jobtracker_test',
              NODE_ENV: 'test',
              PORT: '3000',
              FRONTEND_URL: 'http://localhost:4200',
              GEMINI_API_KEY: 'test-gemini-key',
              JWT_EXPIRES_IN: '7d', };
            return config[key];}),
          }
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return a token', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockUserRepo.create.mockReturnValue(mockUser);
      mockUserRepo.save.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result.access_token).toBe('mock-token');
      expect(result.user.email).toBe('test@test.com');
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      await expect(
        service.register({ email: 'test@test.com', password: 'password123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login and return a token with correct credentials', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result.access_token).toBe('mock-token');
      expect(result.user.email).toBe('test@test.com');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@test.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as unknown as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile('uuid-1');

      expect(result).toEqual(mockUser);
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        select: { id: true, email: true, name: true, created_at: true },
      });
    });
  });
});