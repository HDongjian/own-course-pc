import { mapState } from 'vuex'
export default {
  data () {
    return {
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
  computed: mapState({
    account: state => state.account
  }),
  methods: {
    async initCatch () {
      if (!this.getCatch) return
      this.studentList = await this.getStudent()
      await this.getCompany()
      await this.getSubjects()
      this.nextTick && this.nextTick()
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
    }

  }
}
