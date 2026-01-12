import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateJourneyCommand } from '../../application/commands/create-journey.command';
import { AddJourneyStopCommand } from '../../application/commands/add-journey-stop.command';
import { ReorderJourneyStopsCommand } from '../../application/commands/reorder-journey-stops.command';
import { GetJourneyQuery } from '../../application/queries/get-journey.query';
import { CreateJourneyRequestDto } from '../dto/create-journey-request.dto';
import { CreateJourneyStopRequestDto } from '../dto/create-journey-stop-request.dto';
import { ReorderJourneyStopsRequestDto } from '../dto/reorder-journey-stops-request.dto';
import { JourneyResponseDto } from '../dto/journey-response.dto';
import { JourneyStopResponseDto } from '../dto/journey-stop-response.dto';

@Controller('journeys')
export class JourneyController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createJourney(
    @Body() body: CreateJourneyRequestDto,
  ): Promise<JourneyResponseDto> {
    const command = new CreateJourneyCommand(
      body.name,
      body.description ?? null,
      body.status ?? 'draft',
      body.startDate ?? null,
      body.timezone ?? 'UTC',
    );
    const journey = await this.commandBus.execute(command);

    return new JourneyResponseDto(journey, []);
  }

  @Get(':id')
  async getJourney(@Param('id') id: string): Promise<JourneyResponseDto> {
    const result = await this.queryBus.execute(new GetJourneyQuery(id));

    if (!result) {
      throw new NotFoundException('Journey not found');
    }

    return new JourneyResponseDto(result.journey, result.stops);
  }

  @Post(':id/stops')
  async addStop(
    @Param('id') journeyId: string,
    @Body() body: CreateJourneyStopRequestDto,
  ): Promise<JourneyStopResponseDto> {
    const stop = await this.commandBus.execute(
      new AddJourneyStopCommand(
        journeyId,
        body.title,
        body.city ?? null,
        body.country ?? null,
        body.description ?? null,
      ),
    );

    if (!stop) {
      throw new NotFoundException('Journey not found');
    }

    return new JourneyStopResponseDto(stop);
  }

  @Patch(':id/stops/order')
  async reorderStops(
    @Param('id') journeyId: string,
    @Body() body: ReorderJourneyStopsRequestDto,
  ): Promise<JourneyResponseDto> {
    try {
      const stops = await this.commandBus.execute(
        new ReorderJourneyStopsCommand(journeyId, body.orderedStopIds),
      );

      if (!stops) {
        throw new NotFoundException('Journey not found');
      }

      const result = await this.queryBus.execute(
        new GetJourneyQuery(journeyId),
      );

      if (!result) {
        throw new NotFoundException('Journey not found');
      }

      return new JourneyResponseDto(result.journey, result.stops);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Invalid stop order',
      );
    }
  }
}
