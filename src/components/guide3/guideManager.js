import Vue from 'vue'

const GuideBus = new Vue() // 全局事件总线

class GuideManager {
  constructor() {
    this.steps = [] // 全部引导步骤
    this.index = 0 // 当前步骤下标
    this.active = false // 是否正在引导
    this.overlay = null // GuideOverlay 实例
  }

  init(overlayInstance) {
    this.overlay = overlayInstance
  }

  setSteps(steps) {
    this.steps = steps
    this.index = 0
  }

  start() {
    if (!this.steps.length) return
    this.active = true
    this.goStep(0)
  }

  async goStep(stepIndex) {
    if (stepIndex >= this.steps.length) {
      this.finish()
      return
    }

    this.index = stepIndex
    const step = this.steps[stepIndex]

    // 等待目标元素挂载
    await this.waitForElement(step.selector)

    if (this.overlay) {
      this.overlay.showStep(step)
    }
  }

  next() {
    this.goStep(this.index + 1)
  }

  finish() {
    this.active = false
    if (this.overlay) {
      this.overlay.hide()
    }
  }

  // 等待目标元素出现
  waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const start = Date.now()
      const check = () => {
        const el = document.querySelector(selector)
        if (el) {
          resolve(el)
        } else if (Date.now() - start > timeout) {
          reject('Timeout: Element not found ' + selector)
        } else {
          requestAnimationFrame(check)
        }
      }
      check()
    })
  }
}

export const guideManager = new GuideManager()
export const GuideEventBus = GuideBus
