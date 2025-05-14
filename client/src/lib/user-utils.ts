import { v4 as uuidv4 } from 'uuid'

// 从 localStorage 获取或创建用户 ID
export function getUserId(): string {
  const storageKey = 'json-share-user-id'
  let userId = localStorage.getItem(storageKey)

  if (!userId) {
    userId = uuidv4()
    localStorage.setItem(storageKey, userId)
  }

  return userId
}

// 向请求头中添加用户 ID
export function addUserIdToHeaders(headers: Headers): Headers {
  const userId = getUserId()
  headers.append('X-User-ID', userId)
  return headers
}
