import { Context, Next } from 'koa';
import { v4 as uuidv4 } from 'uuid';

export async function userIdentity(ctx: Context, next: Next) {
  // 从请求头中获取用户ID
  let userId = ctx.headers['x-user-id'] as string;
  
  // 如果没有用户ID，生成一个新的UUID
  if (!userId) {
    userId = uuidv4();
    ctx.set('X-User-Id', userId);
  }
  
  // 将用户ID添加到请求上下文中
  ctx.state.userId = userId;
  
  await next();
} 