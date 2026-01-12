export class JourneyEntry {
  constructor(
    public readonly id: string,
    public readonly journeyId: string,
    public readonly journeyStopId: string,
    public readonly travelDate: string,
    public readonly stageIndex: number,
    public readonly imageUrl: string,
    public readonly imageStorageKey: string,
    public readonly textBody: string,
    public readonly imagePromptId: string,
    public readonly textPromptId: string,
    public readonly imageModel: string,
    public readonly textModel: string,
    public readonly createdAt: Date,
  ) {}
}
