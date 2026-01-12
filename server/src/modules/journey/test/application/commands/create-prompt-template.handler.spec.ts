import { Test, TestingModule } from '@nestjs/testing';
import { CreatePromptTemplateHandler } from '../../../application/commands/create-prompt-template.handler';
import { CreatePromptTemplateCommand } from '../../../application/commands/create-prompt-template.command';
import { IPromptTemplateRepository } from '../../../domain/repositories/prompt-template.repository.interface';
import { PromptTemplate } from '../../../domain/entities/prompt-template.entity';

describe('CreatePromptTemplateHandler', () => {
  let handler: CreatePromptTemplateHandler;
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
        CreatePromptTemplateHandler,
        {
          provide: 'IPromptTemplateRepository',
          useValue: repository,
        },
      ],
    }).compile();

    handler = module.get(CreatePromptTemplateHandler);
  });

  it('should create and return a prompt template', async () => {
    const command = new CreatePromptTemplateCommand(
      'image_default',
      'image',
      'Photo of {{location}}',
      true,
    );
    const saved = new PromptTemplate(
      'template-id',
      command.keyName,
      command.kind,
      command.template,
      command.isActive,
      new Date(),
      new Date(),
    );
    repository.create.mockResolvedValue(saved);

    const result = await handler.execute(command);

    expect(result).toBe(saved);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        keyName: command.keyName,
        kind: command.kind,
        template: command.template,
        isActive: command.isActive,
      }),
    );
  });
});
