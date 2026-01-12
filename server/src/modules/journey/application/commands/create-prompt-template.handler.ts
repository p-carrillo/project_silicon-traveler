import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { CreatePromptTemplateCommand } from './create-prompt-template.command';
import { PromptTemplate } from '../../domain/entities/prompt-template.entity';
import { IPromptTemplateRepository } from '../../domain/repositories/prompt-template.repository.interface';

@CommandHandler(CreatePromptTemplateCommand)
export class CreatePromptTemplateHandler
  implements ICommandHandler<CreatePromptTemplateCommand>
{
  constructor(
    @Inject('IPromptTemplateRepository')
    private readonly repository: IPromptTemplateRepository,
  ) {}

  async execute(
    command: CreatePromptTemplateCommand,
  ): Promise<PromptTemplate> {
    const now = new Date();
    const template = new PromptTemplate(
      randomUUID(),
      command.keyName,
      command.kind,
      command.template,
      command.isActive,
      now,
      now,
    );

    return this.repository.create(template);
  }
}
