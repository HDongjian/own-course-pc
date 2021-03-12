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
      companyType: {}
    }
  },
  mounted () {
    this.initCatch()
  },
  computed: {
    ...mapState({ account: 'account' }),
    isStudent () {
      return !!this.account.studentId
    }
  },
  methods: {
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
        url: `/user/list`
      }).then((res) => {
        return res.data.data.filter(item => {
          this.$set(this.teacherType, item.roleId, item.name)
          return Number(item.roleId) === 2
        })
      })
    },
    getStudent () {
      return this.$http.request({
        method: 'get',
        url: `/student/list`
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
        url: `/company/list`
      }).then((res) => {
        this.companyList = res.data.data
        for (const data of res.data.data) {
          this.$set(this.companyType, data.companyId, data.companyName)
        }
      })
    },
    getSubjects () {
      return this.$http.request({
        method: 'get',
        url: `/subject/list`
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
