export class JourneyEntry {
  constructor(
    public readonly id: string,
    public readonly journeyId: string,
    public readonly journeyStopId: string,
    public readonly travelDate: string,
    public readonly stageIndex: number,
    public readonly imageUrlFull: string,
    public readonly imageUrlWeb: string,
    public readonly imageUrlThumb: string,
    public readonly imageStorageKeyFull: string,
    public readonly imageStorageKeyWeb: string,
    public readonly imageStorageKeyThumb: string,
    public readonly textBody: string,
    public readonly imagePromptId: string,
    public readonly textPromptId: string,
    public readonly imageModel: string,
    public readonly textModel: string,
    public readonly createdAt: Date,
  ) {}
}
