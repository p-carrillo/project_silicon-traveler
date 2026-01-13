import { Body, Controller, Get, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ListPromptTemplatesQuery } from '../../application/queries/list-prompt-templates.query';
import { CreatePromptTemplateCommand } from '../../application/commands/create-prompt-template.command';
import { UpdatePromptTemplateCommand } from '../../application/commands/update-prompt-template.command';
import { PromptTemplateRequestDto } from '../dto/prompt-template-request.dto';
import { UpdatePromptTemplateRequestDto } from '../dto/update-prompt-template-request.dto';
import { PromptTemplateResponseDto } from '../dto/prompt-template-response.dto';
import { PromptTemplateListResponseDto } from '../dto/prompt-template-list-response.dto';
import { AdminAuthGuard } from '../../../admin/infrastructure/guards/admin-auth.guard';

@Controller('prompt-templates')
export class PromptTemplateController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @UseGuards(AdminAuthGuard)
  async listTemplates(): Promise<PromptTemplateListResponseDto> {
    const templates = await this.queryBus.execute(new ListPromptTemplatesQuery());

    return new PromptTemplateListResponseDto(templates);
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  async createTemplate(
    @Body() body: PromptTemplateRequestDto,
  ): Promise<PromptTemplateResponseDto> {
    const template = await this.commandBus.execute(
      new CreatePromptTemplateCommand(
        body.keyName,
        body.kind,
        body.template,
        body.isActive ?? true,
      ),
    );

    return new PromptTemplateResponseDto(template);
  }

  @Patch(':id')
  @UseGuards(AdminAuthGuard)
  async updateTemplate(
    @Param('id') id: string,
    @Body() body: UpdatePromptTemplateRequestDto,
  ): Promise<PromptTemplateResponseDto> {
    const template = await this.commandBus.execute(
      new UpdatePromptTemplateCommand(id, body.keyName, body.template, body.isActive),
    );

    if (!template) {
      throw new NotFoundException('Prompt template not found');
    }

    return new PromptTemplateResponseDto(template);
  }
}
