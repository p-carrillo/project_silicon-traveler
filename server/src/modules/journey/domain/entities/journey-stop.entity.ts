export class JourneyStop {
  constructor(
    public readonly id: string,
    public readonly journeyId: string,
    public readonly title: string,
    public readonly city: string | null,
    public readonly country: string | null,
    public readonly description: string | null,
    public readonly sequence: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
