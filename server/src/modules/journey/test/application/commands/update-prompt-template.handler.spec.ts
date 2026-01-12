import { Test, TestingModule } from '@nestjs/testing';
import { UpdatePromptTemplateHandler } from '../../../application/commands/update-prompt-template.handler';
import { UpdatePromptTemplateCommand } from '../../../application/commands/update-prompt-template.command';
import { IPromptTemplateRepository } from '../../../domain/repositories/prompt-template.repository.interface';
import { PromptTemplate } from '../../../domain/entities/prompt-template.entity';

describe('UpdatePromptTemplateHandler', () => {
  let handler: UpdatePromptTemplateHandler;
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
        UpdatePromptTemplateHandler,
        {
          provide: 'IPromptTemplateRepository',
          useValue: repository,
        },
      ],
    }).compile();

    handler = module.get(UpdatePromptTemplateHandler);
  });

  it('should return null when template is missing', async () => {
    repository.findById.mockResolvedValue(null);

    const result = await handler.execute(
      new UpdatePromptTemplateCommand('template-id', 'new-key', 'New template', false),
    );

    expect(result).toBeNull();
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('should update and return the template', async () => {
    const now = new Date();
    const existing = new PromptTemplate(
      'template-id',
      'image_default',
      'image',
      'Photo of {{location}}',
      true,
      now,
      now,
    );
    const updated = new PromptTemplate(
      'template-id',
      'image_updated',
      'image',
      'Updated template',
      false,
      now,
      new Date(),
    );

    repository.findById.mockResolvedValue(existing);
    repository.update.mockResolvedValue(updated);

    const result = await handler.execute(
      new UpdatePromptTemplateCommand(
        existing.id,
        'image_updated',
        'Updated template',
        false,
      ),
    );

    expect(result).toBe(updated);
    expect(repository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: existing.id,
        keyName: 'image_updated',
        template: 'Updated template',
        isActive: false,
      }),
    );
  });
});
