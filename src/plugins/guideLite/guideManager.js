// import Vue from 'vue'
import GuideOverlay from './GuideOverlay.vue'

class GuideManager {
  constructor() {
    this.steps = []
    this.options = {}
    this.currentIndex = 0
    this.vm = null
  }

  install(Vue) {
    // 创建浮层组件挂载实例
    const GuideConstructor = Vue.extend(GuideOverlay)
    this.vm = new GuideConstructor()
    this.vm.$mount()
    document.body.appendChild(this.vm.$el)

    // 全局 API
    Vue.prototype.$guide = this
  }

  setSteps(steps = [], options = {}) {
    this.steps = steps
    this.options = options
  }

  async start() {
    if (this.options.onStart) this.options.onStart()
    this.currentIndex = 0
    await this.showStep()
  }

  async showStep() {
    const step = this.steps[this.currentIndex]
    if (!step) return this.finish()

    const selectors = Array.isArray(step.selector)
      ? step.selector
      : [step.selector]
    const exist = await Promise.all(selectors.map(this.waitForElement))
    if (exist.some(el => !el)) {
      this.next() // 跳过不存在的
    } else {
      this.vm.showStep(step)
      if (this.options.onStepChange) {
        this.options.onStepChange(this.currentIndex, step)
      }
    }
  }

  async waitForElement(selector, timeout = 5000) {
    const start = Date.now()
    return new Promise(resolve => {
      const check = () => {
        const el = document.querySelector(selector)
        if (el) return resolve(el)
        if (Date.now() - start > timeout) return resolve(null)
        requestAnimationFrame(check)
      }
      check()
    })
  }

  next() {
    this.currentIndex++
    if (this.currentIndex >= this.steps.length) {
      this.finish()
    } else {
      this.showStep()
    }
  }

  finish() {
    if (this.vm) this.vm.hide()
    if (this.options.onFinish) this.options.onFinish()
  }
}

export const guideManager = new GuideManager()
