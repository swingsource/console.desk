<template>
  <div v-if="visible" class="guide-mask">
    <div
      v-if="currentTarget"
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
export default {
  props: {
    steps: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      visible: false,
      currentStepIndex: 0,
      highlightStyle: {},
      tooltipStyle: {}
    }
  },
  computed: {
    currentStep() {
      return this.steps[this.currentStepIndex]
    },
    currentTarget() {
      if (!this.currentStep) return null
      return document.querySelector(this.currentStep.selector)
    }
  },
  mounted() {
    this.start()
    window.addEventListener('scroll', this.update, true)
    window.addEventListener('resize', this.update)
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.update, true)
    window.removeEventListener('resize', this.update)
  },
  methods: {
    start() {
      if (!this.steps.length) return
      this.visible = true
      this.$nextTick(this.update)
    },
    next() {
      if (this.currentStepIndex < this.steps.length - 1) {
        this.currentStepIndex++
        this.$nextTick(this.update)
      } else {
        this.finish()
      }
    },
    finish() {
      this.visible = false
    },
    update() {
      const target = this.currentTarget
      if (!target) return

      const rect = target.getBoundingClientRect()

      // 自动滚动到元素附近
      window.scrollTo({
        top: rect.top + window.scrollY - window.innerHeight / 4,
        behavior: 'smooth'
      })

      this.highlightStyle = {
        position: 'absolute',
        top: rect.top + window.scrollY + 'px',
        left: rect.left + window.scrollX + 'px',
        width: rect.width + 'px',
        height: rect.height + 'px',
        boxShadow: '0 0 0 4px rgba(255, 200, 0, 0.8)', // 高亮效果
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        backgroundColor: 'transparent',
        zIndex: 10001,
        pointerEvents: 'none'
      }

      this.tooltipStyle = {
        position: 'absolute',
        top: rect.bottom + window.scrollY + 10 + 'px',
        left: rect.left + window.scrollX + 'px',
        zIndex: 10002,
        background: '#fff',
        padding: '10px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        transition: 'all 0.3s ease'
      }

      // 复制元素
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
}

.tooltip-actions {
  margin-top: 8px;
  text-align: right;
}

.tooltip-actions button {
  margin-left: 8px;
}
</style>
