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

    <div
      v-if="currentStep"
      :class="['tooltip', currentPlacement]"
      :style="tooltipStyle"
    >
      <div class="tooltip-content">{{ currentStep.text }}</div>
      <div class="tooltip-actions">
        <button @click="next">下一步</button>
        <button @click="finish">跳过</button>
      </div>
      <div class="arrow"></div>
    </div>
  </div>
</template>

<script>
import { guideManager } from '../guide3/guideManager'

export default {
  data() {
    return {
      visible: false,
      currentStep: null,
      highlightStyle: {},
      tooltipStyle: {},
      currentPlacement: 'bottom' // 默认 placement
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
      const scrollY = window.scrollY
      const scrollX = window.scrollX

      this.highlightStyle = {
        position: 'absolute',
        top: rect.top + scrollY + 'px',
        left: rect.left + scrollX + 'px',
        width: rect.width + 'px',
        height: rect.height + 'px',
        boxShadow: '0 0 0 4px rgba(255, 200, 0, 0.8)',
        borderRadius: '8px',
        pointerEvents: 'none',
        backgroundColor: 'transparent',
        zIndex: 10001
      }

      // 自动判断放置方向
      let placement = 'bottom'
      if (rect.top > window.innerHeight / 2) {
        placement = 'top'
      }

      this.currentPlacement = placement

      const tooltipTop =
        placement === 'top'
          ? rect.top + scrollY - 70 // 上方
          : rect.bottom + scrollY + 10 // 下方

      this.tooltipStyle = {
        position: 'absolute',
        top: tooltipTop + 'px',
        left: rect.left + scrollX + 'px',
        zIndex: 10002,
        background: '#fff',
        padding: '10px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        transform: 'translateX(-50%)',
        transition: 'all 0.3s ease',
        minWidth: '200px'
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
.guide-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
}

.highlight {
  position: absolute;
}

.tooltip {
  position: absolute;
  background: white;
  padding: 12px;
  border-radius: 6px;
  max-width: 250px;
  text-align: center;
  position: absolute;
}

.tooltip-content {
  padding-bottom: 8px;
}

.tooltip-actions {
  margin-top: 8px;
  text-align: right;
}

.tooltip-actions button {
  margin-left: 8px;
}

/* 箭头基本样式 */
.tooltip .arrow {
  width: 0;
  height: 0;
  border-style: solid;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

/* 根据不同方向显示箭头 */
.tooltip.bottom .arrow {
  top: -8px;
  border-width: 0 8px 8px 8px;
  border-color: transparent transparent #fff transparent;
}

.tooltip.top .arrow {
  bottom: -8px;
  border-width: 8px 8px 0 8px;
  border-color: #fff transparent transparent transparent;
}
</style>
