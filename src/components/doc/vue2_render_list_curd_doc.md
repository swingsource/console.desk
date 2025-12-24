

---

## 9. BaseCrudPage 实现骨架（精简版）

这一节给出一个可以直接放进项目里试用的 **BaseCrudPage 精简实现**，目标是：

- 统一管理：
  - `list` / `pagination` / `searchForm` / `loading`
  - 「新建/编辑」弹窗的显隐状态与表单模型
- 通过 **少量 props + 插槽**，把业务逻辑与 UI 解耦：
  - 你负责：提供 `fetchList / createItem / updateItem / deleteItem` 等接口函数 & 表单结构
  - BaseCrudPage 负责：列表页整体流程和状态管理

> 说明：  
> 这里为了可读性，BaseCrudPage 用的是 `template` 写法，内部组合了前面定义的 `BaseListPage` 和 `BaseSearchFormAdvanced`。  
> 你完全可以在此基础上改成 render 版本。

### 9.1 BaseCrudPage.vue 代码骨架

```vue
<template>
  <div class="base-crud-page">
    <!-- 1）列表页骨架 -->
    <BaseListPage
      :columns="columnsWithActions"
      :data="list"
      :pagination="pagination"
      :loading="loading"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
    >
      <!-- 工具栏左侧：搜索表单 -->
      <template v-slot:toolbar-left>
        <BaseSearchFormAdvanced
          :form.sync="searchForm"
          :fields="searchFields"
          :cols="searchCols"
          :collapsible="searchCollapsible"
          :collapsed-rows="searchCollapsedRows"
          :default-collapsed="searchDefaultCollapsed"
          @submit="handleSearch"
          @reset="handleReset"
        >
          <!-- 透传字段插槽给外部（field-*） -->
          <template
            v-for="field in searchFields"
            v-slot:[`field-${field.key}`]="slotProps"
          >
            <slot
              :name="`field-${field.key}`"
              v-bind="slotProps"
            />
          </template>

          <!-- 操作区也允许外部覆盖 -->
          <template #actions="slotProps">
            <slot
              name="search-actions"
              v-bind="slotProps"
            >
              <!-- 默认按钮实现 -->
              <button class="bsf-btn" @click="slotProps.reset()">重置</button>
              <button class="bsf-btn bsf-btn--primary" @click="slotProps.submit()">
                搜索
              </button>
              <!-- 展开/收起按钮 -->
              <button
                v-if="slotProps.toggleCollapse"
                class="bsf-btn bsf-btn--text"
                @click="slotProps.toggleCollapse()"
              >
                {{ slotProps.collapsed ? '更多条件 ▾' : '收起条件 ▴' }}
              </button>
            </slot>
          </template>
        </BaseSearchFormAdvanced>
      </template>

      <!-- 工具栏右侧：新建 / 刷新 -->
      <template v-slot:toolbar-right>
        <slot name="toolbar-right" :create="onCreate" :reload="reload">
          <button class="blp-btn blp-btn--primary" @click="onCreate">新建</button>
          <button class="blp-btn" style="margin-left: 8px" @click="reload">刷新</button>
        </slot>
      </template>

      <!-- 列操作区：默认提供 编辑 / 删除，并允许外部完全覆盖 -->
      <template v-slot:col-actions="{ row }">
        <slot
          name="row-actions"
          :row="row"
          :edit="() => onEdit(row)"
          :remove="() => onDelete(row)"
        >
          <button @click="onEdit(row)">编辑</button>
          <button style="margin-left: 8px" @click="onDelete(row)">删除</button>
        </slot>
      </template>

      <!-- 透传表格字段插槽：col-* -->
      <template
        v-for="col in columns"
        v-slot:[`col-${col.key}`]="slotProps"
      >
        <slot
          :name="`col-${col.key}`"
          v-bind="slotProps"
        />
      </template>
    </BaseListPage>

    <!-- 2）新建/编辑表单弹窗（极简实现） -->
    <div v-if="formVisible" class="crud-dialog-mask">
      <div class="crud-dialog">
        <div class="crud-dialog__header">
          <span>{{ isCreate ? createTitle : editTitle }}</span>
          <button class="crud-dialog__close" @click="closeForm">×</button>
        </div>
        <div class="crud-dialog__body">
          <!-- 外部通过 form 插槽渲染实际表单 -->
          <slot
            name="form"
            :model="formModel"
            :is-create="isCreate"
            :submit="submitForm"
            :cancel="closeForm"
          >
            <!-- 默认实现：仅调试用，实际项目应自定义 form 插槽 -->
            <pre style="font-size: 12px; white-space: pre-wrap;">
{{ formModel }}
            </pre>
            <button @click="submitForm">保存（示例）</button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseListPage from './BaseListPage.vue';
import BaseSearchFormAdvanced from './BaseSearchFormAdvanced.vue';

export default {
  name: 'BaseCrudPage',

  components: {
    BaseListPage,
    BaseSearchFormAdvanced
  },

  props: {
    // 表格列（不含 actions 列，内部会自动追加）
    columns: {
      type: Array,
      default() {
        return [];
      }
    },
    // 搜索字段配置
    searchFields: {
      type: Array,
      default() {
        return [];
      }
    },
    // 列表接口：必须返回 { list, total }
    fetchList: {
      type: Function,
      required: true
    },
    // 新建 / 更新 / 删除 接口（可选，不传则对应能力禁用或留给外部自己处理）
    createItem: Function,
    updateItem: Function,
    deleteItem: Function,

    // 搜索表单布局配置
    searchCols: {
      type: Number,
      default: 3
    },
    searchCollapsible: {
      type: Boolean,
      default: true
    },
    searchCollapsedRows: {
      type: Number,
      default: 1
    },
    searchDefaultCollapsed: {
      type: Boolean,
      default: true
    },

    // 表单初始值工厂（用于新建）
    createDefaultModel: {
      type: Function,
      default() {
        return {};
      }
    },
    // 编辑时如何从行数据生成表单模型
    mapEditModel: {
      type: Function,
      default(row) {
        return { ...row };
      }
    },

    // 弹窗标题
    createTitle: {
      type: String,
      default: '新建'
    },
    editTitle: {
      type: String,
      default: '编辑'
    },

    // 初始分页配置
    pageSize: {
      type: Number,
      default: 10
    }
  },

  data() {
    return {
      // 列表数据与分页
      list: [],
      pagination: {
        page: 1,
        pageSize: this.pageSize,
        total: 0
      },
      loading: false,

      // 搜索表单
      searchForm: {},

      // 表单弹窗状态
      formVisible: false,
      isCreate: true,
      formModel: {}
    };
  },

  computed: {
    // 自动在最后拼接一个 actions 列
    columnsWithActions() {
      const hasActions = this.columns.some(col => col.key === 'actions');
      if (hasActions) return this.columns;
      return [
        ...this.columns,
        { key: 'actions', title: '操作', align: 'center' }
      ];
    }
  },

  created() {
    // 根据 searchFields 初始化 searchForm 的字段
    const initial = {};
    this.searchFields.forEach(f => {
      initial[f.key] = f.defaultValue !== undefined ? f.defaultValue : '';
    });
    this.searchForm = initial;

    this.loadList();
  },

  methods: {
    // 核心：统一的列表加载逻辑
    async loadList() {
      this.loading = true;
      try {
        const { page, pageSize } = this.pagination;
        const params = {
          ...this.searchForm,
          page,
          pageSize
        };

        const { list, total } = await this.fetchList(params);

        this.list = Array.isArray(list) ? list : [];
        this.pagination.total = Number(total || 0);
      } catch (e) {
        console.error('[BaseCrudPage] loadList error:', e);
        // 可根据需要抛事件给外部
        this.$emit('load-error', e);
      } finally {
        this.loading = false;
      }
    },

    reload() {
      this.loadList();
    },

    // 搜索相关
    handleSearch() {
      this.pagination.page = 1;
      this.loadList();
    },

    handleReset() {
      const reset = {};
      this.searchFields.forEach(f => {
        reset[f.key] = f.defaultValue !== undefined ? f.defaultValue : '';
      });
      this.searchForm = reset;
      this.pagination.page = 1;
      this.loadList();
    },

    // 分页相关
    handlePageChange(newPage) {
      this.pagination.page = newPage;
      this.loadList();
    },

    handlePageSizeChange(newSize) {
      this.pagination.pageSize = newSize;
      this.pagination.page = 1;
      this.loadList();
    },

    // 新建 / 编辑 / 删除
    onCreate() {
      if (!this.createItem) {
        console.warn('[BaseCrudPage] createItem 未传入');
      }
      this.isCreate = true;
      this.formModel = this.createDefaultModel() || {};
      this.formVisible = true;
    },

    onEdit(row) {
      if (!this.updateItem) {
        console.warn('[BaseCrudPage] updateItem 未传入');
      }
      this.isCreate = false;
      this.formModel = this.mapEditModel(row) || {};
      this.formVisible = true;
    },

    async onDelete(row) {
      if (!this.deleteItem) {
        console.warn('[BaseCrudPage] deleteItem 未传入');
        return;
      }
      const ok = window.confirm('确认删除该条记录吗？');
      if (!ok) return;

      try {
        await this.deleteItem(row);
        this.$emit('deleted', row);
        this.loadList();
      } catch (e) {
        console.error('[BaseCrudPage] delete error:', e);
      }
    },

    closeForm() {
      this.formVisible = false;
    },

    async submitForm() {
      try {
        if (this.isCreate) {
          if (!this.createItem) return;
          await this.createItem(this.formModel);
          this.$emit('created', this.formModel);
        } else {
          if (!this.updateItem) return;
          await this.updateItem(this.formModel);
          this.$emit('updated', this.formModel);
        }
        this.formVisible = false;
        this.loadList();
      } catch (e) {
        console.error('[BaseCrudPage] submitForm error:', e);
      }
    }
  }
};
</script>

<style scoped>
.base-crud-page {
  position: relative;
}

/* 极简弹窗样式，只做演示用，实际可替换为 UI 组件库的 Dialog */
.crud-dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.crud-dialog {
  width: 520px;
  max-width: 90%;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.crud-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  font-weight: bold;
}

.crud-dialog__close {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
}

.crud-dialog__body {
  padding: 12px;
}
</style>
```

