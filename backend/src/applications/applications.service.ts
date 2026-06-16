import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from './application.entity';
import { CreateApplicationDto, UpdateApplicationDto } from './application.dto';
import { EventBridgeService } from '../aws/eventbridge.service';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly repo: Repository<Application>,
    private readonly eventBridgeService: EventBridgeService,
  ) {}

  async findAll(userId: string, status?: ApplicationStatus): Promise<Application[]> { 
    const where: Partial<Application> = { userId };
    if (status) where.status = status;
    return this.repo.find({ where, order: { created_at: 'DESC' } });
  }

  async findOne(id: string, userId: string): Promise<Application> {
    const app = await this.repo.findOne({ where: { id } });
    if (!app) throw new NotFoundException('Application not found');
    if (app.userId !== userId) throw new ForbiddenException();
    return app;
  }

  async create(dto: CreateApplicationDto, userId: string): Promise<Application> {
    const app = this.repo.create({ ...dto, userId });
    return this.repo.save(app);
  }
 
  async update(id: string, dto: UpdateApplicationDto, userId: string): Promise<Application> {
    const app = await this.findOne(id, userId);
    const previousStatus = app.status;

    const updates = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined),);
    Object.assign(app, updates);

    const saved = await this.repo.save(app);

    if (dto.status && dto.status !== previousStatus) {
      try {
        await this.eventBridgeService.publishStatusChange({
          applicationId: saved.id,
          oldStatus: previousStatus,
          newStatus: saved.status,
          userId,
        });
      } catch (error) {
        console.error('Failed to publish status change event:', error);
      }
    }
    return saved;
  }

  async remove(id: string, userId: string): Promise<void> {
    const app = await this.findOne(id, userId);
    await this.repo.remove(app);
  }

  async getStats(userId: string):Promise<{ total: number; applied: number; interview: number; offer: number; rejected: number }> {
    const all = await this.repo.find({ where: { userId } });
    return {
      total: all.length,
      applied: all.filter((a) => a.status === ApplicationStatus.APPLIED).length,
      interview: all.filter((a) => a.status === ApplicationStatus.INTERVIEW).length,
      offer: all.filter((a) => a.status === ApplicationStatus.OFFER).length,
      rejected: all.filter((a) => a.status === ApplicationStatus.REJECTED).length,
    };
  }
}