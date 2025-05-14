import { Context } from 'koa';
import { ShareService } from '../services/ShareService';
import { ExpiryType } from '../entities/Share';

export class ShareController {
  private shareService: ShareService;

  constructor() {
    this.shareService = new ShareService();
  }

  // 创建分享
  createShare = async (ctx: Context) => {
    try {
      const userId = ctx.headers['x-user-id'] as string;
      if (!userId) {
        ctx.status = 401;
        ctx.body = { success: false, message: '未授权' };
        return;
      }

      const { fileName, jsonContent, expiryType } = ctx.request.body as {
        fileName: string;
        jsonContent: string;
        expiryType: ExpiryType;
      };

      // 验证请求数据
      if (!fileName || !jsonContent) {
        ctx.status = 400;
        ctx.body = { success: false, message: '文件名和JSON内容不能为空' };
        return;
      }

      // 验证JSON内容是否有效
      try {
        JSON.parse(jsonContent);
      } catch (error) {
        ctx.status = 400;
        ctx.body = { success: false, message: '无效的JSON内容' };
        return;
      }

      const share = await this.shareService.createShare(
        userId,
        fileName,
        jsonContent,
        expiryType || ExpiryType.SEVEN_DAYS
      );

      ctx.status = 201;
      ctx.body = {
        success: true,
        data: {
          id: share.id,
          fileName: share.fileName,
          expiryType: share.expiryType,
          expiresAt: share.expiresAt,
          createdAt: share.createdAt
        }
      };
    } catch (error) {
      console.error('创建分享失败', error);
      ctx.status = 500;
      ctx.body = { success: false, message: '服务器错误' };
    }
  };

  // 获取分享
  getShare = async (ctx: Context) => {
    try {
      const { id } = ctx.params;
      const share = await this.shareService.getShareById(id);

      if (!share) {
        ctx.status = 404;
        ctx.body = { success: false, message: '分享不存在或已过期' };
        return;
      }

      const jsonData = await this.shareService.getJsonContent(id);
      
      if (!jsonData) {
        ctx.status = 404;
        ctx.body = { success: false, message: '无法读取文件内容' };
        return;
      }

      ctx.body = {
        success: true,
        data: {
          id: share.id,
          fileName: share.fileName,
          content: jsonData.content,
          expiryType: share.expiryType,
          expiresAt: share.expiresAt,
          createdAt: share.createdAt
        }
      };
    } catch (error) {
      console.error('获取分享失败', error);
      ctx.status = 500;
      ctx.body = { success: false, message: '服务器错误' };
    }
  };

  // 获取用户的所有分享
  getUserShares = async (ctx: Context) => {
    try {
      const userId = ctx.headers['x-user-id'] as string;
      if (!userId) {
        ctx.status = 401;
        ctx.body = { success: false, message: '未授权' };
        return;
      }

      const shares = await this.shareService.getUserShares(userId);

      ctx.body = {
        success: true,
        data: shares.map(share => ({
          id: share.id,
          fileName: share.fileName,
          expiryType: share.expiryType,
          expiresAt: share.expiresAt,
          createdAt: share.createdAt
        }))
      };
    } catch (error) {
      console.error('获取用户分享列表失败', error);
      ctx.status = 500;
      ctx.body = { success: false, message: '服务器错误' };
    }
  };

  // 删除分享
  deleteShare = async (ctx: Context) => {
    try {
      const userId = ctx.headers['x-user-id'] as string;
      if (!userId) {
        ctx.status = 401;
        ctx.body = { success: false, message: '未授权' };
        return;
      }

      const { id } = ctx.params;
      const success = await this.shareService.deleteShare(id, userId);

      if (!success) {
        ctx.status = 404;
        ctx.body = { success: false, message: '分享不存在或无权删除' };
        return;
      }

      ctx.body = {
        success: true,
        message: '分享已删除'
      };
    } catch (error) {
      console.error('删除分享失败', error);
      ctx.status = 500;
      ctx.body = { success: false, message: '服务器错误' };
    }
  };
} 