import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { GenerateDailyJourneyEntryCommand } from './generate-daily-journey-entry.command';
import { JourneyEntry } from '../../domain/entities/journey-entry.entity';
import { JourneyStop } from '../../domain/entities/journey-stop.entity';
import { PromptTemplate } from '../../domain/entities/prompt-template.entity';
import { renderPromptTemplate } from '../../domain/services/prompt-template-renderer';
import { IJourneyRepository } from '../../domain/repositories/journey.repository.interface';
import { IJourneyStopRepository } from '../../domain/repositories/journey-stop.repository.interface';
import { IJourneyEntryRepository } from '../../domain/repositories/journey-entry.repository.interface';
import { IPromptTemplateRepository } from '../../domain/repositories/prompt-template.repository.interface';
import { IImageGenerator } from '../../domain/ports/image-generator.interface';
import { ITextGenerator } from '../../domain/ports/text-generator.interface';
import { IImageStorage } from '../../domain/ports/image-storage.interface';

const DEFAULT_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-1';
const DEFAULT_TEXT_MODEL = process.env.OPENAI_TEXT_MODEL ?? 'gpt-4o-mini';

@CommandHandler(GenerateDailyJourneyEntryCommand)
export class GenerateDailyJourneyEntryHandler
  implements ICommandHandler<GenerateDailyJourneyEntryCommand>
{
  private readonly logger = new Logger(GenerateDailyJourneyEntryHandler.name);

  constructor(
    @Inject('IJourneyRepository')
    private readonly journeyRepository: IJourneyRepository,
    @Inject('IJourneyStopRepository')
    private readonly stopRepository: IJourneyStopRepository,
    @Inject('IJourneyEntryRepository')
    private readonly entryRepository: IJourneyEntryRepository,
    @Inject('IPromptTemplateRepository')
    private readonly promptTemplateRepository: IPromptTemplateRepository,
    @Inject('IImageGenerator')
    private readonly imageGenerator: IImageGenerator,
    @Inject('ITextGenerator')
    private readonly textGenerator: ITextGenerator,
    @Inject('IImageStorage')
    private readonly imageStorage: IImageStorage,
  ) {}

  async execute(
    command: GenerateDailyJourneyEntryCommand,
  ): Promise<JourneyEntry | null> {
    const journey = await this.journeyRepository.findById(command.journeyId);

    if (!journey || journey.status === 'completed') {
      return null;
    }

    const travelDate =
      command.travelDate ?? this.getDateInTimezone(journey.timezone);
    const existingEntry = await this.entryRepository.findByJourneyIdAndDate(
      journey.id,
      travelDate,
    );

    if (existingEntry) {
      return existingEntry;
    }

    const stops = await this.stopRepository.findByJourneyId(journey.id);
    const orderedStops = [...stops].sort((a, b) => a.sequence - b.sequence);
    const latestEntry = await this.entryRepository.findLatestByJourneyId(
      journey.id,
    );
    const stageIndex = (latestEntry?.stageIndex ?? 0) + 1;
    const stop = orderedStops[stageIndex - 1] ?? null;

    if (!stop) {
      await this.journeyRepository.updateStatus(journey.id, 'completed');
      return null;
    }

    const imagePromptTemplate = await this.getActivePromptTemplate('image');
    const textPromptTemplate = await this.getActivePromptTemplate('text');

    const variables = this.buildPromptVariables(
      journey.name,
      journey.timezone,
      travelDate,
      stageIndex,
      stop,
    );
    const imagePrompt = renderPromptTemplate(
      imagePromptTemplate.template,
      variables,
    );
    const textPrompt = renderPromptTemplate(
      textPromptTemplate.template,
      variables,
    );

    const imageModel = this.resolveModel(
      imagePromptTemplate,
      command.imageModel,
      DEFAULT_IMAGE_MODEL,
    );
    const textModel = this.resolveModel(
      textPromptTemplate,
      command.textModel,
      DEFAULT_TEXT_MODEL,
    );

    const imageResult = await this.generateImageSafely(imagePrompt, imageModel);
    const imageBuffer = Buffer.from(imageResult.base64Data, 'base64');
    const storageKey = this.buildStorageKey(
      journey.id,
      travelDate,
      stageIndex,
    );
    const storedImage = await this.imageStorage.saveImage(
      imageBuffer,
      imageResult.contentType,
      storageKey,
    );

    const textResult = await this.generateTextSafely(textPrompt, textModel);

    const entry = new JourneyEntry(
      randomUUID(),
      journey.id,
      stop.id,
      travelDate,
      stageIndex,
      storedImage.url,
      storedImage.storageKey,
      textResult.text.trim(),
      imagePromptTemplate.id,
      textPromptTemplate.id,
      imageModel,
      textModel,
      new Date(),
    );

    return this.entryRepository.create(entry);
  }

  private getDateInTimezone(timezone: string): string {
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

      return formatter.format(new Date());
    } catch (error) {
      this.logger.warn(
        `Failed to resolve timezone ${timezone}, falling back to UTC.`,
      );
      return new Date().toISOString().slice(0, 10);
    }
  }

  private async getActivePromptTemplate(
    kind: 'image' | 'text',
  ): Promise<PromptTemplate> {
    const template = await this.promptTemplateRepository.findActiveByKind(kind);

    if (!template) {
      throw new Error(`Active ${kind} prompt template is missing.`);
    }

    return template;
  }

  private buildPromptVariables(
    journeyName: string,
    timezone: string,
    travelDate: string,
    stageIndex: number,
    stop: JourneyStop,
  ): Record<string, string> {
    const location = this.buildLocation(stop);

    return {
      location,
      date: travelDate,
      stage: String(stageIndex),
      journey: journeyName,
      timezone,
      title: stop.title,
      city: stop.city ?? '',
      country: stop.country ?? '',
      description: stop.description ?? '',
    };
  }

  private buildLocation(stop: JourneyStop): string {
    const parts = [stop.city, stop.country].filter(Boolean) as string[];
    return parts.length > 0 ? parts.join(', ') : stop.title;
  }

  private resolveModel(
    template: PromptTemplate,
    overrideModel: string | undefined,
    fallbackModel: string,
  ): string {
    if (overrideModel) {
      return overrideModel;
    }

    const envKey = this.getPromptModelEnvKey(template.keyName);
    return process.env[envKey] ?? fallbackModel;
  }

  private getPromptModelEnvKey(keyName: string): string {
    const normalized = keyName.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    return `PROMPT_MODEL_${normalized}`;
  }

  private buildStorageKey(
    journeyId: string,
    travelDate: string,
    stageIndex: number,
  ): string {
    return `journeys/${journeyId}/${travelDate}/stage-${stageIndex}.png`;
  }

  private async generateImageSafely(
    prompt: string,
    model: string,
  ): Promise<{ base64Data: string; contentType: string; model: string }> {
    try {
      return await this.imageGenerator.generateImage(prompt, model);
    } catch (error) {
      this.logger.error(
        'Image generation failed.',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  private async generateTextSafely(
    prompt: string,
    model: string,
  ): Promise<{ text: string; model: string }> {
    try {
      return await this.textGenerator.generateText(prompt, model);
    } catch (error) {
      this.logger.error(
        'Text generation failed.',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }
}
