import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { ResponseDto } from '../class/res.class'
import { ApiException } from '../exceptions/api.exception'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: HttpException, host: ArgumentsHost) {
    const IS_DEV = process.env.NODE_ENV === 'development'
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    const code = exception instanceof ApiException ? exception.getErrorCode() : status

    let message = '服务器异常，请稍后再试'
    if (status === 429) {
      message = '请求过于频繁，请稍后再试'
    } else if (IS_DEV || status < 500) {
      message = exception.message
    }

    const errorResponse = new ResponseDto(code, null, message)

    response.header('Content-Type', 'application/json')
    response.status(status).send(errorResponse)

    this.logger.error(`${request.method} ${request.url}`, JSON.stringify(errorResponse))
  }
}
