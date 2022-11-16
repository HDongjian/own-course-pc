/*
 * @Author: HaoDongjian
 * @Date: 2022-04-21 15:26:30
 * @LastEditors: HaoDongjian
 * @LastEditTime: 2022-11-16 14:30:52
 * @Description:
 */
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import iView from 'iview'
import store from './store'
import lib from './utils/lib'
import Bus from './utils/bus'
import Http from './utils/http'
import Components from './components/index.js'
import mixin from './mixins/mixin'
import icons from './icons/index'
import scroll from 'vue-seamless-scroll'
import './styles/index.less'
import './utils/polyfill'

Vue.store = store
Vue.use(iView)
Vue.use(lib)
Vue.use(Http)
Vue.use(Bus)
Vue.use(Components)
Vue.use(scroll)
Vue.config.productionTip = false
Vue.mixin(mixin)
Vue.use(icons)
const dashboardFlexible = require('lib-flexible-for-dashboard')
dashboardFlexible.init(16 / 9)

let account = sessionStorage.getItem('account')
if (account) {
  store.commit('account', JSON.parse(account))
}

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
