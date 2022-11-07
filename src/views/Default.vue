<template>
  <div class="default">
    <!-- <div class="tool">
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
    </div> -->
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
    <Row :gutter="16" class="data_echart">
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
        <h2>每月课程统计</h2>
        <div ref="courseLine" class="today-class echart-box">
          <Table :loading="courseLoading" style="height: 100%;" :columns="mouthDateColumn" :data="allMouthDatas"></Table>
        </div>
      </div>
      </Col>
      <Col span="24" style="margin-top:16px">
      <div class="card">
        <h2>订单数量</h2>
        <div style="height:400px" ref="orderBar" class="today-class echart-box">
          <Table :loading="orderLoading"  style="height: 100%;" :columns="orderColumn" :data="allOrder"></Table>
        </div>
      </div>
      </Col>
    </Row>
  </div>
</template>

<script>
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
      allMouthDatas: [],
      todayClass: [],
      query: {
        startTime: '',
        endTime: '',
        mouth: ''
      },
      classes: {},
      mouthDateColumn: [
        { type: 'index', width: 100, align: 'center', title: '序号' },
        { title: '月份', key: 'date', align: 'center' },
        { title: '订单数', key: 'order', align: 'center' },
        { title: '课时数', key: 'count', align: 'center' },
        { title: '金额',
          key: 'amount',
          align: 'center',
          render: (h, params) => {
            return h('p', `${params.row.amount || 0}元`)
          } }
      ],
      orderColumn: [
        { type: 'index', width: 100, align: 'center', title: '序号' },
        {
          title: '学生姓名',
          key: 'studentName',
          align: 'center',
          render: (h, params) => {
            return h('p', this.studentType[params.row.studentId])
          }
        },
        {
          title: '订单数',
          key: 'order',
          align: 'center'
        },
        {
          title: '订单课时数',
          key: 'classCount',
          align: 'center'
        },
        {
          title: '订单金额',
          key: 'orderAmount',
          align: 'center',
          render: (h, params) => {
            return h('p', `${params.row.orderAmount || 0}元`)
          }
        },
        {
          title: '单价(元/小时)',
          key: 'perHourPay',
          align: 'center',
          render: (h, params) => {
            return h('p', `${parseInt(params.row.orderAmount / params.row.classCount)}`)
          }
        }
      ],
      allOrder: [],
      courseLoading: false,
      orderLoading: false
    }
  },
  created () {
    this.courseLoading = true
    this.orderLoading = true
    this.initSearch()
    this.initCatch()
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
      this.studentList = await this.getStudent()
      await this.getSubjects()
      this.total = await this.simpleGet('/api/statistics/total')
      this.total = await this.simpleGet('/api/statistics/total')
      this.todayClass = await this.simpleGet('/api/course/list', {
        startTime: this.$lib.myMoment().formate('YYYY-MM-DD') + ' 00:00:00',
        endTime: this.$lib.myMoment().formate('YYYY-MM-DD') + ' 23:59:59'
      })
      this.getOrders()
    },
    async getOrders () {
      let data = await this.simpleGet('/api/order/list')
      let dateMaps = {}
      this.allMouthDatas = []
      for (const item of data) {
        let date = this.$lib.myMoment(item.orderDate).formate('YYYY/MM')
        if (!Object.hasOwnProperty.call(dateMaps, date)) {
          dateMaps[date] = { 'order': 0, 'amount': 0, 'count': 0 }
        }
        dateMaps[date]['order'] += 1
        dateMaps[date]['count'] += Number(item.classCount * item.classMinute / 60)
        dateMaps[date]['amount'] = dateMaps[date]['amount'] + Number(item.orderAmount)
      }
      let keys = Object.keys(dateMaps).sort((x, y) => { return x - y })
      for (const date of keys) {
        this.allMouthDatas.push({
          date,
          ...dateMaps[date]
        })
      }
      this.initTableByDate(data)
      this.courseLoading = false
    },
    initTableByDate (data) {
      this.allOrder = []
      let dateMaps = {}
      for (const item of data) {
        if (!Object.hasOwnProperty.call(dateMaps, item.studentId)) {
          dateMaps[item.studentId] = { 'order': 0, 'classCount': 0, 'orderAmount': 0 }
        }
        dateMaps[item.studentId]['order'] += 1
        dateMaps[item.studentId]['classCount'] += Number(item.classCount)
        dateMaps[item.studentId]['orderAmount'] += Number(item.orderAmount)
      }
      for (const key in dateMaps) {
        this.allOrder.push({
          studentId: key,
          ...dateMaps[key]
        })
      }
      this.orderLoading = false
    },
    simpleGet (url, params) {
      return this.$http.request({
        method: 'get',
        url,
        params
      }).then((res) => {
        return res.data.data
      })
    }
  }
}
</script>

<style lang="less">
.echart-box{
  .ivu-table:before,
  .ivu-table::after{
    display: none;
  }
  .ivu-table-wrapper{
    border:none;
    .ivu-table-body{
      height: ~"calc(100% - 50px)";
      overflow-y: auto;
      overflow-x:hidden ;
    }
  }
}
</style>
