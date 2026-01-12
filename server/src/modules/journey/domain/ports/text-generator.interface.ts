export interface TextGenerationResult {
  text: string;
  model: string;
}

export interface ITextGenerator {
  generateText(prompt: string, model: string): Promise<TextGenerationResult>;
}
