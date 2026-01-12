import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPromptTemplateRepository } from '../../../domain/repositories/prompt-template.repository.interface';
import {
  PromptTemplate,
  PromptTemplateKind,
} from '../../../domain/entities/prompt-template.entity';
import { PromptTemplateEntity } from '../entities/prompt-template.typeorm-entity';

@Injectable()
export class PromptTemplateRepository implements IPromptTemplateRepository {
  constructor(
    @InjectRepository(PromptTemplateEntity)
    private readonly repository: Repository<PromptTemplateEntity>,
  ) {}

  async findAll(): Promise<PromptTemplate[]> {
    const entities = await this.repository.find({
      order: { updatedAt: 'DESC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findById(id: string): Promise<PromptTemplate | null> {
    const entity = await this.repository.findOne({ where: { id } });

    return entity ? this.toDomain(entity) : null;
  }

  async findActiveByKind(
    kind: PromptTemplateKind,
  ): Promise<PromptTemplate | null> {
    const entity = await this.repository.findOne({
      where: { kind, isActive: true },
      order: { updatedAt: 'DESC' },
    });

    return entity ? this.toDomain(entity) : null;
  }

  async create(template: PromptTemplate): Promise<PromptTemplate> {
    const entity = this.repository.create({
      id: template.id,
      keyName: template.keyName,
      kind: template.kind,
      template: template.template,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    });
    const saved = await this.repository.save(entity);

    return this.toDomain(saved);
  }

  async update(template: PromptTemplate): Promise<PromptTemplate> {
    const entity = await this.repository.save({
      id: template.id,
      keyName: template.keyName,
      kind: template.kind,
      template: template.template,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    });

    return this.toDomain(entity);
  }

  private toDomain(entity: PromptTemplateEntity): PromptTemplate {
    return new PromptTemplate(
      entity.id,
      entity.keyName,
      entity.kind,
      entity.template,
      entity.isActive,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
