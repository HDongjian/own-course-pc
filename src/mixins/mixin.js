import { mapState } from 'vuex'
export default {
  data () {
    return {
      teacherList: [],
      teacherType: {},
      studentList: [],
      studentType: {},
      companyList: [],
      subjectType: {},
      companyType: {},
      orderCompanyType: {}
    }
  },
  mounted () {
    this.initCatch()
  },
  computed: {
    ...mapState({ account: 'account' }),
    isStudent () {
      return !!this.account.studentId
    },
    orderStudentType () {
      let result = {}
      for (const item of this.studentList) {
        if (Object.hasOwnProperty.call(this.orderCompanyType, item.companyId)) {
          result[item.studentId] = item.studentName
        }
      }
      return result
    }
  },
  methods: {
    async surplusClass (studentId) {
      let have = await this.getAllCouseByStudentId(studentId)
      let orderTotal = await this.getAllOrderByStudentId(studentId)
      return orderTotal - have
    },
    getAllCouseByStudentId (studentId) {
      return this.$http.request({
        method: 'get',
        url: `/api/course/list?studentId=${studentId}`
      }).then((res) => {
        let data = res.data.data || []
        let result = 0
        for (const item of data) {
          let second = new Date(item.endTime).getTime() - new Date(item.startTime).getTime()
          result += (second / 1000 / 60 / 60)
        }
        return result
      })
    },
    getAllOrderByStudentId (studentId) {
      return this.$http.request({
        method: 'get',
        url: `/api/order/list?studentId=${studentId}`
      }).then((res) => {
        let data = res.data.data || []
        let result = 0
        for (const item of data) {
          result += Number(item.classCount || '0')
        }
        return result
      })
    },
    async initCatch () {
      if (!this.getCatch) return
      this.studentList = await this.getStudent()
      await this.getCompany()
      await this.getSubjects()
      this.teacherList = await this.getTeacher()
      this.nextTick && this.nextTick()
    },
    getTeacher () {
      return this.$http.request({
        method: 'get',
        url: `/api/user/list`
      }).then((res) => {
        return res.data.data.filter(item => {
          this.$set(this.teacherType, item.roleId, item.name)
          return Number(item.roleId) === 2
        })
      })
    },
    getStudent () {
      this.studentType = {}
      return this.$http.request({
        method: 'get',
        url: `/api/student/list`
      }).then((res) => {
        for (const data of res.data.data) {
          this.$set(this.studentType, data.studentId, data.studentName)
        }
        return res.data.data
      })
    },
    getCompany () {
      return this.$http.request({
        method: 'get',
        url: `/api/company/list`
      }).then((res) => {
        this.companyList = res.data.data
        for (const data of res.data.data) {
          if (data.isOrder === '1') {
            this.$set(this.orderCompanyType, data.companyId, data.companyName)
          }
          this.$set(this.companyType, data.companyId, data.companyName)
        }
      })
    },
    getSubjects () {
      return this.$http.request({
        method: 'get',
        url: `/api/subject/list`
      }).then((res) => {
        for (const data of res.data.data) {
          this.$set(this.subjectType, data.subjectId, data.subjectName)
        }
      })
    },
    getSETime (row) {
      return this.$lib.myMoment(row.startTime).formate('HH:mm') + '-' + this.$lib.myMoment(row.endTime).formate('HH:mm')
    },
    GW (d) {
      return new Date(d).getDay()
    },
    GT () {
      let t = new Date()
      return this.$lib.myMoment(t).formate('YYYY-MM-DD')
    },
    SD (t) {
      return this.$lib.myMoment(t).formate('YYYY-MM-DD')
    },
    GS (t) {
      t = t || new Date()
      return new Date(t).getTime()
    }
  }
}
