<template>
  <div class="home">
    <div>{{ numA }}</div>
    <div>{{ numB }}</div>
    <div>{{ sum }}</div>
    <button @click="handleAddA">numA++</button>

    <div class="flex">
      <div class="flex-item">a</div>
      <div class="flex-item">b</div>
      <div class="flex-item">c</div>
    </div>

    <div class="test-show" v-show="show" style="display: block"></div>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Home',
  data() {
    return {
      numA: 0,
      numB: 0,
      show: false
    }
  },
  computed: {
    sum() {
      return this.numA + this.numB
    }
  },
  watch: {
    sum(nv, ov) {
      console.log('sum改变了>>>>>>>>>>>>>>>>>>>>' + ov + '->' + nv)
    }
  },
  methods: {
    handleAddA() {
      this.numA++
    }
  }
}
</script>

<style lang="stylus">
.flex
  width 200px
  height 100px
  border 1px solid red
  display flex
  .flex-item
    width 80px
    height 80px
    background deepskyblue
.test-show
  display block
  width 100px
  height 100px
  background aqua
</style>
