import { PromptTemplateKind } from '../../domain/entities/prompt-template.entity';

export class CreatePromptTemplateCommand {
  constructor(
    public readonly keyName: string,
    public readonly kind: PromptTemplateKind,
    public readonly template: string,
    public readonly isActive: boolean,
  ) {}
}
