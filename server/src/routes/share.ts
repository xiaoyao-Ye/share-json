import Router from 'koa-router';
import { ShareController } from '../controllers/ShareController';

const router = new Router({ prefix: '/api/shares' });
const shareController = new ShareController();

// 创建分享
router.post('/', shareController.createShare);

// 获取分享
router.get('/:id', shareController.getShare);

// 获取用户的所有分享
router.get('/', shareController.getUserShares);

// 删除分享
router.delete('/:id', shareController.deleteShare);

export default router; 