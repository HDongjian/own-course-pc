<!--
 * @Author: HaoDongjian
 * @Date: 2022-04-21 15:26:30
 * @LastEditors: HaoDongjian
 * @LastEditTime: 2022-10-19 14:37:55
 * @Description:
-->
<template>
  <div class="login-container">
    <Card class="login-card">
      <div slot="title">雅思小能手</div>
      <Form :model="loginForm" :rules="loginFormRule" ref="loginForm" :status-icon="true">
        <FormItem label="用户名" prop="userName">
          <Input v-model="loginForm.userName" placeholder="请输入用户名" ref="username"
            :maxlength="40">
          <!-- eslint-disable-next-line vue/no-parsing-error -->
          </Input>
        </FormItem>
        <FormItem label="密码" prop="password">
          <Input v-model="loginForm.password" placeholder="请输入密码" type="password"
            :maxlength="40">
          <!-- eslint-disable-next-line vue/no-parsing-error -->
          </Input>
        </FormItem>
      </Form>
      <div class="buttons">
        <Button type="primary" long @click="login(false)">登 录</Button>
        <Button type="success" long @click="login(true)">查 看</Button>
      </div>
    </Card>
  </div>
</template>

<script>
import md5 from 'js-md5'
export default {
  name: 'login',
  data () {
    return {
      loginForm: {
        userName: '',
        password: ''
      },
      loginFormRule: {
        userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    }
  },
  methods: {
    login (check) {
      this.$refs.loginForm.validate((success) => {
        if (!success) return
        this.$http.request({
          method: 'post',
          url: '/api/login',
          data: {
            userName: this.loginForm.userName,
            password: md5(this.loginForm.password)
          }
        }).then((res) => {
          if (res.data.data) {
            sessionStorage.setItem('account', JSON.stringify(res.data.data))
            this.$store.commit('account', res.data.data)
            if (check) {
              this.$router.push('/course')
            } else {
              this.$router.push('/')
              // setTimeout(() => {
              //   location.href = web
              // }, 500)
            }
          }
        })
      })
    }
  }
}
</script>

<style lang="less">
.login-container{
  .ivu-form-item-required .ivu-form-item-label:before{
    display: none;
  }
  .ivu-card-head{
    >div{
      font-size: 18px;
    }
  }
  .ivu-form-item {
    .ivu-input-with-prefix{
      padding-left: 10px;
    }
    .ivu-input-prefix{
      display: none;
    }
    .ivu-input{
      height: 44px;
      line-height: 44px;
      font-size: 16px;
    }
    .ivu-form-item-label{
      font-size: 16px;
      margin-bottom: 6px;
    }
  }
  .ivu-btn{
    height: 44px;
    font-size: 16px;
  }
  .buttons{
    display: flex;
    .ivu-btn-primary{
      flex: 3;
      margin-right: 16px;
    }
    .ivu-btn-success{
      flex: 2;
    }

  }
}
</style>
