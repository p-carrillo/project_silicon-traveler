import { PromptTemplate } from '../../domain/entities/prompt-template.entity';

export class PromptTemplateListResponseDto {
  templates: Array<{
    id: string;
    keyName: string;
    kind: 'image' | 'text';
    template: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;

  constructor(templates: PromptTemplate[]) {
    this.templates = templates.map((template) => ({
      id: template.id,
      keyName: template.keyName,
      kind: template.kind,
      template: template.template,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    }));
  }
}
