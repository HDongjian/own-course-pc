/*
 * @Author: HaoDongjian
 * @Date: 2022-04-21 15:26:30
 * @LastEditors: HaoDongjian
 * @LastEditTime: 2022-11-16 14:32:17
 * @Description:
 */
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    account: {},
    menus: [],
    pageSize: 15
  },
  mutations: {
    account (state, account) {
      state.account = account
    },
    menus (state, menus) {
      state.menus = menus
    },
    limit (state, limit) {
      state.limit = limit
    }
  }
})
