<template>
  <div>
    <h3>BaseSearchForm 示例</h3>
    <BaseSearchForm
      :fields="searchFields"
      :form.sync="searchForm"
      @submit="handleSearch"
      @reset="handleReset"
    >
      <template v-slot:field-age="{ field, value, form }">
<!--        <input :value="value" @input="e => set(e.target.value)"/>-->
        <input v-model="form[field.key]" />
      </template>
    </BaseSearchForm>
  </div>
</template>

<script>
import BaseSearchForm from '@/components/base/BaseSearchForm'

export default {
  name: 'TestSearchForm',
  components: {
    BaseSearchForm
  },
  data() {
    return {
      // 搜索字段配置
      searchFields: [
        {
          key: 'keyword',
          label: '关键词',
          type: 'input',
          placeholder: '请输入姓名或城市'
        },
        {
          key: 'age',
          label: '年龄',
          type: 'input',
          placeholder: '请输入年龄'
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
        age: '',
        city: ''
      }
    }
  },
  methods: {
    // 点击 BaseSearchForm 的搜索
    handleSearch(form) {
      console.log('>>>>>>>>  handleSearch')
      console.log(form)
    },

    // 点击 BaseSearchForm 的重置
    handleReset() {
      console.log('>>>>>>>>  handleReset')
    },
  }
}
</script>

<style scoped>

</style>
