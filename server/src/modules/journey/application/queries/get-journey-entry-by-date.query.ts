export class GetJourneyEntryByDateQuery {
  constructor(
    public readonly journeyId: string,
    public readonly travelDate: string,
  ) {}
}
