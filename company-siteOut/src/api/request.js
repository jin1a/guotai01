import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useUserStore } from '@/stores/user'

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    // 如果返回的不是二进制数据，则判断返回状态
    if(!(response.config.responseType === 'blob')) {
      if (res.code !== 200) {
        // 处理业务错误
        ElMessage.error(res.message || '系统错误')
        
        // 处理token过期
        if (res.code === 401) {
          const userStore = useUserStore()
          userStore.logout().then(() => {
            router.push('/login')
          })
          //refrestoken获取token

        }
        return Promise.reject(new Error(res.message || '系统错误'))
      }
      return res.data
    }
    return response.data
  },
  error => {
    console.error('响应错误:', error)
    const message = error.response?.data?.message || error.message
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default service 