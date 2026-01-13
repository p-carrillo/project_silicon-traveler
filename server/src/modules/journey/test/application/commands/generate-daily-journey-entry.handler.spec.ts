import { Test, TestingModule } from '@nestjs/testing';
import { GenerateDailyJourneyEntryHandler } from '../../../application/commands/generate-daily-journey-entry.handler';
import { GenerateDailyJourneyEntryCommand } from '../../../application/commands/generate-daily-journey-entry.command';
import { Journey } from '../../../domain/entities/journey.entity';
import { JourneyStop } from '../../../domain/entities/journey-stop.entity';
import { JourneyEntry } from '../../../domain/entities/journey-entry.entity';
import { PromptTemplate } from '../../../domain/entities/prompt-template.entity';
import { IJourneyRepository } from '../../../domain/repositories/journey.repository.interface';
import { IJourneyStopRepository } from '../../../domain/repositories/journey-stop.repository.interface';
import { IJourneyEntryRepository } from '../../../domain/repositories/journey-entry.repository.interface';
import { IPromptTemplateRepository } from '../../../domain/repositories/prompt-template.repository.interface';
import { IImageGenerator } from '../../../domain/ports/image-generator.interface';
import { ITextGenerator } from '../../../domain/ports/text-generator.interface';
import { IImageStorage } from '../../../domain/ports/image-storage.interface';

