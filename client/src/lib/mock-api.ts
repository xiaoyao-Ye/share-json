import { v4 as uuidv4 } from 'uuid'

// 模拟存储
let shares: any[] = []

// 辅助函数，模拟 API 延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 创建新分享
export async function mockCreateShare(shareData: any) {
  await delay(800) // 模拟网络延迟

  const share = {
    id: uuidv4(),
    userId: shareData.userId,
    filename: shareData.filename,
    content: shareData.content,
    createdAt: new Date().toISOString(),
    expiresAt: shareData.expiresAt,
  }

  shares.push(share)

  // 保存到 localStorage 以持久化
  const storedShares = JSON.parse(localStorage.getItem('json-shares') || '[]')
  storedShares.push(share)
  localStorage.setItem('json-shares', JSON.stringify(storedShares))

  return share
}

// 通过 ID 获取分享
export async function mockGetShareById(id: string) {
  await delay(500) // 模拟网络延迟

  // 从 localStorage 加载以持久化
  const storedShares = JSON.parse(localStorage.getItem('json-shares') || '[]')
  shares = storedShares

  return shares.find(share => share.id === id) || null
}

// 获取用户所有分享
export async function mockGetUserShares(userId: string) {
  await delay(600) // 模拟网络延迟

  // 从 localStorage 加载以持久化
  const storedShares = JSON.parse(localStorage.getItem('json-shares') || '[]')
  shares = storedShares

  return shares
    .filter(share => share.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// 删除分享
export async function mockDeleteShare(id: string, userId: string) {
  await delay(500) // 模拟网络延迟

  // 从 localStorage 加载以持久化
  const storedShares = JSON.parse(localStorage.getItem('json-shares') || '[]')
  shares = storedShares

  // 过滤掉要删除的分享
  const updatedShares = shares.filter(share => !(share.id === id && share.userId === userId))

  // 更新 localStorage
  localStorage.setItem('json-shares', JSON.stringify(updatedShares))

  shares = updatedShares

  return { success: true }
}
