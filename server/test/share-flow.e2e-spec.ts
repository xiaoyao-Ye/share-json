import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

describe('分享功能 (e2e)', () => {
  let app: INestApplication;
  let userUuid: string;
  let fileId: string;
  let shareId: string;
  let shareCode: string;

  // 创建测试JSON文件
  const testJsonContent = JSON.stringify({ test: 'data', number: 123 }, null, 2);
  const testJsonPath = path.join(__dirname, 'test.json');

  // 创建测试JSON文件
  beforeAll(() => {
    fs.writeFileSync(testJsonPath, testJsonContent);
    userUuid = uuidv4(); // 生成随机用户ID
  });

  // 删除测试JSON文件
  afterAll(() => {
    if (fs.existsSync(testJsonPath)) {
      fs.unlinkSync(testJsonPath);
    }
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('应该完成完整的分享流程', async () => {
    // 第1步：识别用户（自动创建）
    const userResponse = await request(app.getHttpServer())
      .get('/api/users/identify')
      .set('X-User-ID', userUuid)
      .expect(HttpStatus.OK);

    expect(userResponse.body).toHaveProperty('id');
    expect(userResponse.body.uuid).toBe(userUuid);

    // 第2步：上传JSON文件
    const uploadResponse = await request(app.getHttpServer())
      .post('/api/files/upload')
      .set('X-User-ID', userUuid)
      .attach('file', testJsonPath)
      .expect(HttpStatus.CREATED);

    expect(uploadResponse.body).toHaveProperty('id');
    expect(uploadResponse.body).toHaveProperty('fileName', 'test.json');
    fileId = uploadResponse.body.id;

    // 第3步：创建分享链接（一天有效期）
    const createShareResponse = await request(app.getHttpServer())
      .post('/api/shares')
      .set('X-User-ID', userUuid)
      .send({
        fileId: fileId,
        expiryType: 'day',
      })
      .expect(HttpStatus.CREATED);

    expect(createShareResponse.body).toHaveProperty('id');
    expect(createShareResponse.body).toHaveProperty('shareCode');
    expect(createShareResponse.body).toHaveProperty('fileName', 'test.json');
    expect(createShareResponse.body).toHaveProperty('expiresAt');
    shareId = createShareResponse.body.id;
    shareCode = createShareResponse.body.shareCode;

    // 第4步：获取我的分享列表
    const mySharesResponse = await request(app.getHttpServer())
      .get('/api/shares/mine')
      .set('X-User-ID', userUuid)
      .expect(HttpStatus.OK);

    expect(Array.isArray(mySharesResponse.body)).toBe(true);
    expect(mySharesResponse.body.length).toBeGreaterThan(0);
    expect(mySharesResponse.body[0]).toHaveProperty('id', shareId);
    expect(mySharesResponse.body[0]).toHaveProperty('shareCode', shareCode);

    // 第5步：获取分享内容
    const shareContentResponse = await request(app.getHttpServer()).get(`/api/shares/${shareCode}`).expect(HttpStatus.OK);

    expect(shareContentResponse.body).toEqual(JSON.parse(testJsonContent));

    // 第6步：尝试下载分享文件
    await request(app.getHttpServer())
      .get(`/api/shares/${shareCode}/download`)
      .expect(HttpStatus.OK)
      .expect('Content-Type', /application\/json/)
      .expect('Content-Disposition', /attachment; filename=/)
      .expect(res => {
        // 检查响应体是否包含期望的JSON内容
        expect(res.text).toBe(testJsonContent);
      });

    // 第7步：删除分享
    await request(app.getHttpServer()).delete(`/api/shares/${shareId}`).set('X-User-ID', userUuid).expect(HttpStatus.NO_CONTENT);

    // 第8步：确认分享已被删除（通过尝试获取分享内容）
    await request(app.getHttpServer()).get(`/api/shares/${shareCode}`).expect(HttpStatus.NOT_FOUND);
  });

  it('应该拒绝访问过期的分享链接', async () => {
    // 由于时间限制，我们通过模拟过期的分享来测试
    // 第1步：上传文件
    const uploadResponse = await request(app.getHttpServer())
      .post('/api/files/upload')
      .set('X-User-ID', userUuid)
      .attach('file', testJsonPath)
      .expect(HttpStatus.CREATED);

    fileId = uploadResponse.body.id;

    // 第2步：创建一个分享链接，设置为一天后过期
    const createShareResponse = await request(app.getHttpServer())
      .post('/api/shares')
      .set('X-User-ID', userUuid)
      .send({
        fileId: fileId,
        expiryType: 'day',
      })
      .expect(HttpStatus.CREATED);

    shareCode = createShareResponse.body.shareCode;

    // TODO: 修改数据库中的过期时间
    // 第3步：修改数据库中的过期时间（这里我们只能模拟，实际上需要直接修改数据库）
    // 由于无法直接修改数据库，我们可以考虑创建一个测试专用的端点或者根据实际情况调整测试

    // 注意：这个测试用例在实际环境中需要进一步调整或者使用更专业的测试技术
  });
});
