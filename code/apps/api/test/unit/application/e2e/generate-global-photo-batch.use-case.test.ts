import { describe, expect, it, vi } from 'vitest';
import {
  E2EPreflightError,
  GenerateGlobalPhotoBatchUseCase,
  parseGlobalPhotoBatchSize,
} from '../../../../src/application/e2e/generate-global-photo-batch.use-case';
import type { GlobalPlaceCandidate } from '../../../../src/application/e2e/global-place-selector.port';

function places(): GlobalPlaceCandidate[] {
  const continents: GlobalPlaceCandidate['continent'][] = [
    'Africa',
    'Asia',
    'Europe',
    'North America',
    'Oceania',
    'South America',
  ];
  return Array.from({ length: 10 }, (_, index) => ({
    placeName: `Place ${index + 1}`,
    country: `Country ${index + 1}`,
    region: index === 0 ? null : `Region ${index + 1}`,
    continent: continents[index % continents.length],
  }));
}

function context() {
  return { signal: new AbortController().signal, emit: vi.fn() };
}

describe('GenerateGlobalPhotoBatchUseCase', () => {
  it('stops before photo processing when the local selector cannot prepare a batch', async () => {
    const execute = vi.fn();
    const useCase = new GenerateGlobalPhotoBatchUseCase(
      { select: () => { throw new Error('Place catalog is unavailable'); } },
      { execute } as never
    );

    await expect(useCase.execute(context() as never, { count: 10 }))
      .rejects.toThrow(E2EPreflightError);
    expect(execute).not.toHaveBeenCalled();
  });

  it('processes all selected places in order and continues after one failure', async () => {
    const execute = vi.fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Provider unavailable'))
      .mockResolvedValue(undefined);
    const selectedPlaces = places();
    const useCase = new GenerateGlobalPhotoBatchUseCase(
      { select: vi.fn(() => selectedPlaces) },
      { execute } as never
    );
    const execution = context();

    await useCase.execute(execution as never, { count: 10 });

    expect(execute).toHaveBeenCalledTimes(10);
    expect(execute.mock.calls.map((call) => call[2])).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(execution.emit).toHaveBeenCalledWith(expect.objectContaining({
      type: 'error',
      index: 2,
      total: 10,
      data: expect.objectContaining({ message: 'Provider unavailable' }),
    }));
  });

  it('asks the selector only for the requested batch size', async () => {
    expect(parseGlobalPhotoBatchSize({ count: 1 })).toBe(1);
    expect(() => parseGlobalPhotoBatchSize({ count: 0 })).toThrow('between 1 and 10');
    const execute = vi.fn().mockResolvedValue(undefined);
    const select = vi.fn(() => places().slice(0, 3));
    const useCase = new GenerateGlobalPhotoBatchUseCase({ select }, { execute } as never);

    await useCase.execute(context() as never, { count: 3 });

    expect(select).toHaveBeenCalledWith(3);
    expect(execute).toHaveBeenCalledTimes(3);
  });
});
