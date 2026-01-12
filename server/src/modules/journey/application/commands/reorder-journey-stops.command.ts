export class ReorderJourneyStopsCommand {
  constructor(
    public readonly journeyId: string,
    public readonly orderedStopIds: string[],
  ) {}
}
