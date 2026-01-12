import { PromptTemplateKind } from '../../domain/entities/prompt-template.entity';

export class PromptTemplateRequestDto {
  keyName: string;
  kind: PromptTemplateKind;
  template: string;
  isActive?: boolean;
}