describe('GenerateDailyJourneyEntryHandler', () => {
  let handler: GenerateDailyJourneyEntryHandler;
  let journeyRepository: jest.Mocked<IJourneyRepository>;
  let stopRepository: jest.Mocked<IJourneyStopRepository>;
  let entryRepository: jest.Mocked<IJourneyEntryRepository>;
  let promptRepository: jest.Mocked<IPromptTemplateRepository>;
  let imageGenerator: jest.Mocked<IImageGenerator>;
  let textGenerator: jest.Mocked<ITextGenerator>;
  let imageStorage: jest.Mocked<IImageStorage>;

  beforeEach(async () => {
    journeyRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findActive: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
    };
    stopRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByJourneyId: jest.fn(),
      findByJourneyIdAndSequence: jest.fn(),
      update: jest.fn(),
      updateSequences: jest.fn(),
    };
    entryRepository = {
      create: jest.fn(),
      findByJourneyIdAndDate: jest.fn(),
      findByJourneyId: jest.fn(),
      findLatestByJourneyId: jest.fn(),
      countByJourneyId: jest.fn(),
    };
    promptRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findActiveByKind: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    imageGenerator = {
      generateImage: jest.fn(),
    };
    textGenerator = {
      generateText: jest.fn(),
    };
    imageStorage = {
      saveImage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateDailyJourneyEntryHandler,
        { provide: 'IJourneyRepository', useValue: journeyRepository },
        { provide: 'IJourneyStopRepository', useValue: stopRepository },
        { provide: 'IJourneyEntryRepository', useValue: entryRepository },
        { provide: 'IPromptTemplateRepository', useValue: promptRepository },
        { provide: 'IImageGenerator', useValue: imageGenerator },
        { provide: 'ITextGenerator', useValue: textGenerator },
        { provide: 'IImageStorage', useValue: imageStorage },
      ],
    }).compile();

    handler = module.get(GenerateDailyJourneyEntryHandler);
  });

  it('should return existing entry when already generated for date', async () => {
    const now = new Date();
    const existingEntry = new JourneyEntry(
      'entry-id',
      'journey-id',
      'stop-id',
      '2024-01-01',
      1,
      'https://images.local/entry-full.png',
      'https://images.local/entry-web.png',
      'https://images.local/entry-thumb.png',
      'journeys/journey-id/entry-full.png',
      'journeys/journey-id/entry-web.png',
      'journeys/journey-id/entry-thumb.png',
      'Text body',
      'image-template-id',
      'text-template-id',
      'gpt-image-1',
      'gpt-4o-mini',
      now,
    );

    journeyRepository.findById.mockResolvedValue(
      new Journey('journey-id', 'Journey', null, 'active', null, 'UTC', now, now),
    );
    entryRepository.findByJourneyIdAndDate.mockResolvedValue(existingEntry);

    const result = await handler.execute(
      new GenerateDailyJourneyEntryCommand('journey-id', '2024-01-01'),
    );

    expect(result).toBe(existingEntry);
    expect(imageGenerator.generateImage).not.toHaveBeenCalled();
    expect(textGenerator.generateText).not.toHaveBeenCalled();
  });

  it('should mark journey completed when no stops remain', async () => {
    const now = new Date();
    const journey = new Journey(
      'journey-id',
      'Journey',
      null,
      'active',
      null,
      'UTC',
      now,
      now,
    );

    journeyRepository.findById.mockResolvedValue(journey);
    entryRepository.findByJourneyIdAndDate.mockResolvedValue(null);
    entryRepository.findLatestByJourneyId.mockResolvedValue(null);
    stopRepository.findByJourneyId.mockResolvedValue([]);

    const result = await handler.execute(
      new GenerateDailyJourneyEntryCommand(journey.id, '2024-01-01'),
    );

    expect(result).toBeNull();
    expect(journeyRepository.updateStatus).toHaveBeenCalledWith(
      journey.id,
      'completed',
    );
    expect(imageGenerator.generateImage).not.toHaveBeenCalled();
  });

  it('should generate and persist a new entry', async () => {
    const now = new Date();
    const journey = new Journey('journey-id', 'Journey', null, 'active', null, 'UTC', now, now);
    const stop = new JourneyStop('stop-id', journey.id, 'Lisbon', 'Lisbon', 'Portugal', null, 1, now, now);
    const imageTemplate = new PromptTemplate('image-template-id', 'image_main', 'image', 'Photo of {{location}}', true, now, now);
    const textTemplate = new PromptTemplate('text-template-id', 'text_main', 'text', 'Story about {{location}}', true, now, now);

    journeyRepository.findById.mockResolvedValue(journey);
    entryRepository.findByJourneyIdAndDate.mockResolvedValue(null);
    entryRepository.findLatestByJourneyId.mockResolvedValue(null);
    stopRepository.findByJourneyId.mockResolvedValue([stop]);
    promptRepository.findActiveByKind
      .mockResolvedValueOnce(imageTemplate)
      .mockResolvedValueOnce(textTemplate);
    imageGenerator.generateImage.mockResolvedValue({
      base64Data: 'aGVsbG8=',
      contentType: 'image/png',
      model: 'gpt-image-1',
    });
    imageStorage.saveImage
      .mockResolvedValueOnce({
        url: 'https://storage.local/journeys/journey-id/2024-01-01/stage-1-full.png',
        storageKey: 'journeys/journey-id/2024-01-01/stage-1-full.png',
      })
      .mockResolvedValueOnce({
        url: 'https://storage.local/journeys/journey-id/2024-01-01/stage-1-web.png',
        storageKey: 'journeys/journey-id/2024-01-01/stage-1-web.png',
      })
      .mockResolvedValueOnce({
        url: 'https://storage.local/journeys/journey-id/2024-01-01/stage-1-thumb.png',
        storageKey: 'journeys/journey-id/2024-01-01/stage-1-thumb.png',
      });
    textGenerator.generateText.mockResolvedValue({
      text: 'A story about Lisbon.',
      model: 'gpt-4o-mini',
    });

    const createdEntry = new JourneyEntry(
      'entry-id',
      journey.id,
      stop.id,
      '2024-01-01',
      1,
      'https://storage.local/journeys/journey-id/2024-01-01/stage-1-full.png',
      'https://storage.local/journeys/journey-id/2024-01-01/stage-1-web.png',
      'https://storage.local/journeys/journey-id/2024-01-01/stage-1-thumb.png',
      'journeys/journey-id/2024-01-01/stage-1-full.png',
      'journeys/journey-id/2024-01-01/stage-1-web.png',
      'journeys/journey-id/2024-01-01/stage-1-thumb.png',
      'A story about Lisbon.',
      imageTemplate.id,
      textTemplate.id,
      'gpt-image-1',
      'gpt-4o-mini',
      now,
    );
    entryRepository.create.mockResolvedValue(createdEntry);

    const result = await handler.execute(
      new GenerateDailyJourneyEntryCommand(journey.id, '2024-01-01'),
    );

    expect(result).toBe(createdEntry);
    expect(imageGenerator.generateImage).toHaveBeenCalledWith(
      'Photo of Lisbon, Portugal',
      expect.any(String),
    );
    expect(textGenerator.generateText).toHaveBeenCalledWith(
      'Story about Lisbon, Portugal',
      expect.any(String),
    );
    expect(imageStorage.saveImage).toHaveBeenCalledTimes(3);
    expect(imageStorage.saveImage).toHaveBeenNthCalledWith(
      1,
      expect.any(Buffer),
      'image/png',
      'journeys/journey-id/2024-01-01/stage-1-full.png',
    );
    expect(imageStorage.saveImage).toHaveBeenNthCalledWith(
      2,
      expect.any(Buffer),
      'image/png',
      'journeys/journey-id/2024-01-01/stage-1-web.png',
    );
    expect(imageStorage.saveImage).toHaveBeenNthCalledWith(
      3,
      expect.any(Buffer),
      'image/png',
      'journeys/journey-id/2024-01-01/stage-1-thumb.png',
    );
    expect(entryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        journeyId: journey.id,
        journeyStopId: stop.id,
        travelDate: '2024-01-01',
        stageIndex: 1,
      }),
    );
  });
});
