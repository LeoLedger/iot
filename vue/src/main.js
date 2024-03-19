import Vue from 'vue'
// 全局事件对象
Vue.prototype.$globalEvent = new Vue()
// import Cookies from 'js-cookie'
import 'normalize.css' // A modern alternative to CSS resets

import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import locale from 'element-ui/lib/locale/lang/en' // lang i18n
import i18n from './lang' // Internationalization
import '@/styles/index.scss' // global css

import '@/styles/iconfont.css'

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control
import * as filters from './filters' // global filters全局过滤器
// 全局混入
import mixinDict from '@/mixin'
Vue.mixin(mixinDict)
// 全局组件
import globalComponent from '@/components'
Vue.use(globalComponent)
// 全局布局组件
import Layout from '@/components/layout'
Vue.use(Layout)
// 添加全局 directive
import directives from '@/directive'
Object.keys(directives).forEach(key => {
    Vue.directive(key, directives[key])
})

// 兼容ie11
import 'babel-polyfill'
// 百度地图
import BaiduMap from '@/components/vue-baidu-map/components'
Vue.use(BaiduMap, {
    ak: '0n7IG5lHNun8ivuGXc9qWNGMUObGY852' // 临时秘钥
})
Vue.config.errorHandler = (err, vm, info) => {
    console.warn('errorHandler', err, info)
}

import LightTimeline from 'vue-light-timeline'
import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'

Vue.use(Viewer)
Viewer.setDefaults({
    zIndex: 9999,
    Options: { 'inline': true, 'button': true, 'navbar': true, 'title': true, 'toolbar': true, 'tooltip': true, 'movable': true, 'zoomable': true, 'rotatable': true, 'scalable': true, 'transition': true, 'fullscreen': true, 'keyboard': true, 'url': 'data-source' }
})

Vue.use(LightTimeline)

Vue.use(Element, {
    size: 'mini', // set element-ui default size
    i18n: (key, value) => i18n.t(key, value)
})

// register global utility filters.全局过滤器
Object.keys(filters).forEach(key => {
    Vue.filter(key, filters[key])
})

new Vue({
    el: '#app',
    router,
    store,
    i18n,
    render: h => h(App)
})
