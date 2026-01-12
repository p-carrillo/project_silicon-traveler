import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IJourneyStopRepository } from '../../../domain/repositories/journey-stop.repository.interface';
import { JourneyStop } from '../../../domain/entities/journey-stop.entity';
import { JourneyStopEntity } from '../entities/journey-stop.typeorm-entity';

@Injectable()
export class JourneyStopRepository implements IJourneyStopRepository {
  constructor(
    @InjectRepository(JourneyStopEntity)
    private readonly repository: Repository<JourneyStopEntity>,
  ) {}

  async create(stop: JourneyStop): Promise<JourneyStop> {
    const entity = this.repository.create({
      id: stop.id,
      journeyId: stop.journeyId,
      title: stop.title,
      city: stop.city,
      country: stop.country,
      description: stop.description,
      sequence: stop.sequence,
      createdAt: stop.createdAt,
      updatedAt: stop.updatedAt,
    });
    const saved = await this.repository.save(entity);

    return this.toDomain(saved);
  }

  async findByJourneyId(journeyId: string): Promise<JourneyStop[]> {
    const entities = await this.repository.find({
      where: { journeyId },
      order: { sequence: 'ASC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findByJourneyIdAndSequence(
    journeyId: string,
    sequence: number,
  ): Promise<JourneyStop | null> {
    const entity = await this.repository.findOne({
      where: { journeyId, sequence },
    });

    return entity ? this.toDomain(entity) : null;
  }

  async updateSequences(
    journeyId: string,
    orderedStopIds: string[],
  ): Promise<void> {
    const now = new Date();

    await this.repository.manager.transaction(async (manager) => {
      for (let index = 0; index < orderedStopIds.length; index += 1) {
        const stopId = orderedStopIds[index];
        await manager.update(
          JourneyStopEntity,
          { id: stopId, journeyId },
          { sequence: index + 1, updatedAt: now },
        );
      }
    });
  }

  private toDomain(entity: JourneyStopEntity): JourneyStop {
    return new JourneyStop(
      entity.id,
      entity.journeyId,
      entity.title,
      entity.city,
      entity.country,
      entity.description,
      entity.sequence,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
