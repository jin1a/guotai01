import axios from 'axios'
import { Dialog, Toast } from 'vant'

// 创建axios实例
const service = axios.create({
  timeout: 66666666 // 请求超时时间
})
let cancelToken = axios.CancelToken
let reqCancel = null
// request拦截器
service.interceptors.request.use(
  (config) => {
    if (!config.cancelToken) {
      config.cancelToken = new cancelToken(function executor(c) {
        // executor 函数接收一个 cancel 函数作为参数
        reqCancel = c
      })
    }
    Toast.loading()
    config.headers['token'] = window.localStorage.getItem('token')
    return config
  },
  (error) => {
    Toast.loading().clear()
    // Do something with request error
    Promise.reject(error)
  }
)

// respone拦截器
service.interceptors.response.use(
  (response) => {
    Toast.loading().clear()
    const res = response.data
    if (typeof res.sts !== 'undefined') {
      return res
    }
    if (res.code === '000' || res.code === '999') {
      return res
    }
    console.log('response', res)
    if (res.content && res.content.code != 0) {
      // if(!)
      //noFail 表示不需要统一处理错误提示，需要给调用接口返回
      if (!response.config.noFail) {
        if (res.content.code == 40001) {
          Dialog.confirm({
            confirmButtonText: '重新登录',
            message: '你已被登出，可以取消继续留在该页面，或者重新登录'
          }).then(() => {
            //eslint-disable-next-line
            EWebBridge.webCallAppInJs('bridge', { flag: 'login' })
          })
        } else {
          console.log('res.content.message', res.content.message)
          Toast(res.content.message ? res.content.message : '未知异常')
        }
        return Promise.reject(res)
      } else {
        return res.content
      }
    } else {
      Toast.clear()
      if (res.content) {
        return res.content
      } else {
        Toast({
          icon: 'warning-o',
          message: '接口服务异常'
        })
      }
    }
  },
  (error) => {
    Toast(error.message ? error.message : '未知异常')
    return Promise.reject(error)
  }
)

export function cancel() {
  return reqCancel('取消频繁请求')
}

export function post(urls, data, config = {}) {
  return service.post(urls, data, config)
}

export function get(urls, params, config = {}) {
  return service.get(urls, {
    params,
    ...config
  })
}

export function put(urls, data, config = {}) {
  return service.put(urls, data, config)
}

export function del(urls, data, config = {}) {
  return service.delete(urls, {
    params: data,
    data,
    ...config
  })
}
export default service
