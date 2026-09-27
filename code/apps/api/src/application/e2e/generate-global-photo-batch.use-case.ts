import type { PhotoPreparationInput } from '@silicon-traveler/photo';
import type { E2EExecutionContext } from './e2e-execution';
import { E2EPhotoExecutionError, type EphemeralPhotoExecution } from './ephemeral-photo-execution';
import type { GlobalPlaceCandidate, IGlobalPlaceSelector } from './global-place-selector.port';

export const GLOBAL_PHOTO_BATCH_SIZE = 10;

export class GenerateGlobalPhotoBatchUseCase {
  constructor(
    private readonly placeSelector: IGlobalPlaceSelector,
    private readonly photoExecution: Pick<EphemeralPhotoExecution, 'execute'>
  ) {}

  async execute(context: E2EExecutionContext, input: unknown): Promise<void> {
    const count = parseGlobalPhotoBatchSize(input);
    context.emit({ type: 'progress', index: 0, total: count, data: { stage: 'selecting_places' } });
    let selectedPlaces: GlobalPlaceCandidate[];
    try {
      selectedPlaces = this.placeSelector.select(count);
    } catch (error: unknown) {
      throw new E2EPreflightError(errorMessage(error));
    }
    context.emit({ type: 'progress', index: 0, total: count, data: { stage: 'places_selected', places: selectedPlaces } });

    for (const [offset, place] of selectedPlaces.entries()) {
      if (context.signal.aborted) throw new Error('E2E execution was cancelled');
      const index = offset + 1;
      try {
        await this.photoExecution.execute(context, { ...toPhotoPreparationInput(place), sequence: index }, index, count);
      } catch (error: unknown) {
        const connector = error instanceof E2EPhotoExecutionError ? error.connector : undefined;
        context.emit({
          type: 'error',
          index,
          total: count,
          data: { place, message: errorMessage(error), connector },
        });
      }
    }
  }
}

export class E2EPreflightError extends Error {}

export function parseGlobalPhotoBatchSize(value: unknown): number {
  const count = isRecord(value) ? value.count : undefined;
  if (typeof count !== 'number' || !Number.isInteger(count) || count < 1 || count > GLOBAL_PHOTO_BATCH_SIZE) {
    throw new E2EPreflightError(`Batch count must be between 1 and ${GLOBAL_PHOTO_BATCH_SIZE}`);
  }
  return count;
}

function toPhotoPreparationInput(place: GlobalPlaceCandidate): PhotoPreparationInput {
  return { placeName: place.placeName, country: place.country, region: place.region, osmData: null };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : 'Photo generation failed';
}
