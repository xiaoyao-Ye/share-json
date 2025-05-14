import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { initializeDatabase } from './config/database';
import shareRoutes from './routes/share';
import { errorHandler } from './middleware/errorHandler';
import { userIdentity } from './middleware/userIdentity';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const app = new Koa();
const PORT = process.env.PORT || 3000;

// 错误处理中间件
app.use(errorHandler);

// 请求正文解析
app.use(bodyParser({
  enableTypes: ['json'],
  jsonLimit: '20mb',
}));

// 用户识别中间件
app.use(userIdentity);

// 注册路由
app.use(shareRoutes.routes());
app.use(shareRoutes.allowedMethods());

// 启动服务器
const startServer = async () => {
  try {
    // 初始化数据库连接
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`服务器已启动，端口: ${PORT}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer(); 