
# Vue2 + render/h 通用列表内核实战笔记

## 0. 总体目标与结构

我们这次从零搭了一个可复用的「**小型后台列表内核」**：

- **MyAdvancedTable**：通用表格内核  
  - `columns` 列配置  
  - `render(h, ctx)` 列渲染函数  
  - `col-*` scopedSlots 插槽扩展  

- **BaseListPage**：列表页面骨架（全 render 写成）  
  - 工具栏（搜索输入 + 刷新按钮，可插槽覆盖）  
  - 表格区域（封装 MyAdvancedTable）  
  - 分页栏（页码切换 + pageSize 选择）  

- **BaseSearchForm / BaseSearchFormAdvanced**：搜索区骨架  
  - 字段配置驱动（`fields`）  
  - 作用域插槽扩展（`field-*`、`actions`）  
  - 高级版支持多行布局 + `span` + 折叠「更多条件」  

- 衍生话题：  
  - 如何在 render 里用子组件（如 `BaseSelect`）  
  - `h(tag, data?, children?)` 的使用细节  
  - `$attrs` / `$listeners` 的透传与「壳组件」  
  - BaseCrudPage 的设计思路（CRUD 内核）  
  - 接口数据结构与前端字段不一致时的「适配层」  


---

## 1. Vue2 的 h 函数与“由外到内 / 由内到外”

### 1.1 `h` 的参数规则（Vue2）

```js
// 标准签名
h(tag, data, children)

// 常见简写（省略 data）：
h(tag, children)
```

- 当只写两个参数时：`h(tag, secondArg)`
  - 如果 `secondArg` 是 **对象** → 当作 `data`
  - 如果是 **数组 / 字符串** → 当作 `children`

所以这两句是不同的：

```js
// ✅ children 是一个数组
const theadVNode = h('thead', [headerTrVNode]);

// ❌ 这里 headerTrVNode 是 VNode 对象，会被当成 data，而不是 children
const theadVNode = h('thead', headerTrVNode);
```

推荐写法（更啰嗦但语义清晰）：

```js
const theadVNode = h('thead', null, [headerTrVNode]);
```

---

### 1.2 由外到内 vs 由内到外

- **由外到内**：写 render 时，先写根节点，再往里一层一层 `h()`  
- **由内到外**：先用变量存住最小的 VNode，再逐层往外包  

两种方式只是代码风格不同，你后面更习惯的是「由内到外」：

```js
// 由内到外小例子（单行）
const labelVNode = h('span', { class: 'label' }, item.name);
const buttonVNode = h('button', { on: { click: ... } }, '查看');

const liVNode = h('li', { class: 'row' }, [labelVNode, buttonVNode]);
const ulVNode = h('ul', [liVNode]);
const rootVNode = h('div', { class: 'wrap' }, [ulVNode]);
return rootVNode;
```

---

## 2. 通用表格内核：MyAdvancedTable

### 2.1 功能设计

- `props`：
  - `columns`: 列配置数组
    ```js
    {
      key: 'name',
      title: '姓名',
      align: 'center',      // 可选
      render(h, ctx) { ... } // 可选：列级 render
    }
    ```
  - `data`: 行数据数组

- **渲染优先级**（单元格内容）：
  1. 先看有没有对应的 scopedSlot：`col-${key}`
  2. 再看该列有没有 `render(h, ctx)` 函数
  3. 最后才用默认文本渲染 `row[col.key]`

- 插槽：
  - `v-slot:col-xxx="{ row, column, rowIndex, colIndex, value }"`

### 2.2 核心实现（简化版）

