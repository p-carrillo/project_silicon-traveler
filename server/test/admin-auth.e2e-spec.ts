import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { hash } from 'bcryptjs';
import { AppModule } from '../src/app.module';

describe('Admin Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_PASSWORD_HASH = await hash('secret', 4);
    process.env.ADMIN_SESSION_SECRET = 'test-secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should authenticate and access protected endpoint', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/admin/login')
      .send({ username: 'admin', password: 'secret' })
      .expect(204);

    const sessionCookie = loginResponse.headers['set-cookie']?.[0];

    const meResponse = await request(app.getHttpServer())
      .get('/admin/me')
      .set('Cookie', sessionCookie)
      .expect(200);

    expect(meResponse.body.username).toBe('admin');
  });

  it('should reject unauthenticated access', async () => {
    await request(app.getHttpServer()).get('/admin/me').expect(401);
  });
});
