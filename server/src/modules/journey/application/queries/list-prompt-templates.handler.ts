import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListPromptTemplatesQuery } from './list-prompt-templates.query';
import { PromptTemplate } from '../../domain/entities/prompt-template.entity';
import { IPromptTemplateRepository } from '../../domain/repositories/prompt-template.repository.interface';

@QueryHandler(ListPromptTemplatesQuery)
export class ListPromptTemplatesHandler
  implements IQueryHandler<ListPromptTemplatesQuery>
{
  constructor(
    @Inject('IPromptTemplateRepository')
    private readonly repository: IPromptTemplateRepository,
  ) {}

  async execute(): Promise<PromptTemplate[]> {
    return this.repository.findAll();
  }
}
