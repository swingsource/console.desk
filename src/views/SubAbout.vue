<template>
  <div class="sub-about">
    <h2>This is a sub about page</h2>
    <el-row>
      <el-button class="sbtn1">默认按钮-子组件</el-button>
      <el-button class="sbtn2" type="primary">主要按钮-子组件</el-button>
      <el-button class="sbtn3" type="success">成功按钮-子组件</el-button>
      <el-button class="sbtn4" type="info">信息按钮-子组件</el-button>
      <el-button class="sbtn5" type="warning">警告按钮-子组件</el-button>
      <el-button class="sbtn6" type="danger">危险按钮-子组件</el-button>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'SubAbout'
}
</script>

<style scoped></style>
