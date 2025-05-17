import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import axios from 'axios'
import { getUserId } from '../lib/user-utils'

// API基础URL配置
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

// 创建axios实例
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加用户ID到请求头
apiClient.interceptors.request.use(
  (config) => {
    // 确保headers存在
    config.headers = config.headers || {}

    // 添加用户ID到请求头
    const userId = getUserId()
    config.headers['X-User-ID'] = userId

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器 - 处理常见错误
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    if (res.code !== 200) {
      return Promise.reject(new Error(res.message))
    }

    return res.data
  },
  (error: AxiosError) => {
    const status = error.response?.status

    // 错误消息
    let message = '发生错误，请稍后再试'

    if (
      error.response?.data &&
      typeof error.response.data === 'object' &&
      'message' in error.response.data
    ) {
      message = String(error.response.data.message)
    } else if (error.message) {
      message = error.message
    }

    // 根据状态码处理不同错误
    switch (status) {
      case 400:
        console.error('请求参数错误', message)
        break
      case 401:
        console.error('未授权', message)
        break
      case 403:
        console.error('没有权限', message)
        break
      case 404:
        console.error('资源不存在', message)
        break
      case 500:
        console.error('服务器错误', message)
        break
      default:
        if (!navigator.onLine) {
          console.error('网络连接已断开')
        } else {
          console.error('未知错误', message)
        }
        break
    }

    return Promise.reject(new Error(message))
  },
)
