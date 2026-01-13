import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetLatestJourneyEntryQuery } from '../../application/queries/get-latest-journey-entry.query';
import { GetJourneyEntryByDateQuery } from '../../application/queries/get-journey-entry-by-date.query';
import { ListJourneyEntriesQuery } from '../../application/queries/list-journey-entries.query';
import { GenerateDailyJourneyEntryCommand } from '../../application/commands/generate-daily-journey-entry.command';
import { JourneyEntryResponseDto } from '../dto/journey-entry-response.dto';
import { GenerateJourneyEntryRequestDto } from '../dto/generate-journey-entry-request.dto';
import { JourneyEntryListResponseDto } from '../dto/journey-entry-list-response.dto';
import { AdminAuthGuard } from '../../../admin/infrastructure/guards/admin-auth.guard';

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
    const result = await this.queryBus.execute(
      new GetLatestJourneyEntryQuery(journeyId),
    );

    if (!result) {
      throw new NotFoundException('Journey entry not found');
    }

    return new JourneyEntryResponseDto(result.entry, result.stop);
  }

  @Get(':id/entries')
  async listEntries(
    @Param('id') journeyId: string,
    @Query()
    query: { month?: string; limit?: string; offset?: string },
  ): Promise<JourneyEntryListResponseDto> {
    const limit = this.parseOptionalNumber(query.limit);
    const offset = this.parseOptionalNumber(query.offset);

    const entries = await this.queryBus.execute(
      new ListJourneyEntriesQuery(
        journeyId,
        query.month,
        limit,
        offset,
      ),
    );

    return new JourneyEntryListResponseDto(entries);
  }

  @Get(':id/entries/:date')
  async getEntryByDate(
    @Param('id') journeyId: string,
    @Param('date') travelDate: string,
  ): Promise<JourneyEntryResponseDto> {
    const result = await this.queryBus.execute(
      new GetJourneyEntryByDateQuery(journeyId, travelDate),
    );

    if (!result) {
      throw new NotFoundException('Journey entry not found');
    }

    return new JourneyEntryResponseDto(result.entry, result.stop);
  }

  @Post(':id/entries/generate')
  @UseGuards(AdminAuthGuard)
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

  private parseOptionalNumber(value?: string): number | undefined {
    if (!value) {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
}
