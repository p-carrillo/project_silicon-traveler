export type PromptTemplateKind = 'image' | 'text';

export class PromptTemplate {
  constructor(
    public readonly id: string,
    public readonly keyName: string,
    public readonly kind: PromptTemplateKind,
    public readonly template: string,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
