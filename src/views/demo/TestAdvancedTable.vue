<template>
  <div>
    <h2>MyAdvancedTable 示例</h2>

    <MyAdvancedTable
      :columns="columns"
      :data="tableData"
    >
      <!-- 1）name 列：用 scopedSlot，覆盖列的 render（如果有的话） -->
      <template v-slot:col-name="{ row, value, rowIndex }">
        <span style="color: #999;">#{{ rowIndex + 1 }}</span>
        <strong style="margin-left: 6px;">{{ value }}</strong>
        <span style="margin-left: 4px; color: #409eff;">(slot)</span>
      </template>

      <!-- 2）actions 列：只用插槽，没有列 render -->
      <template v-slot:col-actions="{ row }">
        <button @click="onView(row)">查看</button>
        <button style="margin-left: 8px;" @click="onEdit(row)">编辑</button>
      </template>
    </MyAdvancedTable>
  </div>
</template>

<script>
import MyAdvancedTable from '@/components/base/MyAdvancedTable.vue';

export default {
  name: 'App',
  components: { MyAdvancedTable },

  data() {
    return {
      columns: [
        {
          key: 'name',
          title: '姓名',
          align: 'left',
          // 即便有 render，只要父组件提供了 col-name 插槽，还是会被插槽覆盖
          render(h, { value }) {
            return h('em', value);
          }
        },
        {
          key: 'age',
          title: '年龄',
          align: 'center',
          // 这一列没有插槽时，使用列 render
          render(h, { value }) {
            return h('span', value + ' 岁');
          }
        },
        {
          key: 'city',
          title: '城市',
          align: 'left'
          // 没有 render → 默认文本
        },
        {
          key: 'actions',
          title: '操作',
          align: 'center'
          // 不写 render，完全交给插槽 col-actions
        }
      ],
      tableData: [
        { name: '张三', age: 28, city: '北京' },
        { name: '李四', age: 32, city: '上海' },
        { name: '王五', age: 24, city: '广州' }
      ]
    };
  },

  methods: {
    onView(row) {
      console.log('查看：', row);
    },
    onEdit(row) {
      console.log('编辑：', row);
    }
  }
};
</script>
