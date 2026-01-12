import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePromptTemplateCommand } from './update-prompt-template.command';
import { PromptTemplate } from '../../domain/entities/prompt-template.entity';
import { IPromptTemplateRepository } from '../../domain/repositories/prompt-template.repository.interface';

@CommandHandler(UpdatePromptTemplateCommand)
export class UpdatePromptTemplateHandler
  implements ICommandHandler<UpdatePromptTemplateCommand>
{
  constructor(
    @Inject('IPromptTemplateRepository')
    private readonly repository: IPromptTemplateRepository,
  ) {}

  async execute(
    command: UpdatePromptTemplateCommand,
  ): Promise<PromptTemplate | null> {
    const existing = await this.repository.findById(command.id);

    if (!existing) {
      return null;
    }

    const updated = new PromptTemplate(
      existing.id,
      command.keyName ?? existing.keyName,
      existing.kind,
      command.template ?? existing.template,
      command.isActive ?? existing.isActive,
      existing.createdAt,
      new Date(),
    );

    return this.repository.update(updated);
  }
}
