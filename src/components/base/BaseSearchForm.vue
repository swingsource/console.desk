<script>
export default {
  name: 'BaseSearchForm',
  props: {
    // 表单数据（推荐 .sync 使用）
    form: {
      type: Object,
      required: true
    },
    // 字段配置
    fields: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    // 更新某个字段
    updateField(key, value) {
      const next = Object.assign({}, this.form, {[key]: value})
      this.$emit('update:form', next)
    },

    // 提交（搜索
    handleSubmit() {
      this.$emit('submit', this.form)
    },

    // 重置
    handleReset() {
      const empty = {};
      this.fields.forEach(f => {
        empty[f.key] = undefined;
      });
      this.$emit('update:form', empty);
      this.$emit('reset', empty);
    }
  },
  render(h) {
    // 1）逐个字段 -> “由内到外”构造
    const fieldNodes = this.fields.map(field => {
      const value = this.form[field.key]
      const slotName = `field-${field.key}`
      const fieldSlot = this.$scopedSlots[slotName]

      let controlVNode

      if (fieldSlot) {
        // 父组件自定义字段控件
        controlVNode = fieldSlot({
          field,
          value,
          form: this.form,
          set: v => this.updateField(field.key, v)
        })
      } else {
        // 默认控件：input / select
        if (field.type === 'select') {
          const optionVNodes = (field.options || []).map(opt =>
            h(
              'option',
              {
                domProps: { value: opt.value }
              },
              opt.label
            )
          )
          controlVNode = h(
            'select',
            {
              class: 'bsf-control',
              domProps: {
                value: value != null ? value : ''
              },
              on: {
                change: e => this.updateField(field.key, e.target.value)
              }
            },
            optionVNodes
          )
        } else {
          // 默认认为是 text 输入框
          controlVNode = h('input', {
            class: 'bsf-control',
            attrs: {
              type: field.inputType || 'text',
              placeholder: field.placeholder || ''
            },
            domProps: {
              value: value != null ? value : ''
            },
            on: {
              input: e => this.updateField(field.key, e.target.value),
              keyup: e => {
                if (e.key === 'Enter') {
                  this.handleSubmit()
                }
              }
            }
          })
        }
      }

      const labelVNode = h(
        'div',
        { class: 'bsf-label' },
        field.label || field.key
      )

      const controlWrapVNode = h(
        'div',
        { class: 'bsf-control-wrap' },
        Array.isArray(controlVNode) ? controlVNode : [controlVNode]
      )

      const itemVNode = h(
        'div',
        { class: 'bsf-item' },
        [labelVNode, controlWrapVNode]
      )

      return itemVNode
    })

    // 2）操作区：重置 + 搜索（可插槽覆盖）
    const actionSlot = this.$scopedSlots.actions
    let actionsChildren

    if (actionSlot) {
      actionSlot({
        form: this.form,
        submit: this.handleSubmit,
        reset: this.handleReset
      })
    } else {
      const resetBtn = h(
        'button',
        {
          class: 'bsf-btn',
          on: { click: this.handleReset }
        },
        '重置'
      )
      const searchBtn = h(
        'button',
        {
          class: 'bsf-btn bsf-btn--primary',
          on: { click: this.handleSubmit }
        },
        '搜索'
      )
      actionsChildren = [resetBtn, searchBtn]
    }

    const actionsVNode = h(
      'div',
      { class: 'bsf-actions' },
      Array.isArray(actionsChildren) ? actionsChildren : [actionsChildren]
    )

    // 3）最外层容器
    const rootVNode = h(
      'div',
      { class: 'base-search-form' },
      [...fieldNodes, actionsVNode]
    );

    return rootVNode
  }
}
</script>

<style scoped>
.base-search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  margin-bottom: 12px;
}

/* 默认每行一个，可以自己调 */
.bsf-item {
  display: flex;
  align-items: center;
  margin-right: 16px;
  margin-bottom: 8px;
}

.bsf-label {
  min-width: 60px;
  font-size: 14px;
  margin-right: 4px;
  text-align: right;
}

.bsf-control-wrap {
  min-width: 160px;
}

.bsf-control {
  width: 100%;
  box-sizing: border-box;
  padding: 4px 8px;
  font-size: 14px;
}

/* 操作区 */
.bsf-actions {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.bsf-actions > *:not(:last-child) {
  margin-right: 8px;
}

/* 按钮样式 */
.bsf-btn {
  padding: 4px 10px;
  font-size: 14px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #ccc;
}

.bsf-btn--primary {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}
</style>
