import { Controller, Post, Get, Delete, Param, Body, Headers, Res, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SharesService } from './shares.service';
import { CreateShareDto, ShareResponseDto } from './dto/create-share.dto';
import { Response } from 'express';

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
    if (!uuid) {
      throw new BadRequestException('未提供用户标识');
    }
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
    if (!uuid) {
      throw new BadRequestException('未提供用户标识');
    }
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
    if (!uuid) {
      throw new BadRequestException('未提供用户标识');
    }
    return this.sharesService.deleteShare(uuid, shareId);
  }

  @Get(':shareCode')
  @ApiOperation({ summary: '获取分享内容', description: '获取分享的JSON内容' })
  @ApiParam({ name: 'shareCode', description: '分享代码' })
  @ApiResponse({ status: 200, description: 'JSON内容' })
  async getShare(@Param('shareCode') shareCode: string): Promise<any> {
    return this.sharesService.getJsonContentByShareCode(shareCode);
  }

  @Get(':shareCode/download')
  @ApiOperation({ summary: '下载分享文件', description: '下载原始JSON文件' })
  @ApiParam({ name: 'shareCode', description: '分享代码' })
  @ApiResponse({ status: 200, description: '文件下载' })
  async downloadShare(@Param('shareCode') shareCode: string, @Res() res: Response): Promise<void> {
    const { buffer, fileName } = await this.sharesService.getFileBufferByShareCode(shareCode);

    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