```js
// MyAdvancedTable.vue
export default {
  name: 'MyAdvancedTable',

  props: {
    columns: {
      type: Array,
      default() { return []; }
    },
    data: {
      type: Array,
      default() { return []; }
    }
  },

  render(h) {
    // 1）表头
    const headerThVNodes = this.columns.map(col =>
      h('th', { class: ['mat-th', col.align ? `mat-th--${col.align}` : ''] }, col.title)
    );

    const headerTrVNode = h('tr', { class: 'mat-tr mat-tr--header' }, headerThVNodes);
    const theadVNode = h('thead', [headerTrVNode]);

    // 2）表体
    const bodyTrVNodes = this.data.map((row, rowIndex) => {
      const tdVNodes = this.columns.map((col, colIndex) => {
        const value = row[col.key];
        const slotName = 'col-' + col.key;
        const colSlot = this.$scopedSlots[slotName];

        const renderContext = { row, column: col, rowIndex, colIndex, value };
        let cellContentVNode;

        if (colSlot) {
          // 优先：scopedSlot
          cellContentVNode = colSlot(renderContext);
        } else if (typeof col.render === 'function') {
          // 其次：列配置中的 render
          cellContentVNode = col.render(h, renderContext);
        } else {
          // 默认：文本
          cellContentVNode = h('span', value != null ? String(value) : '');
        }

        return h(
          'td',
          { class: ['mat-td', col.align ? `mat-td--${col.align}` : ''] },
          [cellContentVNode]
        );
      });

      return h('tr', { class: 'mat-tr', key: rowIndex }, tdVNodes);
    });

    const tbodyVNode = h('tbody', bodyTrVNodes);

    // 3）table + wrapper
    const tableVNode = h('table', { class: 'mat-table' }, [theadVNode, tbodyVNode]);
    const rootVNode = h('div', { class: 'my-advanced-table-wrapper' }, [tableVNode]);

    return rootVNode;
  }
};
```

---

### 2.3 父组件使用示例

```vue
<MyAdvancedTable :columns="columns" :data="tableData">
  <!-- 通过插槽自定义 name 列 -->
  <template v-slot:col-name="{ value, rowIndex }">
    <span>{{ rowIndex + 1 }}.</span>
    <strong style="margin-left:6px;">{{ value }}</strong>
  </template>

  <!-- age 列用 columns 中的 render，无插槽时生效 -->
  <!-- actions 列用插槽 -->
  <template v-slot:col-actions="{ row }">
    <button @click="onView(row)">查看</button>
    <button style="margin-left:6px;" @click="onEdit(row)">编辑</button>
  </template>
</MyAdvancedTable>
```

`columns` 示例：

```js
columns: [
  {
    key: 'name',
    title: '姓名',
    align: 'left',
    render(h, { value }) {
      // 如果没有 col-name 插槽，这里才会生效
      return h('em', value);
    }
  },
  {
    key: 'age',
    title: '年龄',
    align: 'center',
    render(h, { value }) {
      return h('span', value + ' 岁');
    }
  },
  { key: 'city', title: '城市', align: 'left' },
  { key: 'actions', title: '操作', align: 'center' }
]
```

> 关系总结：  
> **父组件**在 `columns` 里「定义 render 函数实现」，  
> **MyAdvancedTable** 在渲染时「调用 `col.render(h, ctx)`」。  

---

## 3. 列表页面骨架：BaseListPage

BaseListPage 在 MyAdvancedTable 之上，提供：

- 顶部工具栏（左：搜索输入，右：刷新按钮，可插槽覆盖）
- 表格区域（MyAdvancedTable + loading 遮罩）
- 底部分页栏（上一页 / 下一页 + pageSize 选择）

### 3.1 核心 props

```js
props: {
  columns: Array,
  data: Array,
  searchText: String,       // 可配合 :search-text.sync
  searchPlaceholder: String,
  pagination: Object,       // { page, pageSize, total }
  pageSizeOptions: Array,   // [10,20,50]
  loading: Boolean
}
```

### 3.2 工具栏与插槽

- 左侧默认内容：`<input>` + 搜索按钮
- 右侧默认内容：刷新按钮
- 通过以下插槽覆盖：

```vue
<template v-slot:toolbar-left> ... </template>
<template v-slot:toolbar-right> ... </template>
```

### 3.3 表格区域（透传 col-* 插槽）

BaseListPage 会收集所有 `col-*` 插槽并透传给 MyAdvancedTable：

