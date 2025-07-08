//在组件销毁时应当删除订阅的事件，避免挂载多个事件
class Bus {
  constructor() {
    this.callback = {}
  }
  on(name, val) {
    this.callback[name] = this.callback[name] || []
    this.callback[name].push(val)
  }
  async emit(name, args) {
    if (this.callback[name]) {
      return await Promise.all(this.callback[name].map(cb => cb(args)))
    }
  }
  off(name) {
    if (this.callback[name]) {
      delete this.callback[name]
    }
  }
}

export default Bus
