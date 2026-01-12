export class UpdatePromptTemplateCommand {
  constructor(
    public readonly id: string,
    public readonly keyName?: string,
    public readonly template?: string,
    public readonly isActive?: boolean,
  ) {}
}
