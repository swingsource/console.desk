<template>
  <div v-if="visible" class="guide-mask">
    <div
      v-if="currentStep"
      :style="highlightStyle"
      class="highlight"
      ref="highlight"
    >
      <div ref="content"></div>
    </div>

    <div v-if="currentStep" :style="tooltipStyle" class="tooltip">
      <div class="tooltip-content">{{ currentStep.text }}</div>
      <div class="tooltip-actions">
        <button @click="next">下一步</button>
        <button @click="finish">跳过</button>
      </div>
    </div>
  </div>
</template>

<script>
import { guideManager } from './guideManager'

export default {
  data() {
    return {
      visible: false,
      currentStep: null,
      highlightStyle: {},
      tooltipStyle: {}
    }
  },
  created() {
    guideManager.init(this)
  },
  methods: {
    showStep(step) {
      this.currentStep = step
      this.visible = true
      this.$nextTick(this.updatePosition)
    },
    hide() {
      this.visible = false
      this.currentStep = null
    },
    next() {
      guideManager.next()
    },
    finish() {
      guideManager.finish()
    },
    updatePosition() {
      if (!this.currentStep) return

      const target = document.querySelector(this.currentStep.selector)
      if (!target) return

      const rect = target.getBoundingClientRect()

      this.highlightStyle = {
        position: 'absolute',
        top: rect.top + window.scrollY + 'px',
        left: rect.left + window.scrollX + 'px',
        width: rect.width + 'px',
        height: rect.height + 'px',
        boxShadow: '0 0 0 4px rgba(255, 200, 0, 0.8)',
        borderRadius: '8px',
        pointerEvents: 'none',
        backgroundColor: 'transparent',
        zIndex: 10001
      }

      this.tooltipStyle = {
        position: 'absolute',
        top: rect.bottom + window.scrollY + 10 + 'px',
        left: rect.left + window.scrollX + 'px',
        zIndex: 10002,
        background: '#fff',
        padding: '10px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }

      const content = this.$refs.content
      if (content) {
        content.innerHTML = ''
        const clone = target.cloneNode(true)
        content.appendChild(clone)
      }
    }
  }
}
</script>

<style scoped>
/* 同上 */
</style>
