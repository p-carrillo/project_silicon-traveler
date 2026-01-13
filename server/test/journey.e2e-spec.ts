import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { randomUUID } from 'crypto';
import { hash } from 'bcryptjs';
import { AppModule } from '../src/app.module';

describe('Journey Flow (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD_HASH = await hash('secret', 4);
    process.env.ADMIN_SESSION_SECRET = 'test-secret';

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
    const loginResponse = await request(app.getHttpServer())
      .post('/admin/login')
      .send({ username: 'admin', password: 'secret' })
      .expect(204);

    const sessionCookie = loginResponse.headers['set-cookie']?.[0];

    const journeyResponse = await request(app.getHttpServer())
      .post('/journeys')
      .set('Cookie', sessionCookie)
      .send({ name: 'World Journey', status: 'active', timezone: 'UTC' })
      .expect(201);

    const journeyId = journeyResponse.body.journey.id as string;

    await request(app.getHttpServer())
      .post(`/journeys/${journeyId}/stops`)
      .set('Cookie', sessionCookie)
      .send({ title: 'Lisbon', city: 'Lisbon', country: 'Portugal' })
      .expect(201);

    const keySuffix = randomUUID().slice(0, 8);
    const imageKey = `image_${keySuffix}`;
    const textKey = `text_${keySuffix}`;

    await request(app.getHttpServer())
      .post('/prompt-templates')
      .set('Cookie', sessionCookie)
      .send({
        keyName: imageKey,
        kind: 'image',
        template: 'Photo of {{location}}',
        isActive: true,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/prompt-templates')
      .set('Cookie', sessionCookie)
      .send({
        keyName: textKey,
        kind: 'text',
        template: 'Story about {{location}}',
        isActive: true,
      })
      .expect(201);

    const entryResponse = await request(app.getHttpServer())
      .post(`/journeys/${journeyId}/entries/generate`)
      .set('Cookie', sessionCookie)
      .send({ travelDate: '2024-01-01' })
      .expect(201);

    expect(entryResponse.body.entry.journeyId).toBe(journeyId);
    expect(entryResponse.body.entry.imageUrl).toBe(
      'https://storage.local/journeys/test.png',
    );
    expect(entryResponse.body.entry.textBody).toBe('A test story.');
  });
});
