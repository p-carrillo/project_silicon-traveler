import { PromptTemplate, PromptTemplateKind } from '../entities/prompt-template.entity';

export interface IPromptTemplateRepository {
  findAll(): Promise<PromptTemplate[]>;
  findById(id: string): Promise<PromptTemplate | null>;
  findActiveByKind(kind: PromptTemplateKind): Promise<PromptTemplate | null>;
  create(template: PromptTemplate): Promise<PromptTemplate>;
  update(template: PromptTemplate): Promise<PromptTemplate>;
}
