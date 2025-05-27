import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import '@/plugins/normalize.css.js'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)

import GuidePlugin from '@/plugins/guideLite'
Vue.use(GuidePlugin)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
