<script>
import MyAdvancedTable from './MyAdvancedTable'

export default {
  name: 'BaseListPage',
  props: {
    // 表格列配置，直接透传给 MyAdvancedTable
    columns: {
      type: Array,
      default: () => []
    },
    // 表格数据
    data: {
      type: Array,
      default: () => []
    },
    // 搜索框的值（配合 .sync 使用）
    searchText: {
      type: String,
      default: ''
    },
    // 搜索框 placeholder
    searchPlaceholder: {
      type: String,
      default: '请输入关键字搜索'
    },
    // 分页信息
    pagination: {
      type: Object,
      default: () => {
        return {
          page: 1,
          pageSize: 10,
          total: 0
        }
      }
    },
    // 可选的每页条数选项
    pageSizeOptions: {
      type: Array,
      default() {
        return [10, 20, 50]
      }
    },
    // 是否显示加载中（简单版）
    loading: {
      type: Boolean,
      default: false
    }
  },
  render(h) {
    // =========================
    // 1）工具栏：搜索 + 按钮
    // =========================

    // 1.1 默认搜索输入框
    const searchInputVNode = h('input', {
      class: 'blp-search-input',
      attrs: {
        type: 'text',
        placeholder: this.searchPlaceholder
      },
      domProps: {
        value: this.searchText
      },
      on: {
        input: e => {
          this.$emit('update:searchText', e.target.value)
        },
        keyup: e => {
          if (e.key === 'Enter') {
            this.$emit('search', this.searchText)
          }
        }
      }
    })

    // 1.2 默认搜索按钮
    const searchBtnVNode = h(
      'button',
      {
        class: 'blp-btn blp-btn--primary',
        on: {
          click: () => this.$emit('search', this.searchText)
        }
      },
      '搜索'
    )

    // 1.3 默认刷新按钮（放在右侧）
    const refreshBtnVNode = h(
      'button',
      {
        class: 'blp-btn',
        on: {
          click: () => this.$emit('refresh')
        }
      },
      '刷新'
    )

    // 1.4 工具栏左右插槽：toolbar-left / toolbar-right
    const toolbarLeftSlot = this.$scopedSlots['toolbar-left']
    const toolbarRightSlot = this.$scopedSlots['toolbar-right']

    const toolbarLeftChildren = toolbarLeftSlot
      ? toolbarLeftSlot({
          searchText: this.searchText
        })
      : [searchInputVNode, searchBtnVNode]

    const toolbarRightChildren = toolbarRightSlot
      ? toolbarRightSlot({})
      : [refreshBtnVNode]

    const toolbarVNode = h('div', { class: 'blp-toolbar' }, [
      h('div', { class: 'blp-toolbar-left' }, toolbarLeftChildren),
      h('div', { class: 'blp-toolbar-right' }, toolbarRightChildren)
    ])

    // =========================
    // 2）表格：MyAdvancedTable
    //    - 透传 col-* 插槽
    //    - 透传事件（this.$listeners）
    // =========================

    // 2.1 收集所有 col- 前缀的插槽，透传给 MyAdvancedTable
    const tableScopedSlots = {}
    Object.keys(this.$scopedSlots).forEach(name => {
      if (name.indexOf('col-') === 0) {
        tableScopedSlots[name] = this.$scopedSlots[name]
      }
    })

    const tableVNode = h(MyAdvancedTable, {
      props: {
        columns: this.columns,
        data: this.data
      },
      scopedSlots: tableScopedSlots,
      // 直接把 BaseListPage 上的事件转发给 MyAdvancedTable
      on: this.$listeners
    })

    // 如果需要简单的 loading 遮罩，这里包一层
    const tableWrapperChildren = [tableVNode]
    if (this.loading) {
      const loadingMask = h('div', { class: 'blp-loading-mask' }, '加载中...')
      tableWrapperChildren.push(loadingMask)
    }

    const tableWrapperVNode = h(
      'div',
      { class: 'blp-table-wrapper' },
      tableWrapperChildren
    )

    // =========================
    // 3）分页栏
    // =========================

    const page = this.pagination.page || 1
    const pageSize = this.pagination.pageSize || 10
    const total = this.pagination.total || 0
    const totalPages = total > 0 ? Math.ceil(total / pageSize) : 1

    const canPrev = page > 1
    const canNext = page < totalPages

    // 3.1 上一页按钮
    const prevBtnVNode = h(
      'button',
      {
        class: 'blp-btn',
        attrs: { disabled: !canPrev },
        on: {
          click: () => {
            if (!canPrev) return
            this.$emit('page-change', page - 1)
          }
        }
      },
      '上一页'
    )

    // 3.2 下一页按钮
    const nextBtnVNode = h(
      'button',
      {
        class: 'blp-btn',
        attrs: { disabled: !canNext },
        on: {
          click: () => {
            if (!canNext) return
            this.$emit('page-change', page + 1)
          }
        }
      },
      '下一页'
    )

    // 3.3 页大小选择
    const pageSizeOptionsVNodes = this.pageSizeOptions.map(size => {
      h(
        'option',
        {
          domProps: { value: size }
        },
        size + ' 条/页'
      )
    })

    const pageSizeSelectVNode = h(
      'select',
      {
        class: 'blp-select',
        domProps: {
          value: pageSize
        },
        on: {
          change: e => {
            const newSize = Number(e.target.value)
            this.$emit('page-size-change', newSize)
          }
        }
      },
      pageSizeOptionsVNodes
    )

    // 3.4 文案：“第 x / y 页，共 n 条”
    const pageInfoVNode = h(
      'span',
      { class: 'blp-page-info' },
      `第 ${page} / ${totalPages || 1} 页，共 ${total} 条`
    )

    const paginationVNode = h('div', { class: 'blp-pagination' }, [
      pageInfoVNode,
      pageSizeSelectVNode,
      prevBtnVNode,
      nextBtnVNode
    ])

    // =========================
    // 4）整体布局：工具栏 + 表格 + 分页
    // =========================

    const contentVNode = h(
      'div',
      { class: 'blp-content' },
      [tableWrapperVNode, paginationVNode]
    )

    const rootVNode = h(
      'div',
      { class: 'base-list-page' },
      [toolbarVNode, contentVNode]
    )

    return rootVNode
  }
}
</script>

<style scoped>
.base-list-page {
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
}

/* 工具栏 */
.blp-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.blp-toolbar-left,
.blp-toolbar-right {
  display: flex;
  align-items: center;
}

.blp-toolbar-left > *:not(:last-child),
.blp-toolbar-right > *:not(:last-child) {
  margin-right: 8px;
}

.blp-search-input {
  padding: 4px 8px;
  font-size: 14px;
  min-width: 200px;
}

/* 按钮 */
.blp-btn {
  padding: 4px 10px;
  font-size: 14px;
  cursor: pointer;
}

.blp-btn[disabled] {
  cursor: not-allowed;
  opacity: 0.6;
}

.blp-btn--primary {
  background: #409eff;
  color: #fff;
  border: 1px solid #409eff;
}

.blp-btn:not(.blp-btn--primary) {
  background: #fff;
  border: 1px solid #ccc;
}

/* 表格区域 */
.blp-table-wrapper {
  position: relative;
}

/* 简单 loading 遮罩 */
.blp-loading-mask {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

/* 分页栏 */
.blp-content {
  display: flex;
  flex-direction: column;
}

.blp-pagination {
  margin-top: 10px;
  display: flex;
  align-items: center;
}

.blp-page-info {
  margin-right: 12px;
  font-size: 14px;
}

.blp-select {
  margin-right: 12px;
  padding: 2px 6px;
  font-size: 14px;
}
</style>
