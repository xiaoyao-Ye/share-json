import { Context, Next } from 'koa';

interface AppError extends Error {
  status?: number;
}

export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
  } catch (error: unknown) {
    const err = error as AppError;
    console.error('服务器错误', err);
    
    ctx.status = err.status || 500;
    ctx.body = {
      success: false,
      message: err.message || '服务器内部错误'
    };
    
    ctx.app.emit('error', err, ctx);
  }
} 