```js
const tableScopedSlots = {};
Object.keys(this.$scopedSlots).forEach(name => {
  if (name.indexOf('col-') === 0) {
    tableScopedSlots[name] = this.$scopedSlots[name];
  }
});

const tableVNode = h(MyAdvancedTable, {
  props: { columns: this.columns, data: this.data },
  scopedSlots: tableScopedSlots,
  on: this.$listeners      // 事件透传（如 @row-click）
});
```

> 这里还可以结合 `$attrs` 做更彻底的透传，见第 7 节。  

---

### 3.4 分页栏

BaseListPage 内部管理展示逻辑，但不负责改数据，只 **通过事件告诉父组件需要变更页码 / pageSize**：

- `@page-change="newPage => ..."`
- `@page-size-change="newSize => ..."`

父组件再改自己的 `pagination`，并触发重新拉接口即可。

---

## 4. 搜索表单骨架：BaseSearchForm & 高级版

### 4.1 基础版：字段配置驱动 + field-* 插槽

基本思路：

- `props`：
  - `form`：表单对象（配合 `:form.sync`）
  - `fields`：字段配置数组

- 字段配置示例：

```js
fields: [
  { key: 'keyword', label: '关键词', type: 'input', placeholder: '请输入' },
  { key: 'city', label: '城市', type: 'select', options: [...] }
]
```

- 默认根据 `field.type` 渲染：
  - `input` → `<input>`
  - `select` → `<select> + <option>`

- 作用域插槽：
  - `field-${key}`：自定义某个字段的控件
  - `actions`：自定义按钮区域

- `set` 函数 & `.sync`  
  子组件内部：

  ```js
  updateField(key, value) {
    const next = { ...this.form, [key]: value };
    this.$emit('update:form', next);  // 支持 :form.sync
    this.$emit('change', { key, value, form: next });
  }
  ```

  插槽调用：

  ```js
  fieldSlot({
    field,
    value,
    form: this.form,
    set: v => this.updateField(field.key, v)
  });
  ```

- 父组件中使用插槽时 **必须调用 `set` 才能更新表单**，否则 input 只是个“死显示”：

  ```vue
  <template v-slot:field-age="{ value, set }">
    <input :value="value || ''" @input="e => set(e.target.value)" />
  </template>
  ```

> 你的问题「我只写 `<input :value="value" />` 错在哪？」  
> 答：你只“读”了 `value`，没用 `set` 把修改写回 `form`。  

---

### 4.2 高级版：多行 + span + 折叠展开

高级版 `BaseSearchFormAdvanced` 额外支持：

- `cols`: 一行多少列（默认 3）
- `span`: 字段占几列
- `collapsible`: 是否支持折叠
- `defaultCollapsed`: 默认是否折叠
- `collapsedRows`: 折叠时展示多少行

#### 4.2.1 行布局算法（核心）

```js
buildRows() {
  const cols = this.cols || 3;
  const rows = [];
  let currentRow = [];
  let currentCol = 0;

  this.fields.forEach(field => {
    let span = field.span || 1;
    if (span > cols) span = cols;

    if (currentCol + span > cols) {
      if (currentRow.length) rows.push(currentRow);
      currentRow = [];
      currentCol = 0;
    }

    currentRow.push({ field, span });
    currentCol += span;
  });

  if (currentRow.length) rows.push(currentRow);
  return rows;
}
```

渲染 `bsf-row` / `bsf-item` 时通过 flex + `maxWidth` 实现 span：

```js
const itemVNode = h(
  'div',
  {
    class: 'bsf-item',
    style: {
      flex: span,
      maxWidth: `${(span / cols) * 100}%`
    }
  },
  [labelVNode, controlWrapVNode]
);
```

折叠逻辑基于 `collapsed` 状态 + `visibleRowCount` 决定 `rows.slice(0, visibleRowCount)`。

---

## 5. 在 render 里使用自定义组件（以 BaseSelect 为例）

### 5.1 子组件 BaseSelect（支持 v-model）

```vue
<!-- BaseSelect.vue -->
<template>
  <select class="base-select" :value="value" @change="onChange">
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>

<script>
export default {
  name: 'BaseSelect',
  props: {
    value: [String, Number, Boolean],
    options: { type: Array, default: () => [] }
  },
  methods: {
    onChange(e) {
      const val = e.target.value;
      this.$emit('input', val);   // v-model 对应事件
      this.$emit('change', val);
    }
  }
};
</script>
```

