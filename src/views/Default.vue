<template>
  <div class="default">
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
    </Row>
  </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      classOption: {
        limitMoveNum: 3,
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
      todayClass: []
    }
  },
  created () {
    this.init()
  },
  methods: {
    async init () {
      this.studentList = await this.getStudent()
      await this.getSubjects()
      this.total = await this.simpleGet('/api/statistics/total')
      this.total = await this.simpleGet('/api/statistics/total')
      this.todayClass = await this.simpleGet('/api/course/list', {
        startTime: this.$lib.myMoment().formate('YYYY-MM-DD') + ' 00:00:00',
        endTime: this.$lib.myMoment().formate('YYYY-MM-DD') + ' 23:59:59'
      })
      console.log(this.todayClass)
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
