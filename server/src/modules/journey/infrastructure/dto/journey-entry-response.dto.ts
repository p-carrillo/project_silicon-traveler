import { JourneyEntry } from '../../domain/entities/journey-entry.entity';

export class JourneyEntryResponseDto {
  entry: {
    id: string;
    journeyId: string;
    journeyStopId: string;
    travelDate: string;
    stageIndex: number;
    imageUrl: string;
    imageStorageKey: string;
    textBody: string;
    imagePromptId: string;
    textPromptId: string;
    imageModel: string;
    textModel: string;
    createdAt: Date;
  };

  constructor(entry: JourneyEntry) {
    this.entry = {
      id: entry.id,
      journeyId: entry.journeyId,
      journeyStopId: entry.journeyStopId,
      travelDate: entry.travelDate,
      stageIndex: entry.stageIndex,
      imageUrl: entry.imageUrl,
      imageStorageKey: entry.imageStorageKey,
      textBody: entry.textBody,
      imagePromptId: entry.imagePromptId,
      textPromptId: entry.textPromptId,
      imageModel: entry.imageModel,
      textModel: entry.textModel,
      createdAt: entry.createdAt,
    };
  }
}