### 5.2 在 render 的表单里使用 BaseSelect

在 `BaseSearchFormRender` 中根据 `field.type` 分支：

```js
import BaseSelect from './BaseSelect.vue';

if (field.type === 'base-select') {
  controlVNode = h(BaseSelect, {
    props: {
      value: value != null ? value : '',
      options: field.options || []
    },
    on: {
      input: val => this.updateField(field.key, val)
    }
  });
} else {
  // 默认 input
}
```

`fields` 中配置：

```js
searchFields: [
  { key: 'keyword', label: '关键词', type: 'input', placeholder: '请输入姓名' },
  {
    key: 'city',
    label: '城市',
    type: 'base-select',
    options: [
      { label: '全部', value: '' },
      { label: '北京', value: '北京' },
      { label: '上海', value: '上海' }
    ]
  }
];
```

> 关键点：  
> 子组件内部是 template 还是 render 完全无所谓，  
> 在 render 中使用组件就是：`h(组件变量, { props, on })`。  

---

## 6. $attrs / $listeners 与“壳组件”

### 6.1 基本概念

- `$listeners`：父组件在当前组件上绑定的所有事件（`@xxx`）
- `$attrs`：**不是 props** 的所有 attribute，包括：  
  - 未在 `props` 声明的属性  
  - 一部分 class/style（视 `inheritAttrs` 而定）

默认情况下：

- `$attrs` 会挂到根元素（template 中的最外层）  
- 子组件不会自动收到底层的 `$attrs` / `$listeners`，需要你**手动转发**

### 6.2 壳组件：BaseListPage 中透传事件与 attrs

例：让 BaseListPage 成为 MyAdvancedTable 的“透明壳”：

```js
export default {
  name: 'BaseListPage',
  inheritAttrs: false, // 避免 attrs 自动挂到根 div

  render(h) {
    const tableScopedSlots = { /* col-* 插槽收集略 */ };

    const tableVNode = h(MyAdvancedTable, {
      attrs: this.$attrs,     // 把父传给 BaseListPage 的 attr 透传给表格
      props: {
        columns: this.columns,
        data: this.data
      },
      scopedSlots: tableScopedSlots,
      on: this.$listeners     // 事件透传
    });

    const rootVNode = h(
      'div',
      { class: 'base-list-page' },
      [/* toolbar, tableVNode, pagination 等 */]
    );

    return rootVNode;
  }
};
```

这样：

```vue
<BaseListPage
  :columns="columns"
  :data="list"
  border
  size="small"
  stripe
  @row-click="onRowClick"
/>
```

- `border/size/stripe` 等就会通过 `$attrs` → MyAdvancedTable  
- `row-click` 事件也会通过 `$listeners` → MyAdvancedTable

### 6.3 组件层级很深时，是否每层都要写 `$attrs/$listeners`？

不需要。

**原则**：

- 只有你希望这一层是“透明壳”的时候，才转发 `$attrs` / `$listeners`；
- 普通业务组件就当「边界」，定义好自己的 `props` / `emit` 即可。

比如：

```txt
UserList -> BaseCrudPage -> BaseListPage -> MyAdvancedTable
```

- 你可以决定：  
  - 只有 BaseListPage 是“表格壳组件”，负责透传 `$attrs/$listeners` 给 MyAdvancedTable；  
  - BaseCrudPage / UserList 就用显式的 props/事件，不做透明转发。

这样不会每层都 copy-paste 一堆同样代码。  

---

## 7. BaseCrudPage 的概念与接口适配

### 7.1 BaseCrudPage 是什么？

是在 BaseListPage 之上再封一层，把**增删改查整套常见逻辑也统一封装起来**的页面级组件：

- 内部维护：
  - 列表数据 `list`
  - 分页 `pagination`
  - 搜索表单 `searchForm`
  - 加载状态 `loading`
  - 当前编辑项 / 弹窗状态
