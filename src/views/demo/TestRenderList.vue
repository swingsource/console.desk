<template>
  <div>
    <div>
      <h3>render函数，由内到外，无slot</h3>
      <my-render-list :items="list" @row-click="onRowClick" />
    </div>
    <div>
      <h3>render函数，由内到外，有slot - 没使用slot</h3>
      <my-render-list-slot :items="list" @row-click="onRowClick" />
    </div>
    <div>
      <h3>render函数，由内到外，有slot - 使用slot</h3>
      <my-render-list-slot :items="list" @row-click="onRowClick">
        <template v-slot:row="{ item, index, click }">
          <!-- 这里就是你自定义的一行结构 -->
          <span style="width: 40px; display:inline-block; text-align:right;">
            {{ index + 1 }}.
          </span>
          <strong style="margin: 0 8px;">{{ item.name }}</strong>
          <span style="color: #999;">(自定义内容)</span>
          <button style="margin-left:auto;" @click="click">
            详情
          </button>
        </template>
      </my-render-list-slot>
    </div>
  </div>
</template>

<script>
import MyRenderList from '@/components/base/MyRenderList'
import MyRenderListSlot from '@/components/base/MyRenderListSlot'

export default {
  name: 'TestRenderList',
  components: {
    MyRenderListSlot,
    MyRenderList
  },
  data() {
    return {
      list: [
        { id: 1, name: 'Vue2' },
        { id: 2, name: 'Vue3' },
        { id: 3, name: 'TypeScript' }
      ]
    }
  },
  methods: {
    onRowClick(item) {
      console.log('点击了行：', item);
    }
  }
}
</script>

<style scoped>

</style>
