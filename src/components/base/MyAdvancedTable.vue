<script>
export default {
  name: 'MyAdvancedTable.vue',
  props: {
    // 列配置：[{ key, title, align?, render? }]
    columns: {
      type: Array,
      default: () => []
    },
    // 行数据
    data: {
      type: Array,
      default: () => []
    }
  },
  render(h) {
    // ===============================
    // 1）表头：th -> tr -> thead
    // ===============================
    const headerThVNodes = this.columns.map(col => {
      return h(
        'th',
        {
          class: ['mat-th', col.align ? `mat-th--${col.align}` : '']
        },
        col.title
      )
    })
    const headerTrVNode = h(
      'tr',
      { class: 'mat-tr mat-tr--header' },
      headerThVNodes
    )

    const theadVNode = h('thead', [ headerTrVNode ])

    // ===============================
    // 2）表体：先单元格内容 -> td -> tr -> tbody
    // ===============================
    const bodyTrVNodes = this.data.map((row, rowIndex) => {
      const tdVNodes = this.columns.map((col, colIndex) => {
        const value = row[col.key]
        const slotName = 'col-' + col.key
        const colSlot = this.$scopedSlots[slotName]

        let cellContentVNode

        const renderContext = {
          row,
          column: col,
          rowIndex,
          colIndex,
          value
        }

        // 父组件提供了 v-slot:col-key → 用插槽（最高优先级）
        // 否则如果列上有 render → 用列的 render
        // 否则 → 默认文本 String(value)
        if (colSlot) {
          cellContentVNode = colSlot(renderContext)
        } else if (typeof col.render === 'function') {
          cellContentVNode = col.render(h, renderContext)
        } else {
          cellContentVNode = h(
            'span',
            value != null ? String(value) : ''
          )
        }

        // 包裹到 td
        return h(
          'td',
          {
            class: ['mat-td', col.align ? `mat-td--${col.align}` : '']
          },
          [ cellContentVNode ]
        )
      })
      return h(
        'tr',
        {
          class: 'mat-tr',
          key: rowIndex
        },
        tdVNodes
      )
    })
    const tbodyVNode = h('tbody', bodyTrVNodes)

    // ===============================
    // 3）组装 table
    // ===============================
    const tableVNode = h(
      'table',
      { class: 'mat-table' },
      [theadVNode, tbodyVNode]
    )

    // ===============================
    // 4）最外层 div
    // ===============================
    const rootVNode = h(
      'div',
      { class: 'my-advanced-table-wrapper' },
      [tableVNode]
    )

    return rootVNode
  }
}
</script>

<style scoped>
.my-advanced-table-wrapper {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: inline-block;
  max-width: 100%;
  overflow-x: auto;
}

.mat-table {
  border-collapse: collapse;
  min-width: 480px;
  font-size: 14px;
}

.mat-th,
.mat-td {
  border: 1px solid #e5e5e5;
  padding: 6px 10px;
}

/* 表头行 */
.mat-tr--header {
  background: #f7f7f7;
  font-weight: bold;
}

/* 斑马纹 */
.mat-tr:nth-child(even) .mat-td {
  background: #fafafa;
}

/* 对齐方式 */
.mat-th--center,
.mat-td--center {
  text-align: center;
}
.mat-th--right,
.mat-td--right {
  text-align: right;
}
</style>
