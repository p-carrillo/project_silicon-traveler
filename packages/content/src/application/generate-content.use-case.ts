import { ILLMPort, ContentInput, GeneratedContent } from '../ports/llm.port';

export class GenerateContentUseCase {
  constructor(private readonly llmPort: ILLMPort) {}

  async execute(input: ContentInput): Promise<GeneratedContent> {
    return await this.llmPort.generateContent(input);
  }
}
