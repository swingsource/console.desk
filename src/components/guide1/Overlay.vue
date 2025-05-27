<template>
  <div v-show="visible" :style="style" class="overlay-container" ref="overlay">
    <div ref="content"></div>
  </div>
</template>

<script>
export default {
  props: {
    targetSelector: { type: String, required: true }
  },
  data() {
    return {
      visible: false,
      style: {}
    }
  },
  mounted() {
    this.copyTarget()
  },
  methods: {
    copyTarget() {
      const target = document.querySelector(this.targetSelector)
      console.log('>>>>>>>>>> ', target)
      if (!target) {
        console.warn('Target not found')
        return
      }

      const clone = target.cloneNode(true)
      const rect = target.getBoundingClientRect()

      this.style = {
        position: 'absolute',
        top: rect.top + window.scrollY + 'px',
        left: rect.left + window.scrollX + 'px',
        width: rect.width + 'px',
        height: rect.height + 'px',
        pointerEvents: 'none', // 可选：让浮层元素不阻挡鼠标
        zIndex: 9999
      }

      console.log(this.$refs)

      this.$refs.content.innerHTML = ''
      this.$refs.content.appendChild(clone)
      this.visible = true
    }
  }
}
</script>

<style scoped>
.overlay-container {
  /* 可加点高亮特效 */
  background: #eeeeee;
}
</style>
