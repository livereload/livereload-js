export default class Timer {
  constructor(func) {
    this.func = func
    this.running = false
    this.id = null
    this._tick = this._tick.bind(this)
  }

  start(timeout) {
    if (this.running) {
      clearTimeout(this.id)
    }
    this.id = setTimeout(this._tick, timeout)
    this.running = true
  }

  stop() {
    if (this.running) {
      clearTimeout(this.id)
      this.running = false
      this.id = null
    }
  }

  _tick() {
    this.running = false
    this.id = null
    this.func()
  }

  static start(timeout, func) {
    setTimeout(func, timeout)
  }
}

