<template>
  <div class="summary-container">
    <div class="tool">
      <Form ref="query" :model="query" inline :label-width="80">
        <FormItem prop="companyId" label='机构' :label-width="40">
          <Select clearable style="width: 160px" v-model="query.companyId" placeholder="机构">
            <Option v-for="(label,value) in companyType" :key="value" :value="value">{{label}}</Option>
          </Select>
        </FormItem>
        <FormItem label="月份" prop="mouth" :label-width="40">
          <DatePicker clearable  @on-change="mouthChange" :editable="false" type="month" placeholder="选择月份" v-model="query.mouth" style="width: 160px"></DatePicker>
        </FormItem>
        <FormItem :label-width="20">
          <Button type="primary" @click="load()">查询</Button>
        </FormItem>
      </Form>
    </div>
    <Row>
      <Col span="11">
        <Card>
          <div slot="title" style="height:36px;line-height:36px" class="cl">
            <span class="fl">学生统计表</span>
            <Button class="fr" type="primary"  @click="exportStudent()">导出</Button>
          <!--eslint-disable-next-line vue/no-parsing-error -->
          </div>
          <Table ref="STable" :columns="studentColumns" :data="stucentData.student"></Table>
        </Card>
      <!--  eslint-disable-next-line vue/no-parsing-error -->
      </Col>
      <Col span="11" offset="2">
        <Card dis-hover>
          <div slot="title" style="height:36px;line-height:36px" class="cl">
            <span class="fl">科目统计表</span>
          <!--eslint-disable-next-line vue/no-parsing-error -->
          </div>
          <Table :columns="subjectColumns" :data="stucentData.subject"></Table>
        </Card>
      <!--  eslint-disable-next-line vue/no-parsing-error -->
      </Col>
    </Row>
  </div>
</template>

<script>
export default {

  data () {
    return {
      getCatch: true,
      query: {
        startTime: '',
        endTime: '',
        mouth: '',
        companyId: ''
      },
      data: [],
      studentList: [],
      studentType: {},
      companyList: [],
      subjectType: {},
      companyType: {},
      studentColumns: [{
        title: '序号',
        align: 'center',
        key: 'index'
      }, {
        title: '学生姓名',
        align: 'center',
        key: 'studentName'
      }, {
        title: '小时数',
        key: 'hours',
        align: 'center'
      }, {
        title: '课次(1.5小时/次)',
        key: 'count',
        align: 'center'
      }],
      subjectColumns: [{
        title: '序号',
        align: 'center',
        key: 'index'
      }, {
        title: '科目',
        align: 'center',
        key: 'subjectName'
      }, {
        title: '小时数',
        key: 'hours',
        align: 'center'
      }]
    }
  },
  computed: {
    stucentData () {
      let obj = {}
      let subObj = {}
      let data = []
      let subData = []
      let total = 0
      let index = 0
      let subIndex = 0
      for (const c of this.data) {
        let hour = ((new Date(c.endTime).getTime() - new Date(c.startTime).getTime()) / 3600000)
        total += hour
        if (obj[c.studentId]) {
          obj[c.studentId] += hour
        } else {
          obj[c.studentId] = hour
        }
        if (subObj[c.subjectId]) {
          subObj[c.subjectId] += hour
        } else {
          subObj[c.subjectId] = hour
        }
      }
      for (const key in obj) {
        index++
        data.push({
          index,
          studentName: this.studentType[key],
          hours: obj[key],
          count: (obj[key] / 1.5).toFixed(1)
        })
      }
      for (const key in subObj) {
        subIndex++
        subData.push({
          index: subIndex,
          subjectName: this.subjectType[key],
          hours: subObj[key]
        })
      }
      data.push({
        index: '合计',
        studentName: '--',
        hours: total,
        count: (total / 1.5).toFixed(1)
      })
      subData.push({
        index: '合计',
        subjectName: '--',
        hours: total
      })
      return {
        student: data,
        subject: subData
      }
    }
  },
  created () {
    this.initData()
  },
  methods: {
    initData () {
      this.initSearch()
      this.load()
    },
    exportStudent (type) {
      this.$refs.STable.exportCsv({
        filename: `${this.$lib.myMoment(this.query.mouth).formate('YYYY-MM')}课时统计`
      })
    },
    initSearch () {
      this.query.mouth = this.$lib.myMoment().formate('YYYY-MM')
      this.query.startTime = this.$lib.getDateMonthFirst()
      this.query.endTime = this.$lib.getDateMonthLast()
    },
    load () {
      let params = { ...this.query, pageSize: this.$store.state.pageSize }
      params.startTime = params.startTime ? this.$lib.myMoment(params.startTime).formate('YYYY-MM-DD') + ' 00:00:00' : ''
      params.endTime = params.endTime ? this.$lib.myMoment(params.endTime).formate('YYYY-MM-DD') + ' 23:59:59' : ''
      this.$http.request({
        method: 'get',
        url: `/api/course/list`,
        params
      }).then((res) => {
        this.data = res.data.data
      })
    },
    mouthChange (mouth) {
      let date = mouth + '-01 00:00:00'
      this.query.startTime = this.$lib.getDateMonthFirst(date)
      this.query.endTime = this.$lib.getDateMonthLast(date)
    }
  }
}
</script>
