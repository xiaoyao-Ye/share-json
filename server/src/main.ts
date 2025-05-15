import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
  const serverUrl = await app.getUrl();

  console.log(`api服务已经启动, 请访问: ${serverUrl + process.env.PREFIX}`);
}

bootstrap();
