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
import './styles/index.less'

Vue.store = store
Vue.use(iView)
Vue.use(lib)
Vue.use(Http)
Vue.use(Bus)
Vue.use(Components)
Vue.config.productionTip = false
Vue.mixin(mixin)

let account = sessionStorage.getItem('account')
if (account) {
  store.commit('account', JSON.parse(account))
}

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')