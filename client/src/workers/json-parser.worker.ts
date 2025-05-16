/**
 * JSON解析Web Worker
 * 用于在单独线程解析大型JSON数据流
 */

// 处理来自主线程的消息
globalThis.onmessage = async (event) => {
  const { url, userId } = event.data

  try {
    // 获取流数据
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-User-ID': userId || '',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      globalThis.postMessage({
        type: 'error',
        error: `请求失败: ${response.status} ${response.statusText}`,
        details: errorText,
      })
      return
    }

    // 通知主线程开始处理
    globalThis.postMessage({ type: 'start' })

    // 获取ReadableStream
    const reader = response.body?.getReader()
    if (!reader)
      throw new Error('无法获取响应流')

    let jsonText = ''
    const decoder = new TextDecoder()

    // 处理流数据
    while (true) {
      const { done, value } = await reader.read()
      if (done)
        break

      const chunk = decoder.decode(value, { stream: true })
      jsonText += chunk

      // 定期向主线程发送进度更新
      globalThis.postMessage({
        type: 'progress',
        currentSize: jsonText.length,
        chunk,
      })
    }

    // 最终解码确保完整性
    jsonText += decoder.decode()

    try {
      // 解析完整的JSON数据
      const jsonData = JSON.parse(jsonText)

      // 返回结果给主线程
      globalThis.postMessage({
        type: 'complete',
        data: jsonData,
        size: jsonText.length,
      })
    }
    catch (parseError: unknown) {
      const errorMessage = parseError instanceof Error ? parseError.message : '未知解析错误'
      globalThis.postMessage({
        type: 'error',
        error: '解析JSON失败',
        details: errorMessage,
      })
    }
  }
  catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    globalThis.postMessage({
      type: 'error',
      error: '处理JSON流时出错',
      details: errorMessage,
    })
  }
}
