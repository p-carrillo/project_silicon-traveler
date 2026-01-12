import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IJourneyEntryRepository } from '../../../domain/repositories/journey-entry.repository.interface';
import { JourneyEntry } from '../../../domain/entities/journey-entry.entity';
import { JourneyEntryEntity } from '../entities/journey-entry.typeorm-entity';

@Injectable()
export class JourneyEntryRepository implements IJourneyEntryRepository {
  constructor(
    @InjectRepository(JourneyEntryEntity)
    private readonly repository: Repository<JourneyEntryEntity>,
  ) {}

  async create(entry: JourneyEntry): Promise<JourneyEntry> {
    const entity = this.repository.create({
      id: entry.id,
      journeyId: entry.journeyId,
      journeyStopId: entry.journeyStopId,
      travelDate: entry.travelDate,
      stageIndex: entry.stageIndex,
      imageUrl: entry.imageUrl,
      imageStorageKey: entry.imageStorageKey,
      textBody: entry.textBody,
      imagePromptId: entry.imagePromptId,
      textPromptId: entry.textPromptId,
      imageModel: entry.imageModel,
      textModel: entry.textModel,
      createdAt: entry.createdAt,
    });
    const saved = await this.repository.save(entity);

    return this.toDomain(saved);
  }

  async findByJourneyIdAndDate(
    journeyId: string,
    travelDate: string,
  ): Promise<JourneyEntry | null> {
    const entity = await this.repository.findOne({
      where: { journeyId, travelDate },
    });

    return entity ? this.toDomain(entity) : null;
  }

  async findLatestByJourneyId(journeyId: string): Promise<JourneyEntry | null> {
    const entity = await this.repository.findOne({
      where: { journeyId },
      order: { travelDate: 'DESC', createdAt: 'DESC' },
    });

    return entity ? this.toDomain(entity) : null;
  }

  async countByJourneyId(journeyId: string): Promise<number> {
    return this.repository.count({ where: { journeyId } });
  }

  private toDomain(entity: JourneyEntryEntity): JourneyEntry {
    return new JourneyEntry(
      entity.id,
      entity.journeyId,
      entity.journeyStopId,
      entity.travelDate,
      entity.stageIndex,
      entity.imageUrl,
      entity.imageStorageKey,
      entity.textBody,
      entity.imagePromptId,
      entity.textPromptId,
      entity.imageModel,
      entity.textModel,
      entity.createdAt,
    );
  }
}
