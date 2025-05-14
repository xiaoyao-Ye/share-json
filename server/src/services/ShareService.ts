import { Repository } from 'typeorm';
import { Share, ExpiryType } from '../entities/Share';
import { AppDataSource } from '../config/database';
import fs from 'fs';
import path from 'path';

export class ShareService {
  private shareRepository: Repository<Share>;
  private uploadDir: string;

  constructor() {
    this.shareRepository = AppDataSource.getRepository(Share);
    this.uploadDir = path.join(process.cwd(), 'uploads');
    
    // 确保上传目录存在
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  // 创建分享
  async createShare(
    userId: string,
    fileName: string,
    jsonContent: string,
    expiryType: ExpiryType
  ): Promise<Share> {
    // 计算过期时间
    let expiresAt: Date | null = null;
    
    if (expiryType === ExpiryType.ONE_DAY) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);
    } else if (expiryType === ExpiryType.SEVEN_DAYS) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
    }
    
    // 保存文件
    const filePath = path.join(this.uploadDir, `${Date.now()}_${fileName}`);
    fs.writeFileSync(filePath, jsonContent);
    
    // 创建分享记录
    const share = new Share();
    share.userId = userId;
    share.fileName = fileName;
    share.filePath = filePath;
    share.expiryType = expiryType;
    share.expiresAt = expiresAt;
    
    return this.shareRepository.save(share);
  }

  // 获取分享
  async getShareById(id: string): Promise<Share | null> {
    const share = await this.shareRepository.findOne({ 
      where: { 
        id,
        isDeleted: false
      } 
    });
    
    if (!share) {
      return null;
    }
    
    // 检查是否过期
    if (share.expiresAt && new Date() > share.expiresAt) {
      return null;
    }
    
    return share;
  }

  // 获取用户的所有分享
  async getUserShares(userId: string): Promise<Share[]> {
    return this.shareRepository.find({
      where: {
        userId,
        isDeleted: false
      },
      order: {
        createdAt: 'DESC'
      }
    });
  }

  // 删除分享
  async deleteShare(id: string, userId: string): Promise<boolean> {
    const share = await this.shareRepository.findOne({
      where: { 
        id,
        userId,
        isDeleted: false
      }
    });
    
    if (!share) {
      return false;
    }
    
    share.isDeleted = true;
    await this.shareRepository.save(share);
    return true;
  }

  // 获取JSON内容
  async getJsonContent(shareId: string): Promise<{ content: string; fileName: string } | null> {
    const share = await this.getShareById(shareId);
    
    if (!share) {
      return null;
    }
    
    try {
      const content = fs.readFileSync(share.filePath, 'utf-8');
      return { 
        content,
        fileName: share.fileName
      };
    } catch (error) {
      console.error('读取文件失败', error);
      return null;
    }
  }
} 