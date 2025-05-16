import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import { ResponseDto } from '../class/res.class';

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, ResponseDto<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseDto<T>> {
    return next.handle().pipe(
      map(data => {
        const response = context.switchToHttp().getResponse<Response>();
        response.header('Content-Type', 'application/json');

        return new ResponseDto(200, data);
      }),
    );
  }
}
