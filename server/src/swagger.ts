import { INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger'

export function setupSwagger(app: INestApplication): void {
  const configService = app.get<ConfigService>(ConfigService)

  // 默认为启用

  const enable = configService.get<boolean>('swagger.enable', true)

  // 判断是否需要启用
  if (!enable) return

  const swaggerConfig = new DocumentBuilder()
    .setTitle(configService.get<string>('swagger.title') || 'API 文档')
    .setDescription(configService.get<string>('swagger.desc') || 'API 接口文档')
    .setLicense('MIT', 'https://github.com/xiaoyao-Ye')
    .addBearerAuth()
    .build()

  // 确保 operationId 像createUser而不是AccountController_createUser这样的名称
  const options: SwaggerDocumentOptions = {
    operationIdFactory: (_controllerKey, methodKey) => methodKey,
  }
  const document = SwaggerModule.createDocument(app, swaggerConfig, options)

  SwaggerModule.setup(configService.get<string>('swagger.path', '/swagger-api'), app, document)
}
