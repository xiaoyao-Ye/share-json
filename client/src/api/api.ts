import { apiClient } from '.'
import { getUserId } from '../lib/user-utils'

// 接口定义
export interface ShareFile {
  id: string
  fileName: string
  fileSize: number
  uploadedAt: string
}

export interface ShareItem {
  id: string
  shareCode: string
  fileName: string
  expiresAt: string | null
  status: number
  createdAt: string
}

export type ExpiryType = 'day' | 'week' | 'permanent'

export interface CreateShareRequest {
  fileId: string
  expiryType: ExpiryType
}

export interface JsonContent {
  [key: string]: any
}

// Worker 回调类型定义
export interface WorkerProgressCallback {
  (currentSize: number, chunk: string): void
}

export interface WorkerDataCallback {
  (data: JsonContent): void
}

export interface WorkerErrorCallback {
  (error: string, details?: string): void
}

// API函数

/**
 * 上传JSON文件
 */
export async function uploadJsonFile(file: FormData): Promise<ShareFile> {
  return apiClient.post('/files/upload', file, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

/**
 * 创建分享
 */
export async function createShare(data: CreateShareRequest): Promise<ShareItem> {
  return apiClient.post('/shares', data)
}

/**
 * 获取当前用户的所有分享
 */
export async function getUserShares(): Promise<ShareItem[]> {
  return apiClient.get('/shares/mine')
}

/**
 * 删除分享
 */
export async function deleteShare(shareId: string): Promise<void> {
  return apiClient.delete(`/shares/${shareId}`)
}

/**
 * 通过分享码获取JSON内容
 */
export async function getJsonContentByShareCode(shareCode: string): Promise<JsonContent> {
  return apiClient.get(`/shares/${shareCode}`)
}

/**
 * 下载分享的JSON文件
 * 返回文件的URL，可用于下载
 */
export function getShareDownloadUrl(shareCode: string): string {
  return `${apiClient.defaults.baseURL}/shares/${shareCode}/download`
}

/**
 * 使用Web Worker流式获取JSON内容
 */
export function getJsonContentStreamByShareCode(
  shareCode: string,
  onStart?: () => void,
  onProgress?: WorkerProgressCallback,
  onComplete?: WorkerDataCallback,
  onError?: WorkerErrorCallback,
): () => void {
  const worker = new Worker(new URL('../workers/json-parser.worker.ts', import.meta.url), {
    type: 'module',
  })

  worker.onmessage = ({ data: { type, data, error, details, currentSize, chunk } }) => {
    switch (type) {
      case 'start':
        onStart?.()
        break
      case 'progress':
        onProgress?.(currentSize, chunk)
        break
      case 'complete':
        onComplete?.(data)
        worker.terminate()
        break
      case 'error':
        onError?.(error, details)
        worker.terminate()
        break
    }
  }

  worker.onerror = (error) => {
    onError?.('Worker错误', error.message)
    worker.terminate()
  }

  const url = `${apiClient.defaults.baseURL}/shares/${shareCode}`
  worker.postMessage({ url, userId: getUserId() })

  return () => worker.terminate()
}
