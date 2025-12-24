<template>
  <div>
    <h2>BasePageList 示例</h2>
    <base-list-page
      :columns="columns"
      :data="list"
      :pagination="pagination"
      :search-text.sync="searchText"
      :loading="loading"
      @search="handleSearch"
      @refresh="fetchList"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
    >
      <template v-slot:toolbar-left>
        <base-search-form
          :fields="searchFields"
          :form.sync="searchForm"
          @submit="handleSearch"
          @reset="handleReset"
        />
      </template>
      <!-- 自定义 name 列 -->
      <template v-slot:col-name="{ value, rowIndex }">
        <span>{{ rowIndex + 1 }}. </span>
        <strong>{{ value }}</strong>
      </template>

      <!-- 自定义 actions 列 -->
      <template v-slot:col-actions="{ row }">
        <button @click="onView(row)">查看</button>
        <button style="margin-left: 8px" @click="onEdit(row)">编辑</button>
      </template>

      <!-- 自定义工具栏右侧（比如“新建 + 导出”按钮） -->
      <template v-slot:toolbar-right>
        <button class="blp-btn blp-btn--primary" @click="onCreate">
          新建用户
        </button>
        <button class="blp-btn" style="margin-left: 8px" @click="fetchList">
          刷新
        </button>
      </template>
    </base-list-page>
  </div>
</template>

<script>
import BaseListPage from '@/components/base/BaseListPage'
import BaseSearchForm from '@/components/base/BaseSearchForm'

export default {
  name: 'TestListPage',
  components: {
    BaseListPage,
    BaseSearchForm
  },

  data() {
    return {
      loading: false,
      searchText: '',
      // 搜索字段配置
      searchFields: [
        {
          key: 'keyword',
          label: '关键词',
          type: 'input',
          placeholder: '请输入姓名或城市'
        },
        {
          key: 'city',
          label: '城市',
          type: 'select',
          options: [
            { label: '全部', value: '' },
            { label: '北京', value: '北京' },
            { label: '上海', value: '上海' },
            { label: '广州', value: '广州' },
            { label: '深圳', value: '深圳' }
          ]
        }
      ],
      // 搜索表单值
      searchForm: {
        keyword: '',
        city: ''
      },
      columns: [
        { key: 'name', title: '姓名', align: 'left' },
        {
          key: 'age',
          title: '年龄',
          align: 'center',
          render(h, { value }) {
            return h('span', value + ' 岁')
          }
        },
        { key: 'city', title: '城市', align: 'left' },
        { key: 'actions', title: '操作', align: 'center' }
      ],
      list: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      }
    }
  },

  created() {
    this.fetchList()
  },

  methods: {
    // 模拟接口请求，根据 searchForm + pagination 生成数据
    async fetchList() {
      this.loading = true
      try {
        const all = []

        // 假装有 80 条数据
        for (let i = 1; i <= 80; i++) {
          all.push({
            name: '用户 ' + i,
            age: 20 + ((i + 3) % 10),
            city: ['北京', '上海', '广州', '深圳'][i % 4]
          })
        }

        // 简单过滤：关键词 & 城市
        const { keyword, city } = this.searchForm
        let filtered = all

        if (keyword) {
          filtered = filtered.filter(item =>
            item.name.includes(keyword) || item.city.includes(keyword)
          )
        }

        if (city) {
          filtered = filtered.filter(item => item.city === city)
        }

        const { page, pageSize } = this.pagination
        const start = (page - 1) * pageSize
        const end = start + pageSize

        this.pagination.total = filtered.length
        this.list = filtered.slice(start, end)
      } finally {
        this.loading = false
      }
    },

    // 点击 BaseSearchForm 的搜索
    handleSearch() {
      this.pagination.page = 1
      this.fetchList()
    },

    // 点击 BaseSearchForm 的重置
    handleReset() {
      this.pagination.page = 1
      this.fetchList()
    },

    handlePageChange(newPage) {
      this.pagination.page = newPage
      this.fetchList()
    },

    handlePageSizeChange(newSize) {
      this.pagination.pageSize = newSize
      this.pagination.page = 1
      this.fetchList()
    },

    onView(row) {
      console.log('查看：', row)
    },
    onEdit(row) {
      console.log('编辑：', row)
    },
    onCreate() {
      console.log('新建用户')
    }
  }
}
</script>
