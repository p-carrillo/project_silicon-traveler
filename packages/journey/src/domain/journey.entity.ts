import { Point } from '@silicon-traveler/shared';

export class Journey {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly originPoint: Point,
    public currentPosition: Point,
    public readonly heading: string,
    public readonly startedAt: Date,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  updatePosition(newPosition: Point): void {
    this.currentPosition = newPosition;
    this.updatedAt = new Date();
  }

  static create(name: string, originPoint: Point, heading: string = 'east'): Omit<Journey, 'id' | 'createdAt' | 'updatedAt'> {
    const now = new Date();
    return {
      name,
      originPoint,
      currentPosition: originPoint,
      heading,
      startedAt: now,
      createdAt: now,
      updatedAt: now,
    } as any;
  }
}