---

### 9.2 业务页面中如何使用 BaseCrudPage

示例：用户管理列表页 `UserListPage.vue`。

```vue
<template>
  <BaseCrudPage
    :columns="columns"
    :search-fields="searchFields"
    :fetch-list="fetchUserList"
    :create-item="createUser"
    :update-item="updateUser"
    :delete-item="deleteUser"
    :create-default-model="createDefaultUser"
    :map-edit-model="mapEditUser"
  >
    <!-- 自定义某些搜索字段 -->
    <template #field-city="{ field, value, set }">
      <select class="bsf-control" :value="value || ''" @change="e => set(e.target.value)">
        <option value="">全部城市</option>
        <option value="北京">北京</option>
        <option value="上海">上海</option>
        <option value="广州">广州</option>
      </select>
    </template>

    <!-- 自定义列表某一列 -->
    <template #col-name="{ value, rowIndex }">
      <span>{{ rowIndex + 1 }}.</span>
      <strong style="margin-left: 4px">{{ value }}</strong>
    </template>

    <!-- 自定义行操作（可覆盖默认 编辑/删除） -->
    <template #row-actions="{ row, edit, remove }">
      <button @click="edit()">编辑</button>
      <button style="margin-left: 8px" @click="remove()">删除</button>
      <button style="margin-left: 8px" @click="viewDetail(row)">详情</button>
    </template>

    <!-- 自定义表单内容 -->
    <template #form="{ model, isCreate, submit, cancel }">
      <div class="form-item">
        <label>姓名：</label>
        <input v-model="model.name" />
      </div>
      <div class="form-item">
        <label>年龄：</label>
        <input type="number" v-model.number="model.age" />
      </div>
      <div class="form-item">
        <label>城市：</label>
        <input v-model="model.city" />
      </div>
      <div style="margin-top: 12px; text-align: right;">
        <button @click="cancel">取消</button>
        <button style="margin-left: 8px" @click="submit">
          {{ isCreate ? '创建' : '保存' }}
        </button>
      </div>
    </template>
  </BaseCrudPage>
</template>

<script>
import BaseCrudPage from './BaseCrudPage.vue';

export default {
  name: 'UserListPage',
  components: { BaseCrudPage },

  data() {
    return {
      columns: [
        { key: 'name', title: '姓名', align: 'left' },
        { key: 'age', title: '年龄', align: 'center' },
        { key: 'city', title: '城市', align: 'left' }
        // actions 列会由 BaseCrudPage 自动追加
      ],
      searchFields: [
        { key: 'keyword', label: '关键词', type: 'input', placeholder: '姓名 / 城市' },
        { key: 'city', label: '城市', type: 'select', options: [], span: 1 }
      ]
    };
  },

  methods: {
    // 统一的 fetchList：做完接口适配，返回 { list, total }
    async fetchUserList(params) {
      const { keyword, city, page, pageSize } = params;
      // TODO: 替换成你的实际接口
      const res = await fakeApiGetUserList({ keyword, city, page, pageSize });

      return {
        list: res.records.map(item => ({
          id: item.id,
          name: item.user_name,
          age: item.age_years,
          city: item.city_desc
        })),
        total: res.total_count
      };
    },

    // 新建
    async createUser(model) {
      // TODO: 调用后端创建接口
      await fakeApiCreateUser(model);
    },

    // 编辑
    async updateUser(model) {
      // TODO: 调用后端更新接口
      await fakeApiUpdateUser(model);
    },

    // 删除
    async deleteUser(row) {
      // TODO: 调用后端删除接口
      await fakeApiDeleteUser(row.id);
    },

    // 创建默认表单
    createDefaultUser() {
      return {
        name: '',
        age: 18,
        city: ''
      };
    },

    // 行数据 -> 表单模型
    mapEditUser(row) {
      return {
        id: row.id,
        name: row.name,
        age: row.age,
        city: row.city
      };
    },

    viewDetail(row) {
      console.log('查看详情', row);
    }
  }
};
</script>

<style scoped>
.form-item {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}
.form-item > label {
  width: 60px;
}
.form-item > input {
  flex: 1;
}
</style>
```

> 提示：上面的 `fakeApiXXX` 函数只是示意。实际项目中你可以直接用已有的 `request` 封装：  
> - 在 `fetchUserList` 里做「请求参数 + 响应数据」的适配  
> - 在 `createUser / updateUser / deleteUser` 中直接调用对应接口即可。

到这里，一整套从「render 表格内核」→「列表骨架」→「搜索表单」→「CRUD 页面内核」的体系就打通了。  
后续你在新页面中基本只需要：

1. 配 `columns` / `searchFields`
2. 写一组 `fetchList + createItem + updateItem + deleteItem`
3. 用几个插槽定制列表现和表单内容

就可以快速搭一个完整的增删改查页面，而不用每次都从头写模板和状态管理。
