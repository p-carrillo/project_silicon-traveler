import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetLatestJourneyEntryQuery } from '../../application/queries/get-latest-journey-entry.query';
import { GenerateDailyJourneyEntryCommand } from '../../application/commands/generate-daily-journey-entry.command';
import { JourneyEntryResponseDto } from '../dto/journey-entry-response.dto';
import { GenerateJourneyEntryRequestDto } from '../dto/generate-journey-entry-request.dto';

@Controller('journeys')
export class JourneyEntryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':id/entries/latest')
  async getLatestEntry(
    @Param('id') journeyId: string,
  ): Promise<JourneyEntryResponseDto> {
    const entry = await this.queryBus.execute(
      new GetLatestJourneyEntryQuery(journeyId),
    );

    if (!entry) {
      throw new NotFoundException('Journey entry not found');
    }

    return new JourneyEntryResponseDto(entry);
  }

  @Post(':id/entries/generate')
  async generateEntry(
    @Param('id') journeyId: string,
    @Body() body: GenerateJourneyEntryRequestDto,
  ): Promise<JourneyEntryResponseDto> {
    const entry = await this.commandBus.execute(
      new GenerateDailyJourneyEntryCommand(
        journeyId,
        body.travelDate,
        body.imageModel,
        body.textModel,
      ),
    );

    if (!entry) {
      throw new NotFoundException('Journey entry could not be generated');
    }

    return new JourneyEntryResponseDto(entry);
  }
}
