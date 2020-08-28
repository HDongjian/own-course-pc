
<template>
  <div class="home-container hw-100">
    <Layout class="hw-100">
      <Header>
        <h1 @click="menuSelect('/')" class="title">我的课表</h1>
        <div v-if="account.userId" class="account">
          <Dropdown @on-click="dropClick">
            <a href="javascript:void(0)">
              <img class="avatar" v-if="account.avatar" :src="fls+account.avatar" alt="头像">
              <img class="avatar" v-else src="../assets/default-avatar.png" alt="头像">
              <span class="name">{{account.name}}</span>
              <Icon type="ios-arrow-down"></Icon>
            </a>
            <DropdownMenu slot="list">
              <DropdownItem name="layout">退出</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <template v-else>
          <a href="javascript:void(0)" @click="toLogin">登录</a>
        </template>
      </Header>
        <Layout style="height: calc(100% - 60px);">
          <Sider collapsible hide-trigger :collapsed-width="collapsedWidth" v-model="isCollapsed" :style="{background: '#fff'}">
            <div @click="isCollapsed = !isCollapsed" class="sider-trigger">
              <Icon :size="25" type="md-options" />
            </div>
            <Menu  width="auto" :class="menuitemClasses" :active-name="$route.path" @on-select="menuSelect" theme="light">
              <div v-for="(menu,i) in menuList" :key="i">
                <MenuItem v-if="!menu.children" :name="menu.value">
                  <Icon class="menu-icon" :size="20" :type="menu.icon" />
                  <span>{{menu.label}}</span>
                </MenuItem>
                <Submenu v-else :name="menu.value">
                  <template slot="title">
                    <Icon class="menu-icon" :size="20" :type="menu.icon" />
                    <span>{{menu.label}}</span>
                  </template>
                  <MenuItem v-for="second in menu.children" :key="second.value" :name="second.value">
                    <span>{{second.label}}</span>
                  </MenuItem>
                </Submenu>
              </div>
            </Menu>
          </Sider>
          <Layout style="height:100%;" class="left-layout">
            <Content>
              <router-view/>
            </Content>
        </Layout>
      </Layout>
    </Layout>
  </div>
</template>
<script>
import { fls } from '@/config'

export default {
  data () {
    return {
      getCatch: true,
      fls,
      menuWidth: '200px',
      isCollapsed: false,
      collapsedWidth: 78,
      menuList: []
    }
  },
  computed: {
    menuitemClasses: function () {
      return [
        'menu-item',
        this.isCollapsed ? 'collapsed-menu' : ''
      ]
    }
  },
  created () {
    this.getMenus()
  },
  mounted () {
    this.watchDocEvent()
  },
  methods: {
    menuSelect (name) {
      this.$router.push(name)
    },
    toLogin () {
      this.$router.push('/login')
    },
    dropClick (name) {
      if (name === 'layout') {
        this.$http.request({
          method: 'post',
          url: `/layout`
        }).then((res) => {
          if (res.data.code === 200) {
            sessionStorage.clear()
            this.$store.commit('account', {})
            this.$router.push('/login')
          }
        })
      }
    },
    getMenus () {
      this.$http.request({
        method: 'get',
        url: `/menus`
      }).then((res) => {
        this.menuList = res.data.data.map(item => {
          item.id = item.menuId
          item.label = item.menuName
          item.value = item.path
          item.icon = item.menuIcon
          return item
        })
        this.menuList = this.$lib.dealTreeList(this.menuList)
      })
    },
    watchDocEvent () {
      let vm = this
      this.$lib.addEventListener(document, 'click', this.documentEmit.bind(vm, 'click'))
      this.$lib.addEventListener(document, 'wheel', this.documentEmit.bind(vm, 'wheel'))
      this.$lib.addEventListener(document, 'contextmenu', this.documentEmit.bind(vm, 'contextmenu'))
    },
    documentEmit (type) {
      this.$bus.$emit('document', type)
    }
  },
  beforeDestroy () {
    this.$lib.removeEventListener(document, 'click', this.documentEmit('click'))
    this.$lib.removeEventListener(document, 'wheel', this.documentEmit('wheel'))
    this.$lib.removeEventListener(document, 'contextmenu', this.documentEmit('contextmenu'))
  }
}
</script>
