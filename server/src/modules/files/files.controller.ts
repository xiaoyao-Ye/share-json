import { Controller, Post, UseInterceptors, UploadedFile, Headers, Body } from '@nestjs/common'
import { FilesService } from './files.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiOperation, ApiConsumes, ApiHeader, ApiBody } from '@nestjs/swagger'
import { UsersService } from '../users/users.service'
import { UploadFileResponseDto } from './dto/upload-file.dto'
import { VerifyFileDto, VerifyFileResponseDto } from './dto/verify-file.dto'
import { Express } from 'express'
import { ApiException } from '../../common/exceptions/api.exception'

@ApiTags('文件')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly usersService: UsersService,
  ) {}

  @Post('verify')
  @ApiOperation({ summary: '验证文件是否存在', description: '通过文件哈希验证文件是否已存在' })
  @ApiHeader({
    name: 'X-User-ID',
    description: '用户UUID',
    required: true,
  })
  async verifyFile(
    @Body() verifyDto: VerifyFileDto,
    @Headers('X-User-ID') uuid: string,
  ): Promise<VerifyFileResponseDto> {
    if (!uuid) throw new ApiException('未提供用户标识', 400)

    // 确保用户存在
    await this.usersService.getOrCreateUser(uuid)

    // 验证文件是否存在，仅通过哈希值查询
    const existingFile = await this.filesService.findByHash(verifyDto.fileHash)

    if (existingFile) {
      return {
        exists: true,
        fileId: existingFile.id,
      }
    }

    return {
      exists: false,
    }
  }

  @Post('upload')
  @ApiOperation({ summary: '上传JSON文件', description: '上传JSON文件并返回文件信息' })
  @ApiConsumes('multipart/form-data')
  @ApiHeader({
    name: 'X-User-ID',
    description: '用户UUID',
    required: true,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'JSON文件',
        },
        fileHash: {
          type: 'string',
          description: '文件哈希值',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 20 * 1024 * 1024,
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Headers('X-User-ID') uuid: string,
    @Body() body: { fileHash?: string },
  ): Promise<UploadFileResponseDto> {
    if (!uuid) throw new ApiException('未提供用户标识', 400)

    // 确保用户存在
    await this.usersService.getOrCreateUser(uuid)

    const jsonFile = await this.filesService.uploadJsonFile(file, body.fileHash)

    return {
      id: jsonFile.id,
      fileName: jsonFile.fileName,
      fileSize: jsonFile.fileSize,
      uploadedAt: jsonFile.createdAt,
    }
  }
}
