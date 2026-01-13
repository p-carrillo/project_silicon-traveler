import { Test, TestingModule } from '@nestjs/testing';
import { ListJourneysHandler } from '../../../application/queries/list-journeys.handler';
import { ListJourneysQuery } from '../../../application/queries/list-journeys.query';
import { IJourneyRepository } from '../../../domain/repositories/journey.repository.interface';
import { Journey } from '../../../domain/entities/journey.entity';

describe('ListJourneysHandler', () => {
  let handler: ListJourneysHandler;
  let repository: jest.Mocked<IJourneyRepository>;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findActive: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListJourneysHandler,
        { provide: 'IJourneyRepository', useValue: repository },
      ],
    }).compile();

    handler = module.get(ListJourneysHandler);
  });

  it('should list journeys', async () => {
    const now = new Date();
    repository.findAll.mockResolvedValue([
      new Journey('journey-id', 'Journey', null, 'draft', null, 'UTC', now, now),
    ]);

    const result = await handler.execute(new ListJourneysQuery());

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('journey-id');
  });
});
