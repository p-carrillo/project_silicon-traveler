export class ListJourneyEntriesQuery {
  constructor(
    public readonly journeyId: string,
    public readonly month?: string,
    public readonly limit?: number,
    public readonly offset?: number,
  ) {}
}
