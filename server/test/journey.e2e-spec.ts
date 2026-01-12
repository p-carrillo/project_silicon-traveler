import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { randomUUID } from 'crypto';
import { AppModule } from '../src/app.module';

describe('Journey Flow (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('IImageGenerator')
      .useValue({
        generateImage: jest.fn().mockResolvedValue({
          base64Data: 'aGVsbG8=',
          contentType: 'image/png',
          model: 'gpt-image-1',
        }),
      })
      .overrideProvider('ITextGenerator')
      .useValue({
        generateText: jest.fn().mockResolvedValue({
          text: 'A test story.',
          model: 'gpt-4o-mini',
        }),
      })
      .overrideProvider('IImageStorage')
      .useValue({
        saveImage: jest.fn().mockResolvedValue({
          url: 'https://storage.local/journeys/test.png',
          storageKey: 'journeys/test.png',
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should create a journey, add a stop, and generate an entry', async () => {
    const journeyResponse = await request(app.getHttpServer())
      .post('/journeys')
      .send({ name: 'World Journey', status: 'active', timezone: 'UTC' })
      .expect(201);

    const journeyId = journeyResponse.body.journey.id as string;

    await request(app.getHttpServer())
      .post(`/journeys/${journeyId}/stops`)
      .send({ title: 'Lisbon', city: 'Lisbon', country: 'Portugal' })
      .expect(201);

    const keySuffix = randomUUID().slice(0, 8);
    const imageKey = `image_${keySuffix}`;
    const textKey = `text_${keySuffix}`;

    await request(app.getHttpServer())
      .post('/prompt-templates')
      .send({
        keyName: imageKey,
        kind: 'image',
        template: 'Photo of {{location}}',
        isActive: true,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/prompt-templates')
      .send({
        keyName: textKey,
        kind: 'text',
        template: 'Story about {{location}}',
        isActive: true,
      })
      .expect(201);

    const entryResponse = await request(app.getHttpServer())
      .post(`/journeys/${journeyId}/entries/generate`)
      .send({ travelDate: '2024-01-01' })
      .expect(201);

    expect(entryResponse.body.entry.journeyId).toBe(journeyId);
    expect(entryResponse.body.entry.imageUrl).toBe(
      'https://storage.local/journeys/test.png',
    );
    expect(entryResponse.body.entry.textBody).toBe('A test story.');
  });
});
