<script>
export default {
  name: 'MyRenderList',
  props: {
    items: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handleRowClick(item) {
      this.$emit('row-click', item)
    }
  },
  render(h) {
    // 1）先构造每一行 li：从“行内部”开始写
    const rowVNodes = this.items.map(item => {
      // 1.1 行内的文本：<span class="label">{{ item.name }}</span>
      const labelVNode = h(
        'span',
        { class: 'label' },
        item.name
      )

      // 1.2 行内的按钮：<button @click="handleRowClick(item)">查看</button>
      const buttonVNode = h(
        'button',
        {
          class: 'btn',
          on: {
            click: () => this.handleRowClick(item)
          }
        },
        '查看'
      )

      // 1.3 把上面两个“小节点”组装成一行 li
      const liVNode = h(
        'li',
        {
          key: item.id,
          class: 'row'
        },
        [
          labelVNode,
          buttonVNode
        ]
      )

      return liVNode
    })

    // 2）再用很多 li 组装成 <ul>
    const listVNode = h(
      'ul',
      { class: '' },
      rowVNodes
    )

    // 3）再准备标题 <h3>Render 函数 Demo</h3>
    const titleVNode = h(
      'h3',
      'Render 函数 - 无 slot - 由内到外 Demo'
    )

    // 4）最后把 title + list 包在根 <div> 里
    const rootVNode = h(
      'div',
      {
        class: 'my-render-list'
      },
      [
        titleVNode,
        listVNode
      ]
    )

    // 5）返回根节点
    return rootVNode
  }
}
</script>

<style scoped>
.my-render-list {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-width: 320px;
}
.my-render-list h3 {
  margin-bottom: 8px;
  font-size: 16px;
}
.my-render-list .row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}
.my-render-list .label {
  margin-right: 8px;
}
.my-render-list .btn {
  padding: 2px 8px;
  cursor: pointer;
}
</style>
