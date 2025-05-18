import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNumber, IsOptional } from 'class-validator'

export class VerifyFileDto {
  @ApiProperty({ description: '文件哈希值' })
  @IsString()
  fileHash: string

  @ApiProperty({ description: '文件名', required: false })
  @IsString()
  @IsOptional()
  fileName?: string

  @ApiProperty({ description: '文件大小', required: false })
  @IsNumber()
  @IsOptional()
  fileSize?: number
}

export class VerifyFileResponseDto {
  @ApiProperty({ description: '文件是否存在' })
  exists: boolean

  @ApiProperty({ description: '文件ID', required: false })
  fileId?: string
}
