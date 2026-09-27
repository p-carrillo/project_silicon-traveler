import { describe, expect, it, vi } from 'vitest';
import { GeocodePlaceUseCase } from '../../../src/application/geocode-place.use-case';

describe('GeocodePlaceUseCase', () => {
  it('delegates to the nominatim port', async () => {
    // Arrange
    const nominatim = {
      geocodePlace: vi.fn().mockResolvedValue({
        coordinates: { lat: 40.4168, lng: -3.7038 },
        placeName: 'Madrid',
        country: 'Spain',
        region: 'Comunidad de Madrid',
        displayName: 'Madrid, Comunidad de Madrid, Spain',
      }),
    };

    const useCase = new GeocodePlaceUseCase(nominatim as any);

    // Act
    const result = await useCase.execute('Madrid, Spain');

    // Assert
    expect(nominatim.geocodePlace).toHaveBeenCalledWith('Madrid, Spain');
    expect(result?.coordinates).toEqual({ lat: 40.4168, lng: -3.7038 });
  });
});
