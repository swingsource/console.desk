<template>
  <div v-if="visible" class="guide-container">
    <div class="guide-mask" :style="maskStyle"></div>

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
      maskStyle: {},
      tooltipStyle: {},
      currentPlacement: 'bottom'
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

      const highlightPadding = 8 // 高亮区域额外留白

      const highlight = {
        top: rect.top + scrollY - highlightPadding,
        left: rect.left + scrollX - highlightPadding,
        width: rect.width + highlightPadding * 2,
        height: rect.height + highlightPadding * 2
      }

      // 生成遮罩的镂空路径（用 clip-path）
      const clipPath = `polygon(
      0% 0%,
      0% 100%,
      ${highlight.left}px 100%,
      ${highlight.left}px ${highlight.top}px,
      ${highlight.left + highlight.width}px ${highlight.top}px,
      ${highlight.left + highlight.width}px ${
        highlight.top + highlight.height
      }px,
      ${highlight.left}px ${highlight.top + highlight.height}px,
      ${highlight.left}px 100%,
      100% 100%,
      100% 0
      )`

      this.maskStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        clipPath,
        pointerEvents: 'auto',
        zIndex: 10000
      }

      // 判断浮层位置
      let placement = 'bottom'
      if (rect.top > window.innerHeight / 2) {
        placement = 'top'
      }
      this.currentPlacement = placement

      const tooltipTop =
        placement === 'top'
          ? rect.top + scrollY - 100
          : rect.bottom + scrollY + 10

      this.tooltipStyle = {
        position: 'absolute',
        top: tooltipTop + 'px',
        left: rect.left + scrollX + rect.width / 2 + 'px',
        transform: 'translateX(-50%)',
        zIndex: 10002,
        background: '#fff',
        padding: '10px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        minWidth: '200px'
      }
    }
  }
}
</script>

<style scoped>
.guide-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none; /* 整个容器不阻挡，只有遮罩和浮层有 pointer events */
}

.guide-mask {
  pointer-events: auto; /* 蒙层可以阻止点击，镂空部分不会阻止 */
}

/* tooltip */
.tooltip {
  pointer-events: auto;
  background: white;
  padding: 10px;
  border-radius: 6px;
  text-align: center;
}

.tooltip-content {
  margin-bottom: 8px;
}

.tooltip-actions {
  margin-top: 8px;
  text-align: right;
}

.tooltip-actions button {
  margin-left: 8px;
}

/* 箭头 */
.tooltip .arrow {
  width: 0;
  height: 0;
  border-style: solid;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

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