- 对外只暴露：
  - `columns`
  - `searchFields`
  - 一组 API 函数：
    - `fetchList`
    - `createItem`
    - `updateItem`
    - `deleteItem`  
  - 一些插槽：`field-*`、`col-*`、`toolbar-*`、`form` 等

你只需要提供「怎么请求后端」和「表单长什么样」，其余“查 → 新建弹窗 → 编辑弹窗 → 删除 → 刷新列表”由 BaseCrudPage 托底。

---

### 7.2 接口字段与前端字段不一致时的适配

即使接口字段很丑也没关系，通过一层适配函数就可以接入 BaseCrudPage。

#### 7.2.1 结果字段不一致

期望表格字段：

```js
columns: [
  { key: 'name', title: '姓名' },
  { key: 'age', title: '年龄' },
  { key: 'city', title: '城市' }
];
```

接口返回：

```json
{
  "totalCount": 123,
  "records": [
    { "id": 1, "user_name": "张三", "age_years": 28, "cityDesc": "北京" },
    ...
  ]
}
```

适配函数（在业务页写）：

```js
async function fetchUserList({ keyword, city, page, pageSize }) {
  const res = await apiGetUserList({
    searchText: keyword,
    cityCode: city,
    pageIndex: page,
    pageSize
  });

  return {
    list: (res.records || []).map(item => ({
      id: item.id,
      name: item.user_name,
      age: item.age_years,
      city: item.cityDesc
    })),
    total: res.totalCount || 0
  };
}
```

BaseCrudPage 中只认 `{ list, total }` 这个统一格式。

#### 7.2.2 查询参数不一致

前端搜索表单：

```js
searchForm: {
  keyword: '',
  city: '',
  minAge: '',
  maxAge: ''
}
```

接口要：

```json
{
  "searchText": "xxx",
  "cityCode": "BJ",
  "ageRange": [20, 30],
  "pageIndex": 1,
  "pageSize": 10
}
```

继续在 `fetchUserList` 中适配请求参数即可：

```js
async function fetchUserList({ keyword, city, minAge, maxAge, page, pageSize }) {
  const params = {
    searchText: keyword,
    cityCode: city || undefined,
    ageRange: (minAge || maxAge) ? [minAge || 0, maxAge || 200] : undefined,
    pageIndex: page,
    pageSize
  };

  const res = await apiGetUserList(params);

  return {
    list: (res.records || []).map(item => ({
      id: item.id,
      name: item.user_name,
      age: item.age_years,
      city: item.cityDesc
    })),
    total: res.totalCount || 0
  };
}
```

> 总结：  
> **接口怎么乱都行**，  
> 在业务层写一个 `fetchList` 适配成统一格式 `{ list, total }`，  
> BaseCrudPage / BaseListPage / MyAdvancedTable 只认前端这套字段。  

---

## 8. 父组件中使用 field-* 插槽的写法总结

子组件传入插槽的对象是：

```js
fieldSlot({
  field,
  value,
  form: this.form,
  set: v => this.updateField(field.key, v)
});
```

所以父组件这样接收并使用：

```vue
<BaseSearchFormAdvanced
  :form.sync="searchForm"
  :fields="searchFields"
  @submit="handleSearch"
>
  <!-- 自定义 age 字段 -->
  <template v-slot:field-age="{ field, value, form, set }">
    <input
      class="bsf-control"
      :value="value || ''"
      @input="e => set(e.target.value)"  <!-- 关键：调用 set 回写表单 -->
    />
  </template>

  <!-- 自定义 city 字段，配合字段中的 options -->
  <template v-slot:field-city="{ field, value, set }">
    <select
      class="bsf-control"
      :value="value || ''"
      @change="e => set(e.target.value)"
    >
      <option
        v-for="opt in field.options"
        :key="opt.value"
        :value="opt.value"
      >
        {{ opt.label }}
      </option>
    </select>
  </template>
</BaseSearchFormAdvanced>
```

> 记住：插槽里的 `value` 是“只读快照”，  
> **真正更新 form 必须调用 `set(newValue)`**。  

---
