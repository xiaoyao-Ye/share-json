import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Share } from '../../entities/share.entity';
import { CreateShareDto, ShareResponseDto } from './dto/create-share.dto';
import { FilesService } from '../files/files.service';
import { UsersService } from '../users/users.service';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import { ApiException } from '../../common/exceptions/api.exception';
import * as fs from 'fs';

@Injectable()
export class SharesService {
  constructor(
    @InjectRepository(Share)
    private sharesRepository: Repository<Share>,
    private filesService: FilesService,
    private usersService: UsersService,
  ) {}

  /**
   * 创建分享
   * @param uuid 用户UUID
   * @param createShareDto 创建分享DTO
   * @returns 分享信息
   */
  async createShare(uuid: string, createShareDto: CreateShareDto): Promise<ShareResponseDto> {
    const user = await this.usersService.getOrCreateUser(uuid);
    const jsonFile = await this.filesService.findById(createShareDto.fileId);

    // 计算过期时间
    let expiresAt: Date | null = null;
    if (createShareDto.expiryType === 'day') {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);
    } else if (createShareDto.expiryType === 'week') {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
    }

    // 创建分享记录
    const share = this.sharesRepository.create({
      id: uuidv4(),
      shareCode: nanoid(8), // 生成8位随机字符串
      userId: user.id,
      jsonFileId: jsonFile.id,
      expiresAt,
      status: 1,
    });

    const savedShare = await this.sharesRepository.save(share);

    return {
      id: savedShare.id,
      shareCode: savedShare.shareCode,
      fileName: jsonFile.fileName,
      expiresAt: savedShare.expiresAt,
      status: savedShare.status,
      createdAt: savedShare.createdAt,
    };
  }

  /**
   * 获取用户的所有分享
   * @param uuid 用户UUID
   * @returns 分享列表
   */
  async findUserShares(uuid: string): Promise<ShareResponseDto[]> {
    const user = await this.usersService.getOrCreateUser(uuid);

    const shares = await this.sharesRepository.find({
      where: { userId: user.id, status: 1 },
      relations: ['jsonFile'],
      order: { createdAt: 'DESC' },
    });

    return shares.map(share => ({
      id: share.id,
      shareCode: share.shareCode,
      fileName: share.jsonFile.fileName,
      expiresAt: share.expiresAt,
      status: share.status,
      createdAt: share.createdAt,
    }));
  }

  /**
   * 删除分享
   * @param uuid 用户UUID
   * @param shareId 分享ID
   */
  async deleteShare(uuid: string, shareId: string): Promise<void> {
    const user = await this.usersService.getOrCreateUser(uuid);

    const share = await this.sharesRepository.findOne({
      where: { id: shareId },
    });

    if (!share) throw new ApiException('分享不存在', 404);

    if (share.userId !== user.id) throw new ApiException('无权删除此分享', 403);

    // 软删除，将状态设为0
    share.status = 0;
    await this.sharesRepository.save(share);
  }

  /**
   * 通过分享码获取分享
   * @param shareCode 分享码
   * @returns 分享实体
   */
  async findByShareCode(shareCode: string): Promise<Share> {
    const share = await this.sharesRepository.findOne({
      where: { shareCode, status: 1 },
      relations: ['jsonFile'],
    });

    if (!share) throw new ApiException('分享不存在或已失效', 404);

    // 检查是否过期
    if (share.expiresAt && new Date() > share.expiresAt) {
      throw new ApiException('分享已过期', 400);
    }

    return share;
  }

  /**
   * 通过分享码获取JSON内容
   * @param shareCode 分享码
   * @returns JSON流
   */
  async getJsonContentByShareCode(shareCode: string): Promise<fs.ReadStream> {
    const share = await this.findByShareCode(shareCode);
    return this.filesService.getFileContentStream(share.jsonFileId);
  }

  /**
   * 通过分享码获取文件流
   * @param shareCode 分享码
   * @returns 文件流和文件名
   */
  async getFileStreamByShareCode(shareCode: string): Promise<{ stream: fs.ReadStream; fileName: string }> {
    const share = await this.findByShareCode(shareCode);
    const stream = await this.filesService.getFileBufferStream(share.jsonFileId);
    return {
      stream,
      fileName: share.jsonFile.fileName,
    };
  }
}
