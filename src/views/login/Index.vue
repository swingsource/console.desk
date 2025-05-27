<template>
  <div class="index">
    <!-- 遮罩层 -->
    <div class="shadow"></div>
    <!-- 内容区 -->
    <div class="content"></div>
    <!-- 切换状态 -->
    <div
      class="switch"
      :class="{ 'switch-turn-around': turnAround }"
      @click="handleSwitchStatus"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'Index',
  data() {
    return {
      turnAround: false
    }
  },
  methods: {
    handleSwitchStatus() {
      this.turnAround = !this.turnAround
    }
  }
}
</script>

<style scoped lang="stylus">
.index
  position relative
  width 100%
  height 100%
  background white
  .shadow
    position relative
    width 100%
    height 100%
    transform skewX(-12deg) translate3d(-55%, 0, 0)
    background dodgerblue
    z-index 2
  .content
    background #fff
  .switch
    position absolute
    top -110px
    right -110px
    width 220px
    height 220px
    border-radius 50%
    background dodgerblue
    transform-origin 42% 58%
    transition all 1.2s ease-in-out
    &::before
      content ''
      position absolute
      top 162px
      left -50px
      width 30px
      height 30px
      border-radius 50%
      background dodgerblue
    &::after
      content ''
      position absolute
      left 24px
      bottom -100px
      width 60px
      height 60px
      border-radius 50%
      background dodgerblue
    &.switch-turn-around
      transform rotate(360deg)
</style>
