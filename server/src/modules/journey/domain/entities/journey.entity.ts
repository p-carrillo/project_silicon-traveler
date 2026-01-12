export type JourneyStatus = 'draft' | 'active' | 'completed';

export class Journey {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly status: JourneyStatus,
    public readonly startDate: string | null,
    public readonly timezone: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
