import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateShareDto {
  @ApiProperty({
    description: 'JSON文件ID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsNotEmpty()
  @IsString()
  fileId: string;

  @ApiProperty({
    description: '过期类型',
    example: 'day',
    enum: ['day', 'week', 'permanent'],
  })
  @IsNotEmpty()
  @IsIn(['day', 'week', 'permanent'])
  expiryType: 'day' | 'week' | 'permanent';
}

export class ShareResponseDto {
  @ApiProperty({
    description: '分享ID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  id: string;

  @ApiProperty({
    description: '分享代码',
    example: 'abc123',
  })
  shareCode: string;

  @ApiProperty({
    description: '文件名',
    example: 'example.json',
  })
  fileName: string;

  @ApiProperty({
    description: '过期时间',
    example: '2023-07-15T12:00:00Z',
    nullable: true,
  })
  expiresAt: Date | null;

  @ApiProperty({
    description: '状态',
    example: 1,
  })
  status: number;

  @ApiProperty({
    description: '创建时间',
    example: '2023-07-08T12:00:00Z',
  })
  createdAt: Date;
}
