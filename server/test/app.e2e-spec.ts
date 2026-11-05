import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Browser API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET /users returns the public user list', async () => {
    const response = await request(app.getHttpServer()).get('/users').expect(200);
    expect(Array.isArray(response.body)).toBe(true);
    for (const user of response.body as unknown[]) {
      expect(user).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
        }),
      );
    }
  });

  afterEach(async () => {
    if (app) await app.close();
  });
});

jest.setTimeout(60_000);
