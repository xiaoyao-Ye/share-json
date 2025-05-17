import { createVNode, render } from 'vue'
import Notification from '../components/Notification.vue'

export interface ShowNotificationOptions {
  message: string
  description?: string
  type?: 'success' | 'error' | 'info'
}

export function useNotification() {
  /**
   * 显示通知
   */
  function show(options: ShowNotificationOptions) {
    const container = document.createElement('div')

    const vnode = createVNode(Notification, {
      ...options,
      onDestroy: () => {
        // 移除DOM节点
        render(null, container)
        if (document.body.contains(container)) {
          document.body.removeChild(container)
        }
      },
    })

    // 渲染到DOM
    render(vnode, container)
    document.body.appendChild(container)

    return {
      close: () => {
        // 使用组件实例中的close方法
        if (vnode.component && vnode.component.exposed) {
          ;(vnode.component.exposed as any).close()
        } else {
          // 备用方法：直接移除DOM
          render(null, container)
          if (document.body.contains(container)) {
            document.body.removeChild(container)
          }
        }
      },
    }
  }

  /**
   * 显示成功通知
   */
  function success(message: string, description?: string) {
    return show({ message, description, type: 'success' })
  }

  /**
   * 显示错误通知
   */
  function error(message: string, description?: string) {
    return show({ message, description, type: 'error' })
  }

  /**
   * 显示信息通知
   */
  function info(message: string, description?: string) {
    return show({ message, description, type: 'info' })
  }

  return {
    show,
    success,
    error,
    info,
  }
}
