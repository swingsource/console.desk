import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Index')
  },
  {
    path: '/renderList',
    name: 'RenderList',
    component: () => import('@/views/demo/TestRenderList')
  },
  {
    path: '/advancedTable',
    name: 'AdvancedTable',
    component: () => import('@/views/demo/TestAdvancedTable')
  },
  {
    path: '/searchForm',
    name: 'SearchForm',
    component: () => import('@/views/demo/TestSearchForm')
  },
  {
    path: '/listPage',
    name: 'ListPage',
    component: () => import('@/views/demo/TestListPage')
  }
]

const router = new VueRouter({
  routes
})

export default router
