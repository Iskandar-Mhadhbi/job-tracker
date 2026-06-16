import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Application, ApplicationStatus } from './application.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventBridgeService } from '../aws/eventbridge.service';

const mockApp: Partial<Application> = {
  id: 'app-uuid-1',
  company_name: 'Google',
  role_title: 'Frontend Developer',
  status: ApplicationStatus.APPLIED,
  applied_date: '2026-06-01',
  userId: 'user-uuid-1',
};

const mockRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  const mockEventBridgeService = {
    publishStatusChange: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: getRepositoryToken(Application), useValue: mockRepo },
        { provide: EventBridgeService, useValue: mockEventBridgeService },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all applications for a user', async () => {
      mockRepo.find.mockResolvedValue([mockApp]);

      const result = await service.findAll('user-uuid-1');

      expect(result).toEqual([mockApp]);
      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1' },
        order: { created_at: 'DESC' },
      });
    });

    it('should filter by status when provided', async () => {
      mockRepo.find.mockResolvedValue([mockApp]);

      const result = await service.findAll('user-uuid-1', ApplicationStatus.APPLIED);

      expect(result).toEqual([mockApp]);
      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1', status: ApplicationStatus.APPLIED },
        order: { created_at: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return an application by id', async () => {
      mockRepo.findOne.mockResolvedValue(mockApp);

      const result = await service.findOne('app-uuid-1', 'user-uuid-1');

      expect(result).toEqual(mockApp);
    });

    it('should throw NotFoundException if app not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('wrong-id', 'user-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if app belongs to another user', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockApp, userId: 'other-user' });

      await expect(
        service.findOne('app-uuid-1', 'user-uuid-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('create', () => {
    it('should create and return a new application', async () => {
      mockRepo.create.mockReturnValue(mockApp);
      mockRepo.save.mockResolvedValue(mockApp);

      const result = await service.create(
        {
          company_name: 'Google',
          role_title: 'Frontend Developer',
          applied_date: '2026-06-01',
        },
        'user-uuid-1',
      );

      expect(result).toEqual(mockApp);
      expect(mockRepo.create).toHaveBeenCalled();
      expect(mockRepo.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update and return the application', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockApp });
      mockRepo.save.mockResolvedValue({ ...mockApp, status: ApplicationStatus.INTERVIEW });

      const result = await service.update(
        'app-uuid-1',
        { status: ApplicationStatus.INTERVIEW },
        'user-uuid-1',
      );

      expect(result.status).toBe(ApplicationStatus.INTERVIEW);
    });
  });

  describe('remove', () => {
    it('should remove the application', async () => {
      mockRepo.findOne.mockResolvedValue(mockApp);
      mockRepo.remove.mockResolvedValue(undefined);

      await service.remove('app-uuid-1', 'user-uuid-1');

      expect(mockRepo.remove).toHaveBeenCalledWith(mockApp);
    });
  });

  describe('getStats', () => {
    it('should return correct stats', async () => {
      mockRepo.find.mockResolvedValue([
        { ...mockApp, status: ApplicationStatus.APPLIED },
        { ...mockApp, status: ApplicationStatus.APPLIED },
        { ...mockApp, status: ApplicationStatus.OFFER },
      ]);

      const result = await service.getStats('user-uuid-1');

      expect(result.total).toBe(3);
      expect(result.applied).toBe(2);
      expect(result.offer).toBe(1);
      expect(result.interview).toBe(0);
      expect(result.rejected).toBe(0);
    });
  });
});