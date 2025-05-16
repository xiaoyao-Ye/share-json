import { Controller, Post, Get, Delete, Param, Body, Headers, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SharesService } from './shares.service';
import { CreateShareDto, ShareResponseDto } from './dto/create-share.dto';
import { Response } from 'express';
import { ApiException } from '../../common/exceptions/api.exception';

@ApiTags('分享')
@Controller('shares')
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  @Post()
  @ApiOperation({ summary: '创建分享', description: '创建JSON文件分享链接' })
  @ApiHeader({
    name: 'X-User-ID',
    description: '用户UUID',
    required: true,
  })
  @ApiResponse({ status: 201, description: '分享创建成功', type: ShareResponseDto })
  async createShare(@Headers('X-User-ID') uuid: string, @Body() createShareDto: CreateShareDto): Promise<ShareResponseDto> {
    if (!uuid) throw new ApiException('未提供用户标识', 400);

    return this.sharesService.createShare(uuid, createShareDto);
  }

  @Get('mine')
  @ApiOperation({ summary: '获取我的分享', description: '获取当前用户的所有分享' })
  @ApiHeader({
    name: 'X-User-ID',
    description: '用户UUID',
    required: true,
  })
  @ApiResponse({ status: 200, description: '分享列表', type: [ShareResponseDto] })
  async getUserShares(@Headers('X-User-ID') uuid: string): Promise<ShareResponseDto[]> {
    if (!uuid) throw new ApiException('未提供用户标识', 400);

    return this.sharesService.findUserShares(uuid);
  }

  @Delete(':shareId')
  @ApiOperation({ summary: '删除分享', description: '删除指定的分享' })
  @ApiHeader({
    name: 'X-User-ID',
    description: '用户UUID',
    required: true,
  })
  @ApiParam({ name: 'shareId', description: '分享ID' })
  @ApiResponse({ status: 204, description: '删除成功' })
  async deleteShare(@Headers('X-User-ID') uuid: string, @Param('shareId') shareId: string): Promise<void> {
    if (!uuid) throw new ApiException('未提供用户标识', 400);

    if (!shareId) throw new ApiException('未提供分享ID', 400);

    return this.sharesService.deleteShare(uuid, shareId);
  }

  @Get(':shareCode')
  @ApiOperation({ summary: '获取分享内容', description: '获取分享的JSON内容' })
  @ApiParam({ name: 'shareCode', description: '分享码' })
  @ApiResponse({ status: 200, description: 'JSON内容' })
  async getShare(@Param('shareCode') shareCode: string, @Res() res: Response): Promise<void> {
    if (!shareCode) throw new ApiException('未提供分享码', 400);

    const fileStream = await this.sharesService.getJsonContentByShareCode(shareCode);

    // 设置响应头
    res.set({ 'Content-Type': 'application/json' });

    // 流式传输
    fileStream.pipe(res);

    // 处理流错误
    fileStream.on('error', error => {
      console.error('流传输过程中出错:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: '文件流传输失败', error: error.message });
      } else {
        res.end();
      }
    });
  }

  @Get(':shareCode/download')
  @ApiOperation({ summary: '下载分享文件', description: '下载原始JSON文件' })
  @ApiParam({ name: 'shareCode', description: '分享码' })
  @ApiResponse({ status: 200, description: '文件下载' })
  async downloadShare(@Param('shareCode') shareCode: string, @Res() res: Response): Promise<void> {
    const { stream, fileName } = await this.sharesService.getFileStreamByShareCode(shareCode);

    // 设置响应头
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
    });

    // 流式传输
    stream.pipe(res);

    // 处理流错误
    stream.on('error', error => {
      console.error('文件下载过程中出错:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: '文件流传输失败', error: error.message });
      } else {
        res.end();
      }
    });
  }
}
