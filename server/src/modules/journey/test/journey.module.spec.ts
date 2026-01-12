import { Test, TestingModule } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JourneyModule } from '../journey.module';
import { JourneyController } from '../infrastructure/controllers/journey.controller';
import { JourneyEntryController } from '../infrastructure/controllers/journey-entry.controller';
import { PromptTemplateController } from '../infrastructure/controllers/prompt-template.controller';
import { JourneyRepository } from '../infrastructure/persistence/repositories/journey.repository';
import { JourneyEntryRepository } from '../infrastructure/persistence/repositories/journey-entry.repository';
import { GenerateDailyJourneyEntryHandler } from '../application/commands/generate-daily-journey-entry.handler';

describe('JourneyModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        CqrsModule,
        ScheduleModule.forRoot(),
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '3306', 10),
          username: process.env.DB_USERNAME || 'user',
          password: process.env.DB_PASSWORD || 'password',
          database: process.env.DB_DATABASE || 'app',
          entities: [__dirname + '/../../**/*.typeorm-entity{.ts,.js}'],
          synchronize: false,
        }),
        JourneyModule,
      ],
    }).compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should provide controllers', () => {
    expect(module.get(JourneyController)).toBeDefined();
    expect(module.get(JourneyEntryController)).toBeDefined();
    expect(module.get(PromptTemplateController)).toBeDefined();
  });

  it('should provide journey repositories', () => {
    const journeyRepository = module.get('IJourneyRepository');
    const entryRepository = module.get('IJourneyEntryRepository');

    expect(journeyRepository).toBeInstanceOf(JourneyRepository);
    expect(entryRepository).toBeInstanceOf(JourneyEntryRepository);
  });

  it('should provide GenerateDailyJourneyEntryHandler', () => {
    const handler = module.get(GenerateDailyJourneyEntryHandler);
    expect(handler).toBeDefined();
  });
});
