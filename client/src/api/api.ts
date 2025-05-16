import { getUserId } from '../lib/user-utils'
import { apiClient } from './api-client'

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

// API函数

/**
 * 识别用户（获取或创建用户）
 */
export async function identifyUser() {
  return apiClient.get('/users/identify')
}

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
 * 获取当前用户ID
 */
export function getCurrentUserId(): string {
  return getUserId()
}

// 检查分享是否属于当前用户
export function isOwnShare(_share: ShareItem): boolean {
  // 由于我们使用X-User-ID标头，无需比较userId
  // 所有返回的shares都应该属于当前用户
  return true
}

// 检查分享是否过期
export function isShareExpired(share: ShareItem): boolean {
  if (!share.expiresAt)
    return false // 永久有效

  const expireDate = new Date(share.expiresAt)
  const now = new Date()

  return expireDate < now
}
