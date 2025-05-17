import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { setupSwagger } from './swagger'
import { ValidationPipe } from '@nestjs/common'
import { TransformResponseInterceptor } from './common/interceptors/api.transform.interceptor'
import { HttpExceptionFilter } from './common/filters/http.exception.filter'

async function bootstrap() {
  const IS_DEV = process.env.NODE_ENV === 'development'

  // 创建应用实例, 设置日志配置
  const app = await NestFactory.create(AppModule, {
    logger: IS_DEV ? ['error', 'warn', 'debug', 'log'] : ['error', 'warn'],
  })

  app.setGlobalPrefix(process.env.PREFIX ?? '')

  app.enableCors()

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  )

  app.useGlobalInterceptors(new TransformResponseInterceptor())

  app.useGlobalFilters(new HttpExceptionFilter())

  setupSwagger(app)

  await app.listen(process.env.PORT ?? 3000)
  const serverUrl = await app.getUrl()

  console.log(`api 服务已经启动    : ${serverUrl + process.env.PREFIX}`)
  console.log(`swagger 文档已经启动: ${serverUrl}/${process.env.SWAGGER_PATH}`)
  console.log(`openapi 源文件     : ${serverUrl}/${process.env.SWAGGER_PATH}-json`)
}

bootstrap()
