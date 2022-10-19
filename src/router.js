import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)
let router = new Router({
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('./views/Login.vue')
    },
    {
      path: '/course',
      name: 'Course',
      component: () => import('./views/Course.vue')
    },
    {
      path: '/',
      component: Home,
      children: [
        {
          path: '/',
          name: 'Default',
          meta: { intercept: true },
          component: () => import('./views/Default.vue')
        },
        {
          path: '/teacher-course',
          name: 'TeacherCourse',
          meta: { intercept: true },
          component: () => import('./views/teacher/TeacherCourse.vue')
        },
        {
          path: '/course-management',
          name: 'CourseManagement',
          meta: { intercept: true },
          component: () => import('./views/course/CourseManagement.vue')
        },
        {
          path: '/statistics-summary',
          name: 'Summary',
          meta: { intercept: true },
          component: () => import('./views/statistics/Summary.vue')
        },
        {
          path: '/statistics-analysis',
          name: 'Analysis',
          meta: { intercept: true },
          component: () => import('./views/statistics/Analysis.vue')
        },
        {
          path: '/teacher-company',
          name: 'TeacherCompany',
          meta: { intercept: true },
          component: () => import('./views/teacher/TeacherCompany.vue')
        },
        {
          path: '/student-management',
          name: 'StudentManagement',
          meta: { intercept: true },
          component: () => import('./views/student/StudentManagement.vue')
        },
        {
          path: '/exam-management',
          name: 'ExamManagement',
          meta: { intercept: true },
          component: () => import('./views/system/ExamManagement.vue')
        },
        {
          path: '/role-management',
          name: 'RoleManagement',
          meta: { intercept: true },
          component: () => import('./views/system/RoleManagement.vue')
        },
        {
          path: '/menu-management',
          name: 'MenuManagement',
          meta: { intercept: true },
          component: () => import('./views/system/MenuManagement.vue')
        },
        {
          path: '/user-management',
          name: 'UserManagement',
          meta: { intercept: true },
          component: () => import('./views/system/UserManagement.vue')
        },
        {
          path: '/time-management',
          name: 'TimeManagent',
          meta: { intercept: true },
          component: () => import('./views/teacher/TimeManagent.vue')
        },
        {
          path: '/student-course',
          name: 'TimeManagent',
          meta: { intercept: true },
          component: () => import('./views/student/StudentCourse.vue')
        },
        {
          path: '/icon-management',
          name: 'IconManagement',
          meta: { intercept: true },
          component: () => import('./views/system/IconManagement.vue')
        },
        {
          path: '/order-management',
          name: 'OrderManagement',
          meta: { intercept: true },
          component: () => import('./views/order/OrderManagement.vue')
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.meta.intercept) {
    if (Vue.store.state.account && Vue.store.state.account.userId) {
      next()
    } else {
      router.push('/login')
    }
  } else {
    next()
  }
})

export default router
