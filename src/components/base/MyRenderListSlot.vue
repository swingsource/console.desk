<script>
export default {
  name: 'MyRenderListSlot',
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
    // 取出父组件传进来的作用域插槽：row
    const rowSlot = this.$scopedSlots.row

    // 1）先构造每一行 li：从“行内部”开始写
    const rowVNodes = this.items.map((item, index) => {
      let innerChildren

      if (rowSlot) {
        // 如果父组件提供了 row 插槽，则用插槽内容
        // 插槽 props 传出去：item / index / click
        innerChildren = rowSlot({
          item,
          index,
          click: () => this.handleRowClick(item)
        })
      } else {
        // 默认渲染：文本 + 按钮

        // 1.1 文本 <span class="label">{{ item.name }}</span>
        const labelVNode = h(
          'span',
          {
            class: 'label'
          },
          item.name
        )
        // 1.2 按钮 <button @click="handleRowClick(item)">查看</button>
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

        innerChildren = [ labelVNode, buttonVNode ]
      }

      // 1.3 用 innerChildren 组装成 li
      const liVNode = h(
        'li',
        {
          id: item.index,
          class: 'row'
        },
        innerChildren
      )

      return liVNode
    })

    // 2）用 li 组装成 <ul>
    const listVNode = h(
      'ul',
      rowVNodes
    )

    // 3）标题 <h3>Render + scopedSlots Demo</h3>
    const titleVNode = h(
      'h3',
      'Render + scopedSlots Demo'
    )

    // 4）最外层根节点 <div class="my-render-list">...</div>
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
    return rootVNode;
  }
}
</script>

<style scoped>
.my-render-list {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-width: 360px;
}
.my-render-list h3 {
  margin-bottom: 8px;
  font-size: 16px;
}
.my-render-list .row {
  display: flex;
  align-items: center;
  padding: 4px 0;
}
.my-render-list .label {
  margin-right: 8px;
}
.my-render-list .btn {
  margin-left: auto;
  padding: 2px 8px;
  cursor: pointer;
}
</style>
