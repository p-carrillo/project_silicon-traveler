import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IJourneyRepository } from '../../../domain/repositories/journey.repository.interface';
import { Journey, JourneyStatus } from '../../../domain/entities/journey.entity';
import { JourneyEntity } from '../entities/journey.typeorm-entity';

@Injectable()
export class JourneyRepository implements IJourneyRepository {
  constructor(
    @InjectRepository(JourneyEntity)
    private readonly repository: Repository<JourneyEntity>,
  ) {}

  async create(journey: Journey): Promise<Journey> {
    const entity = this.repository.create({
      id: journey.id,
      name: journey.name,
      description: journey.description,
      status: journey.status,
      startDate: journey.startDate,
      timezone: journey.timezone,
      createdAt: journey.createdAt,
      updatedAt: journey.updatedAt,
    });
    const saved = await this.repository.save(entity);

    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Journey | null> {
    const entity = await this.repository.findOne({ where: { id } });

    return entity ? this.toDomain(entity) : null;
  }

  async findActive(): Promise<Journey[]> {
    const entities = await this.repository.find({
      where: { status: 'active' },
      order: { createdAt: 'ASC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async updateStatus(id: string, status: JourneyStatus): Promise<void> {
    await this.repository.update(
      { id },
      {
        status,
        updatedAt: new Date(),
      },
    );
  }

  private toDomain(entity: JourneyEntity): Journey {
    return new Journey(
      entity.id,
      entity.name,
      entity.description,
      entity.status,
      entity.startDate,
      entity.timezone,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
