import { PromptTemplate } from '../../domain/entities/prompt-template.entity';

export class PromptTemplateResponseDto {
  template: {
    id: string;
    keyName: string;
    kind: 'image' | 'text';
    template: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };

  constructor(template: PromptTemplate) {
    this.template = {
      id: template.id,
      keyName: template.keyName,
      kind: template.kind,
      template: template.template,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }
}
