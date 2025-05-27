<template>
  <div class="about">
    <h1>This is an about page</h1>
    <el-row>
      <el-button class="btn1">默认按钮</el-button>
      <el-button class="btn2" type="primary">主要按钮</el-button>
      <el-button class="btn3" type="success">成功按钮</el-button>
      <el-button class="btn4" type="info">信息按钮</el-button>
      <el-button class="btn5" type="warning">警告按钮</el-button>
      <el-button class="btn6" type="danger">危险按钮</el-button>
    </el-row>
    <sub-about></sub-about>
    <!-- guide1 -->
    <!--    <overlay target-selector=".btn1"></overlay>-->

    <!-- guide2 -->
    <!--    <guide-overlay-->
    <!--      v-if="showGuide"-->
    <!--      :steps="steps"-->
    <!--      @finish="handleFinish"-->
    <!--    ></guide-overlay>-->

    <!-- guide3 manager -->
    <!--    <guide-overlay></guide-overlay>-->
    <!--    <el-button type="primary" @click="startGuide">开始引导</el-button>-->
  </div>
</template>

<script>
import SubAbout from '@/views/SubAbout'
// guide1
// import Overlay from '@/components/guide1/Overlay'

// guide2
// import GuideOverlay from '@/components/guide2/GuideOverlay'

// guide3 - 管理器
// import GuideOverlay from '@/components/guide3/GuideOverlay'
// import { guideManager } from '@/components/guide3/guideManager'

// guide4 - 管理器
// import GuideOverlay from '@/components/guide4/GuideOverlay'

// guide4 - 镂空专业版
// import GuideOverlay from '@/components/guide5/GuideOverlay'

export default {
  components: {
    SubAbout
    // Overlay,
    // GuideOverlay
  },
  data() {
    return {
      showGuide: true,
      steps: [
        {
          selector: '.btn1',
          text: '这是第一个按钮'
        },
        {
          selector: '.btn2',
          text: '这是第二个按钮'
        },
        {
          selector: '.btn3',
          text: '这是第三个按钮'
        }
      ]
    }
  },
  mounted() {
    this.$guide.setSteps(
      [
        { selector: '.btn1', text: '这是父组件的按钮' },
        { selector: '.sbtn3', text: '这是子组件的按钮' }
      ],
      {
        onfinish() {
          console.log('引导完成')
        }
      }
    )
    this.$guide.start()
  },
  methods: {
    handleFinish() {
      this.showGuide = false
    }
    // startGuide() {
    //   guideManager.setSteps([
    //     { selector: '.btn1', text: '这是父组件的按钮' },
    //     { selector: '.sbtn3', text: '这是子组件的按钮' }
    //   ])
    //   guideManager.start()
    // },
  }
}
</script>
