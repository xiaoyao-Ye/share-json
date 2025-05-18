/**
 * 文件哈希计算 Web Worker
 * 使用SubtleCrypto API计算SHA-256哈希
 */

self.onmessage = async function (e) {
  try {
    const file = e.data

    // 使用SubtleCrypto API计算SHA-256哈希
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)

    // 转换为十六进制字符串
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

    // 返回结果
    self.postMessage({
      success: true,
      hash: hashHex,
    })
  } catch (error: any) {
    self.postMessage({
      success: false,
      error: error.message || '计算哈希失败',
    })
  }
}
