import type { PhotoPreparationInput } from '@silicon-traveler/photo';

export interface EphemeralRoutePointState extends PhotoPreparationInput {
  readonly id: string;
  readonly createdAt: Date;
}

/** Process-only state used by E2E commands; it deliberately has no persistence port. */
export class InMemoryEphemeralRoutePointState {
  create(input: PhotoPreparationInput): EphemeralRoutePointState {
    return { ...input, id: crypto.randomUUID(), createdAt: new Date() };
  }
}
