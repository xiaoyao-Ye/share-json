import { HttpException } from '@nestjs/common';

export class ApiException extends HttpException {
  /**
   * 业务类型错误代码，非Http code
   */
  private errorCode: number;

  constructor(message: string, errorCode: number = 400) {
    super(message, 200);
    this.errorCode = errorCode;
  }

  getErrorCode(): number {
    return this.errorCode;
  }
}
