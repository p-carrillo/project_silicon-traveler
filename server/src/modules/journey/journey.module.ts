import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JourneyController } from './infrastructure/controllers/journey.controller';
import { JourneyEntryController } from './infrastructure/controllers/journey-entry.controller';
import { PromptTemplateController } from './infrastructure/controllers/prompt-template.controller';
import { JourneyEntity } from './infrastructure/persistence/entities/journey.typeorm-entity';
import { JourneyStopEntity } from './infrastructure/persistence/entities/journey-stop.typeorm-entity';
import { JourneyEntryEntity } from './infrastructure/persistence/entities/journey-entry.typeorm-entity';
import { PromptTemplateEntity } from './infrastructure/persistence/entities/prompt-template.typeorm-entity';
import { JourneyRepository } from './infrastructure/persistence/repositories/journey.repository';
import { JourneyStopRepository } from './infrastructure/persistence/repositories/journey-stop.repository';
import { JourneyEntryRepository } from './infrastructure/persistence/repositories/journey-entry.repository';
import { PromptTemplateRepository } from './infrastructure/persistence/repositories/prompt-template.repository';
import { OpenAiImageGenerator } from './infrastructure/adapters/openai-image.generator';
import { OpenAiTextGenerator } from './infrastructure/adapters/openai-text.generator';
import { PlaceholderImageStorage } from './infrastructure/adapters/placeholder-image-storage';
import { JourneyEntryScheduler } from './infrastructure/schedulers/journey-entry.scheduler';
import { CreateJourneyHandler } from './application/commands/create-journey.handler';
import { AddJourneyStopHandler } from './application/commands/add-journey-stop.handler';
import { ReorderJourneyStopsHandler } from './application/commands/reorder-journey-stops.handler';
import { GenerateDailyJourneyEntryHandler } from './application/commands/generate-daily-journey-entry.handler';
import { CreatePromptTemplateHandler } from './application/commands/create-prompt-template.handler';
import { UpdatePromptTemplateHandler } from './application/commands/update-prompt-template.handler';
import { GetJourneyHandler } from './application/queries/get-journey.handler';
import { GetLatestJourneyEntryHandler } from './application/queries/get-latest-journey-entry.handler';
import { ListPromptTemplatesHandler } from './application/queries/list-prompt-templates.handler';
import { GetJourneyEntryByDateHandler } from './application/queries/get-journey-entry-by-date.handler';
import { ListJourneyEntriesHandler } from './application/queries/list-journey-entries.handler';

const commandHandlers = [
  CreateJourneyHandler,
  AddJourneyStopHandler,
  ReorderJourneyStopsHandler,
  GenerateDailyJourneyEntryHandler,
  CreatePromptTemplateHandler,
  UpdatePromptTemplateHandler,
];

const queryHandlers = [
  GetJourneyHandler,
  GetLatestJourneyEntryHandler,
  GetJourneyEntryByDateHandler,
  ListJourneyEntriesHandler,
  ListPromptTemplatesHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      JourneyEntity,
      JourneyStopEntity,
      JourneyEntryEntity,
      PromptTemplateEntity,
    ]),
  ],
  controllers: [
    JourneyController,
    JourneyEntryController,
    PromptTemplateController,
  ],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    JourneyEntryScheduler,
    {
      provide: 'IJourneyRepository',
      useClass: JourneyRepository,
    },
    {
      provide: 'IJourneyStopRepository',
      useClass: JourneyStopRepository,
    },
    {
      provide: 'IJourneyEntryRepository',
      useClass: JourneyEntryRepository,
    },
    {
      provide: 'IPromptTemplateRepository',
      useClass: PromptTemplateRepository,
    },
    {
      provide: 'IImageGenerator',
      useClass: OpenAiImageGenerator,
    },
    {
      provide: 'ITextGenerator',
      useClass: OpenAiTextGenerator,
    },
    {
      provide: 'IImageStorage',
      useClass: PlaceholderImageStorage,
    },
  ],
})
export class JourneyModule {}
