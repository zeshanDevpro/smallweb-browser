import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import type { Connection, Model } from 'mongoose';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/http-exception.filter';
import { User } from '../src/users/user.schema';

describe('Browser API (e2e)', () => {
  let app: INestApplication<App>;
  let userId: string;
  let previousMongoUri: string | undefined;

  beforeAll(async () => {
    previousMongoUri = process.env.MONGO_URI;
    if (!previousMongoUri) throw new Error('MONGO_URI must be set for e2e tests.');
    const e2eUri = new URL(previousMongoUri);
    e2eUri.pathname = '/smallweb_e2e';
    process.env.MONGO_URI = e2eUri.toString();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    const users = app.get<Model<User>>(getModelToken(User.name));
    const user = await users.create({ slug: 'e2e-user', name: 'E2E User' });
    userId = user._id.toString();
  });

  it('GET /users returns public user data', async () => {
    const response = await request(app.getHttpServer()).get('/users').expect(200);
    expect(response.body).toEqual([
      expect.objectContaining({ id: userId, name: 'E2E User' }),
    ]);
  });

  it('gets a site and returns NOT_FOUND for an unknown address', async () => {
    await request(app.getHttpServer())
      .get('/sites/e2e-page.zz')
      .expect(404)
      .expect({ code: 'NOT_FOUND', message: 'Site not found.' });
  });

  it('publishes sites once and stores sanitized HTML', async () => {
    const payload = {
      address: 'E2E-Page.zz',
      title: 'E2E Field Notes',
      body: '<h1>Quiet field notes</h1><p>A useful search phrase.</p><script>alert(1)</script><a href="javascript:alert(2)">unsafe</a>',
      authorId: userId,
    };
    const created = await request(app.getHttpServer())
      .post('/sites')
      .send(payload)
      .expect(201);

    expect(created.body).toMatchObject({
      address: 'e2e-page.zz',
      title: 'E2E Field Notes',
      author: { id: userId, name: 'E2E User' },
    });
    expect(created.body.body).not.toMatch(/<script|javascript:/i);

    const fetched = await request(app.getHttpServer())
      .get('/sites/e2e-page.zz')
      .expect(200);
    expect(fetched.body.body).not.toMatch(/<script|javascript:/i);

    await request(app.getHttpServer())
      .post('/sites')
      .send(payload)
      .expect(409)
      .expect(({ body }) => expect(body.code).toBe('TAKEN'));

    await request(app.getHttpServer())
      .post('/sites')
      .send({ ...payload, address: 'bad_name.zz' })
      .expect(400)
      .expect(({ body }) => expect(body.code).toBe('INVALID'));
  });

  it('searches published text and returns an empty result for a short query', async () => {
    await request(app.getHttpServer())
      .get('/search?q=useful')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual([
          expect.objectContaining({
            address: 'e2e-page.zz',
            title: 'E2E Field Notes',
          }),
        ]);
      });
    await request(app.getHttpServer()).get('/search?q=x').expect(200, []);
  });

  it('records visits and resolves their titles when listing history', async () => {
    const created = await request(app.getHttpServer())
      .post(`/users/${userId}/visits`)
      .send({ address: 'E2E-PAGE.zz', via: 'typed', found: false })
      .expect(201);
    expect(created.body).toMatchObject({
      address: 'e2e-page.zz',
      title: 'E2E Field Notes',
      via: 'typed',
      found: true,
    });

    await request(app.getHttpServer())
      .post(`/users/${userId}/visits`)
      .send({ address: 'missing-page.zz', via: 'link' })
      .expect(201)
      .expect(({ body }) =>
        expect(body).toMatchObject({
          address: 'missing-page.zz',
          title: null,
          found: false,
        }),
      );

    await request(app.getHttpServer())
      .get(`/users/${userId}/visits`)
      .expect(200)
      .expect(({ body }) =>
        expect(body).toEqual([
          expect.objectContaining({ address: 'missing-page.zz', found: false }),
          expect.objectContaining({
            address: 'e2e-page.zz',
            title: 'E2E Field Notes',
            found: true,
          }),
        ]),
      );
  });

  afterAll(async () => {
    try {
      if (app) {
        try {
          await app.get<Connection>(getConnectionToken()).dropDatabase();
        } finally {
          await app.close();
        }
      }
    } finally {
      if (previousMongoUri === undefined) {
        delete process.env.MONGO_URI;
      } else {
        process.env.MONGO_URI = previousMongoUri;
      }
    }
  });
});

jest.setTimeout(60_000);
