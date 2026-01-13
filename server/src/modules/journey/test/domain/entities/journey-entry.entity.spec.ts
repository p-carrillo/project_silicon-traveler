import { JourneyEntry } from '../../../domain/entities/journey-entry.entity';

describe('JourneyEntry', () => {
  it('should expose journey entry properties', () => {
    const now = new Date();
    const entry = new JourneyEntry(
      'entry-id',
      'journey-id',
      'stop-id',
      '2024-01-02',
      1,
      'https://images.local/entry-full.png',
      'https://images.local/entry-web.png',
      'https://images.local/entry-thumb.png',
      'journeys/journey-id/entry-full.png',
      'journeys/journey-id/entry-web.png',
      'journeys/journey-id/entry-thumb.png',
      'Text body',
      'image-template-id',
      'text-template-id',
      'gpt-image-1',
      'gpt-4o-mini',
      now,
    );

    expect(entry.id).toBe('entry-id');
    expect(entry.journeyId).toBe('journey-id');
    expect(entry.journeyStopId).toBe('stop-id');
    expect(entry.travelDate).toBe('2024-01-02');
    expect(entry.stageIndex).toBe(1);
    expect(entry.imageUrlFull).toBe('https://images.local/entry-full.png');
    expect(entry.imageUrlWeb).toBe('https://images.local/entry-web.png');
    expect(entry.imageUrlThumb).toBe('https://images.local/entry-thumb.png');
    expect(entry.imageStorageKeyFull).toBe('journeys/journey-id/entry-full.png');
    expect(entry.imageStorageKeyWeb).toBe('journeys/journey-id/entry-web.png');
    expect(entry.imageStorageKeyThumb).toBe('journeys/journey-id/entry-thumb.png');
    expect(entry.textBody).toBe('Text body');
    expect(entry.imagePromptId).toBe('image-template-id');
    expect(entry.textPromptId).toBe('text-template-id');
    expect(entry.imageModel).toBe('gpt-image-1');
    expect(entry.textModel).toBe('gpt-4o-mini');
    expect(entry.createdAt).toBe(now);
  });
});
