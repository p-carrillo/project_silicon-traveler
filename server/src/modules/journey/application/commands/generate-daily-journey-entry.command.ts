export class GenerateDailyJourneyEntryCommand {
  constructor(
    public readonly journeyId: string,
    public readonly travelDate?: string,
    public readonly imageModel?: string,
    public readonly textModel?: string,
  ) {}
}
