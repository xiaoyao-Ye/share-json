import { ApiProperty } from '@nestjs/swagger';

export class UploadFileResponseDto {
  @ApiProperty({
    description: '文件ID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  id: string;

  @ApiProperty({
    description: '原始文件名',
    example: 'example.json',
  })
  fileName: string;

  @ApiProperty({
    description: '文件大小（字节）',
    example: 1024,
  })
  fileSize: number;

  @ApiProperty({
    description: '上传日期',
    example: '2023-07-08T12:34:56Z',
  })
  uploadedAt: Date;
}
