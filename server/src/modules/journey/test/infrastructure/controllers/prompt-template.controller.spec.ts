import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PromptTemplateController } from '../../../infrastructure/controllers/prompt-template.controller';
import { PromptTemplate } from '../../../domain/entities/prompt-template.entity';

describe('PromptTemplateController', () => {
  let controller: PromptTemplateController;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    commandBus = { execute: jest.fn() } as unknown as jest.Mocked<CommandBus>;
    queryBus = { execute: jest.fn() } as unknown as jest.Mocked<QueryBus>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromptTemplateController],
      providers: [
        { provide: CommandBus, useValue: commandBus },
        { provide: QueryBus, useValue: queryBus },
      ],
    }).compile();

    controller = module.get(PromptTemplateController);
  });

  it('should list prompt templates', async () => {
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
    queryBus.execute.mockResolvedValue([template]);

    const result = await controller.listTemplates();

    expect(result.templates).toHaveLength(1);
    expect(queryBus.execute).toHaveBeenCalled();
  });

  it('should create a prompt template', async () => {
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
    commandBus.execute.mockResolvedValue(template);

    const result = await controller.createTemplate({
      keyName: 'image_default',
      kind: 'image',
      template: 'Photo of {{location}}',
    });

    expect(result.template.id).toBe('template-id');
    expect(commandBus.execute).toHaveBeenCalled();
  });

  it('should update a prompt template', async () => {
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
    commandBus.execute.mockResolvedValue(template);

    const result = await controller.updateTemplate('template-id', {
      template: 'Updated template',
    });

    expect(result.template.id).toBe('template-id');
    expect(commandBus.execute).toHaveBeenCalled();
  });

  it('should throw NotFoundException when template is missing', async () => {
    commandBus.execute.mockResolvedValue(null);

    await expect(
      controller.updateTemplate('missing-id', { template: 'Updated' }),
    ).rejects.toThrow(NotFoundException);
  });
});
