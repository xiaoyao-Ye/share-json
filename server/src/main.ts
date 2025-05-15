import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(process.env.PREFIX ?? '');

  app.enableCors();

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
  const serverUrl = await app.getUrl();

  console.log(`api 服务已经启动    : ${serverUrl + process.env.PREFIX}`);
  console.log(`swagger 文档已经启动: ${serverUrl}/${process.env.SWAGGER_PATH}`);
  console.log(`openapi 源文件     : ${serverUrl}/${process.env.SWAGGER_PATH}-json`);
}

bootstrap();
