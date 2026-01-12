import { Test, TestingModule } from '@nestjs/testing';
import { ListPromptTemplatesHandler } from '../../../application/queries/list-prompt-templates.handler';
import { ListPromptTemplatesQuery } from '../../../application/queries/list-prompt-templates.query';
import { IPromptTemplateRepository } from '../../../domain/repositories/prompt-template.repository.interface';
import { PromptTemplate } from '../../../domain/entities/prompt-template.entity';

describe('ListPromptTemplatesHandler', () => {
  let handler: ListPromptTemplatesHandler;
  let repository: jest.Mocked<IPromptTemplateRepository>;

  beforeEach(async () => {
    repository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findActiveByKind: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListPromptTemplatesHandler,
        {
          provide: 'IPromptTemplateRepository',
          useValue: repository,
        },
      ],
    }).compile();

    handler = module.get(ListPromptTemplatesHandler);
  });

  it('should return prompt templates', async () => {
    const now = new Date();
    const template = new PromptTemplate(
      'template-id',
      'image_default',
      'image',
      'Photo of {{location}}',
      true,
      now,
      now,
    );
    repository.findAll.mockResolvedValue([template]);

    const result = await handler.execute(new ListPromptTemplatesQuery());

    expect(result).toEqual([template]);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });
});
