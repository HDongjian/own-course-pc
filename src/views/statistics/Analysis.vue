<template>
  <div class="analysis-container">
    <div class="tool">
      <Form ref="query" :model="query" inline :label-width="80">
        <FormItem label="日期" prop="startTime" :label-width="40">
          <DatePicker  v-model="query.startTime" type="date" placeholder="开始时间" style="width: 160px"></DatePicker>
        </FormItem>
        <FormItem label="—" class="date-line" prop="endTime" :label-width="20">
          <DatePicker v-model="query.endTime" type="date" placeholder="结束时间" style="width: 160px"></DatePicker>
        </FormItem>
        <!-- <FormItem label="月份" prop="mouth" :label-width="40">
          <DatePicker clearable  @on-change="mouthChange" :editable="false" type="month" placeholder="选择月份" v-model="query.mouth" style="width: 160px"></DatePicker>
        </FormItem> -->
        <FormItem :label-width="20">
          <Button type="primary" @click="load()">查询</Button>
          <Button @click="reset()">重置</Button>
        </FormItem>
      </Form>
    </div>
    <Row>
      <Col span="24">
        <Card>
          <div slot="title">每日课时分布图</div>
          <div class="e-box" ref="day"></div>
        </Card>
      <!--  eslint-disable-next-line vue/no-parsing-error -->
      </Col>
    </Row>
  </div>
</template>

<script>
import echarts from 'echarts'
import { dayCourse } from './options'
export default {

  data () {
    return {
      getCatch: true,
      query: {
        startTime: '',
        endTime: '',
        mouth: ''
      },
      data: [],
      classes: {}
    }
  },
  created () {
    this.initSearch()
  },
  methods: {
    nextTick () {
      this.load()
    },
    initSearch () {
      this.query.mouth = this.$lib.myMoment().formate('YYYY-MM')
      this.query.startTime = this.$lib.getDateMonthFirst()
      this.query.endTime = this.$lib.getDateMonthLast()
    },
    load () {
      let params = { ...this.query }
      params.startTime = params.startTime ? this.$lib.myMoment(params.startTime).formate('YYYY-MM-DD') + ' 00:00:00' : ''
      params.endTime = params.endTime ? this.$lib.myMoment(params.endTime).formate('YYYY-MM-DD') + ' 23:59:59' : ''
      this.$http.request({
        method: 'get',
        url: `/api/course/list`,
        params
      }).then((res) => {
        this.data = res.data.data
        this.initTableByDate()
      })
    },
    reset () {
      this.initSearch()
    },
    initTableByDate (data) {
      let { startTime, endTime } = this.query
      startTime = this.$lib.myMoment(startTime).formate('YYYY-MM-DD')
      endTime = this.$lib.myMoment(endTime).formate('YYYY-MM-DD')
      let dates = this.$lib.getAllDates(startTime, endTime)
      this.classes = {}
      let subjects = {}
      for (const key in this.subjectType) {
        subjects[key] = 0
      }
      if (dates.length === 0) return
      for (const d of dates) {
        this.classes[d] = { ...subjects }
        for (const c of this.data) {
          if (d === this.$lib.myMoment(c.startTime).formate('YYYY-MM-DD')) {
            this.classes[d][c.subjectId] += ((new Date(c.endTime).getTime() - new Date(c.startTime).getTime()) / 3600000)
          }
        }
      }
      this.setDayCharts()
    },
    setDayCharts () {
      let option = dayCourse.apply(this)
      this.$nextTick(() => {
        let dom = this.$refs.day
        let myChart = echarts.init(dom)
        myChart.setOption(option)
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
