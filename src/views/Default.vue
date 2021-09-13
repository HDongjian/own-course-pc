<template>
  <div class="default">
    <div class="tool">
      <Form ref="query" :model="query" inline :label-width="80">
        <FormItem label="日期" prop="startTime" :label-width="40">
          <DatePicker v-model="query.startTime" type="date" placeholder="开始时间" style="width: 160px"></DatePicker>
        </FormItem>
        <FormItem label="—" class="date-line" prop="endTime" :label-width="20">
          <DatePicker v-model="query.endTime" type="date" placeholder="结束时间" style="width: 160px"></DatePicker>
        </FormItem>
        <FormItem :label-width="20">
          <Button type="primary" @click="init()">查询</Button>
          <Button @click="reset()">重置</Button>
        </FormItem>
      </Form>
    </div>
    <Row :gutter="16" class="total">
      <Col span="4" v-for="(value,label) in total" :key="label">
      <div class="total-item">
        <div class="my-icon-box">
          <my-icon :icon-class="iconMap[label]"></my-icon>
        </div>
        <p class="label">{{label}}</p>
        <p class="value">{{value}}</p>
      </div>
      </Col>
    </Row>
    <Row :gutter="16">
      <Col span="6">
      <div class="card">
        <h2>今日课程</h2>
        <div class="today-class">
          <div class="class-item header">
            <span class="w-45">上课时间</span>
            <span class="w-30">姓名</span>
            <span class="w-25">科目</span>
          </div>
          <div class="class-body">
            <vue-seamless-scroll :data="todayClass" :class-option="classOption">
              <div class="class-item body" v-for="(item,i) in todayClass" :key="i">
                <span class="w-45">{{getSETime(item)}}</span>
                <span class="w-30">{{studentType[item.studentId]}}</span>
                <span class="w-25">{{subjectType[item.subjectId]}}</span>
              </div>
            </vue-seamless-scroll>
          </div>
        </div>
      </div>
      </Col>
      <Col span="18">
      <div class="card">
        <h2>每日课程数量</h2>
        <div ref="courseLine" class="today-class"></div>
      </div>
      </Col>
    </Row>
  </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
export default {
  data () {
    return {
      classOption: {
        limitMoveNum: 5,
        hoverStop: true,
        step: 0.5
      },
      iconMap: {
        '学生总数': '001-surprise',
        '订单总数': '002-artist',
        '订单总金额': '003-santa-claus',
        '课时总数': '004-warm',
        '课时总金额': '005-costume',
        '课时单价': '006-drink'
      },
      getCatch: false,
      total: {},
      todayClass: [],
      query: {
        startTime: '',
        endTime: '',
        mouth: ''
      },
      classes: {}
    }
  },
  created () {
    this.initSearch()
    this.init()
  },
  methods: {
    reset () {
      this.initSearch()
    },
    initSearch () {
      this.query.mouth = this.$lib.myMoment().formate('YYYY-MM')
      this.query.startTime = this.$lib.getDateMonthFirst()
      this.query.endTime = this.$lib.getDateMonthLast()
    },
    async init () {
      let params = { ...this.query }
      params.startTime = params.startTime ? this.$lib.myMoment(params.startTime).formate('YYYY-MM-DD') + ' 00:00:00' : ''
      params.endTime = params.endTime ? this.$lib.myMoment(params.endTime).formate('YYYY-MM-DD') + ' 23:59:59' : ''
      this.studentList = await this.getStudent()
      await this.getSubjects()
      this.total = await this.simpleGet('/api/statistics/total')
      this.total = await this.simpleGet('/api/statistics/total')
      this.todayClass = await this.simpleGet('/api/course/list', {
        startTime: this.$lib.myMoment().formate('YYYY-MM-DD') + ' 00:00:00',
        endTime: this.$lib.myMoment().formate('YYYY-MM-DD') + ' 23:59:59'
      })
      this.getCourse(params)
    },
    getCourse (params) {
      this.$http.request({
        method: 'get',
        url: `/api/course/list`,
        params
      }).then((res) => {
        this.initTableByDate(res.data.data)
      })
    },
    simpleGet (url, params) {
      return this.$http.request({
        method: 'get',
        url,
        params
      }).then((res) => {
        return res.data.data
      })
    },
    initTableByDate (data) {
      let { startTime, endTime } = this.query
      startTime = this.$lib.myMoment(startTime).formate('YYYY-MM-DD')
      endTime = this.$lib.myMoment(endTime).formate('YYYY-MM-DD')
      let dates = this.$lib.getAllDates(startTime, endTime)
      let classes = {}
      for (const c of data) {
        let d = this.$lib.myMoment(c.startTime).formate('YYYY-MM-DD')
        if (!Object.hasOwnProperty.call(classes, d)) {
          classes[d] = 0
        }
        classes[d] += ((new Date(c.endTime).getTime() - new Date(c.startTime).getTime()) / 3600000)
      }
      let max = 0; let xAxis = []; let series = []
      if (dates.length === 0) return
      for (const d of dates) {
        xAxis.push(this.$lib.myMoment(d).formate('DD/MM'))
        let count = classes[d] || 0
        if (max < count) { max = count }
        series.push(count)
        // this.classes[d] = { ...subjects }
      }
      let option = {
        color: ['#74c3f9', '#00ddff'],
        backgroundColor: '#fcfcfc',
        title: {
          show: false
        },
        legend: {
          show: false
        },
        grid: {
          top: '12%',
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xAxis,
          axisLine: {
            lineStyle: {
              color: '#0a385c'
            }
          },
          splitLine: {
            show: false,
            lineStyle: {
              color: '#E3F1FF',
              type: 'dashed'
            }
          },
          axisLabel: {
            show: true,
            textStyle: {
              color: '#666666'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '课时',
          max: max + 2,
          minInterval: 1,
          axisLine: {
            show: true,
            lineStyle: {
              color: '#0a385c'
            }
          },
          nameTextStyle: {
            color: '#666666'
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#efefef',
              type: 'dashed'
            }
          },
          axisLabel: {
            show: true,
            textStyle: {
              color: '#666666'
            }
          }
        },
        series: {
          data: series,
          type: 'line',
          smooth: true,
          areaStyle: {
            color: '#b4daf8'
          }
        }
      }
      var myChart = echarts.init(this.$refs.courseLine)
      myChart.setOption(option)
    }
  }
}
</script>
