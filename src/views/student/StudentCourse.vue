<template>
  <div class="my-course calendar-container">
    <div class="tool">
      <Form style="display:inline" ref="query" :model="query" inline :label-width="80">
        <FormItem label="月份" prop="mouth" :label-width="40">
          <DatePicker @on-change="mouthChange" :editable="false" type="month" placeholder="选择月份" v-model="query.mouth" style="width: 160px"></DatePicker>
        </FormItem>
        <FormItem :label-width="20">
          <Button type="primary" @click="load()">查询</Button>
          <Button @click="reset()">重置</Button>
        </FormItem>
      </Form>
    </div>
    <div ref="calendar" class="calendar cl">
      <div class="week-title">
        <div :class="['weeks',{'weekend':i===0||i===6}]" v-for="(week,i) in weeks" :key="i">星期{{week}}</div>
      </div>
      <div ref="classes" class="classes-content cl">
        <div :style="`height:${dayHeight+30}px`" :class="['class',{'weekend':i===1||i===7}]" v-for="i in suppleCount.start" :key="i+'start'"></div>
        <!-- 星期 -->
        <div :class="['class','has-date',{'weekend':GW(d.date)===0||GW(d.date)===6,'today': GT()===d.date}]" v-for="d in dealClasses" :key="d.date">
          <!-- 展示日期 -->
          <h4>{{d.date}}</h4>
          <!-- 课程列表 -->
          <div :style="`height:${dayHeight}px`" class="content">
            <div :style="`height:${dayHeight/(d.classes.length||1)}px;line-height:${dayHeight/(d.classes.length||1)}px`" :row='JSON.stringify(c)' class="item" id="course" v-for="c in d.classes||[]" :key="c.id">
              <div v-if="c.studentId">
                <span class="w-45">{{getSETime(c)}}</span>
                <span class="w-55">
                  <span class="w-60">{{teacherType[c.userId]}}</span>
                  <span class="w-40">{{subjectType[c.subjectId]}}</span>
                </span>
              </div>
              <div class="idle-item" v-else>{{getSETime(c)}}</div>
            </div>
          </div>
        </div>
        <div :style="`height:${dayHeight+30}px`" :class="['class',{'weekend':i===6-suppleCount.end}]" v-for="i in 6-suppleCount.end" :key="i+'end'"></div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  data () {
    return {
      dayHeight: 180,
      dealClasses: [],
      data: [],
      classes: [],
      weeks: ['日', '一', '二', '三', '四', '五', '六'],
      suppleCount: {
        start: 0,
        end: 0
      },
      query: {
        mouth: '',
        startTime: '',
        endTime: ''
      }
    }
  },
  created () {
    this.initData()
  },
  methods: {
    async initData () {
      if (!this.isStudent) return
      await this.getSubjects()
      this.teacherList = await this.getTeacher()
      this.initSearch()
      this.load()
    },
    load () {
      let params = { ...this.query }
      this.initTableByDate()
      params.startTime = params.startTime ? this.SD(params.startTime) + ' 00:00:00' : ''
      params.endTime = params.endTime ? this.SD(params.endTime) + ' 23:59:59' : ''
      this.$http.request({
        method: 'get',
        url: `/course/student`,
        params
      }).then((res) => {
        this.data = res.data.data
        this.dealAllClasses()
      })
    },
    mouthChange (mouth) {
      let date = mouth + '-01 00:00:00'
      this.query.startTime = this.$lib.getDateMonthFirst(date)
      this.query.endTime = this.$lib.getDateMonthLast(date)
    },
    dealAllClasses () {
      this.dealClasses = [...this.classes]
      for (const d of this.dealClasses) {
        d.classes = []
        for (const c of this.data) {
          if (d.date === this.SD(c.startTime)) {
            d.classes.push(c)
          }
        }
        d.classes = d.classes.sort((x, y) => {
          return new Date(x.startTime).getTime() - new Date(y.startTime).getTime()
        })
      }
    },
    reset () {
      this.$refs.query.resetFields()
      this.initSearch()
      this.load()
    },
    initSearch () {
      this.query.mouth = this.$lib.myMoment().formate('YYYY-MM')
      this.query.startTime = this.$lib.getDateMonthFirst() + ' 00:00:00'
      this.query.endTime = this.$lib.getDateMonthLast() + ' 23:59:59'
    },
    initTableByDate () {
      let { startTime, endTime } = this.query
      startTime = this.SD(startTime)
      endTime = this.SD(endTime)
      let dates = this.$lib.getAllDates(startTime, endTime)
      if (dates.length === 0) return
      this.suppleCount.start = new Date(dates[0]).getDay()
      this.suppleCount.end = new Date(dates[dates.length - 1]).getDay()
      this.classes = dates.map(item => {
        item = { date: item }
        return item
      })
    }
  }
}
</script>

<style>
</style>
