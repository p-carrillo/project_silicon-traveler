export class UpdateJourneyStopCommand {
  constructor(
    public readonly journeyId: string,
    public readonly stopId: string,
    public readonly title?: string,
    public readonly city?: string | null,
    public readonly country?: string | null,
    public readonly description?: string | null,
  ) {}
}
