<!--
 * @Author: HaoDongjian
 * @Date: 2022-10-19 11:49:21
 * @LastEditors: HaoDongjian
 * @LastEditTime: 2022-10-28 15:29:27
 * @Description:
-->
<template>
  <div class="calendar-container only_course">
    <div class="calendar_box form-content">
      <div class="calendar_box" style="position: relative;">
        <div ref="calendar" class="calendar cl">
          <div class="week-title">
            <div :class="['weeks',{'weekend':i===0||i===6}]" v-for="(week,i) in weeks" :key="i">星期{{week}}</div>
          </div>
          <div ref="classes" class="classes-content cl">
            <div :style="`height:${lineCount}`" :class="['class',{'weekend':i===1||i===7}]" v-for="i in suppleCount.start" :key="i+'start'"></div>
            <div :style="`height:${lineCount}`" :class="['class','has-date',{'weekend':GW(d.date)===0||GW(d.date)===6,'is-festival':$lib.getLunarDay(d.date).isFestival,'today': GT()===d.date}]" v-for="d in dealClasses" :key="d.date">
              <h4>
                <span class="full_title">{{d.date}}</span>
                <span class="part_title">{{$lib.myMoment(d.date).formate('MM-DD')}}</span>
                <!-- <span class="title_yin">({{$lib.getLunarDay(d.date).result}})</span> -->
              </h4>
              <div class="content">
                <div :style="`height:${100/(d.classes.length||1)}%`" :row='JSON.stringify(c)' class="item" id="course" v-for="c in d.classes||[]" :key="c.id">
                  <div v-if="c.studentId" class="item_date_data">
                    <span class="w-1">{{getSETime(c)}}</span>
                    <span class="w-4">{{getSTime(c)}}</span>
                    <span class="w-2">{{studentType[c.studentId]}}</span>
                    <span class="w-3">{{subjectType[c.subjectId]}}</span>
                  </div>
                  <div class="idle-item" v-else>{{getSETime(c)}}</div>
                </div>
              </div>
            </div>
            <div :style="`height:${lineCount}`" :class="['class',{'weekend':i===suppleCount.end}]" v-for="i in suppleCount.end" :key="i+'end'"></div>
            <div v-if="printTime" class="time-watermark">
              <p>{{printTime}}</p>
              <p>￥{{printShow.money}}</p>
              <p>小时数:{{printShow.count}}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="action_icon">
        <Icon @click.native="changeMouth('forward')" type="ios-arrow-forward" />
        <Icon @click.native="changeMouth('back')" type="ios-arrow-back" />
      </div>
      <Spin size="large" fix v-if="loading"></Spin>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      getCatch: true,
      loading: false,
      dayHeight: 120,
      query: {
        studentId: '',
        companyId: '',
        startTime: '',
        endTime: '',
        mouth: '',
        idle: false
      },
      data: [],
      weeks: ['日', '一', '二', '三', '四', '五', '六'],
      suppleCount: {
        start: 0,
        end: 0
      },
      printTime: '',
      classes: [],
      idleData: [],
      dealClasses: []
    }
  },
  computed: {
    lineCount () {
      let { start, end } = this.suppleCount
      let total = (this.dealClasses.length + Number(start || 0) + Number(end || 0)) / 7
      total = Math.ceil(total)
      return `calc(${100 / total}%)`
    }
  },
  created () {
    this.initCatch()
    this.initSearch()
    this.load()
  },
  methods: {
    changeMouth (number) {
      let date = ''
      let current = this.$lib.myMoment(this.query.startTime).formate('YYYY-MM-DD')
      if (number === 'forward') {
        date = this.$lib.getNextMonth(current)
      } else {
        date = this.$lib.getPreMonth(current)
      }
      this.query.startTime = this.$lib.getDateMonthFirst(date + ' 00:00:00') + ' 00:00:00'
      this.query.endTime = this.$lib.getDateMonthLast(date + ' 00:00:00') + ' 00:00:00'
      this.load()
    },
    load () {
      this.loading = true
      let params = { ...this.query }
      params.startTime = params.startTime ? this.SD(params.startTime) + ' 00:00:00' : ''
      params.endTime = params.endTime ? this.SD(params.endTime) + ' 23:59:59' : ''
      this.initTableByDate()
      this.$http.request({
        method: 'get',
        url: `/api/course/list`,
        params
      }).then((res) => {
        this.data = res.data.data
        this.dealAllClasses()
        setTimeout(() => {
          this.loading = false
        }, 1000)
      })
    },
    initSearch () {
      this.query.mouth = this.$lib.myMoment().formate('YYYY-MM')
      this.query.startTime = this.$lib.getDateMonthFirst() + ' 00:00:00'
      this.query.endTime = this.$lib.getDateMonthLast() + ' 23:59:59'
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
      this.dealIdleClasses()
    },
    dealIdleClasses () {
      if (!this.query.idle) return
      this.$refs.idleForm.validate((valid) => {
        if (!valid) return
        let { time, week } = this.allow
        let { endDate } = this.idleForm
        if (time.length === 0) return
        for (const d of this.dealClasses) {
          if (this.GS(d.date + ' 23:59') < Date.now() || week.indexOf(this.GW(d.date)) < 0) continue
          if (endDate && this.GS(d.date + ' 00:00') > this.GS(endDate)) continue
          let dTimes = time.map(item => {
            return {
              startTime: this.GS(d.date + ' ' + item.startTime),
              endTime: this.GS(d.date + ' ' + item.endTime),
              classes: []
            }
          })
          let surplus = []
          for (const c of d.classes) {
            c.startTime = this.GS(c.startTime)
            c.endTime = this.GS(c.endTime)
            let ha = false
            for (const t of dTimes) {
              if (c.startTime >= t.startTime && c.endTime <= t.endTime) {
                t.classes.push(c)
                ha = true
              }
              t.classes = t.classes.sort((x, y) => { return x.startTime - y.startTime })
            }
            if (!ha) { surplus.push(c) }
          }
          d.classes = this.reloadClasses(dTimes, surplus)
        }
        for (const d of this.dealClasses) {
          d.classes = d.classes.filter(item => {
            return !item.studentId
          })
        }
      })
    },
    reloadClasses (dTimes, surplus) {
      for (const { startTime, endTime, classes } of dTimes) {
        surplus = surplus.concat(classes)
        let len = classes.length
        if (len === 0) {
          surplus.push({ startTime, endTime })
        } else {
          for (let i = 0; i <= len; i++) {
            let start = ''
            let end = ''
            if (i === 0) {
              start = startTime
              end = this.GS(classes[i].startTime)
            } else if (i === len) {
              start = this.GS(classes[i - 1].endTime)
              end = endTime
            } else {
              start = this.GS(classes[i - 1].endTime)
              end = this.GS(classes[i].startTime)
            }
            surplus.push({ startTime: start, endTime: end })
          }
        }
      }
      surplus = surplus.sort((x, y) => { return x.startTime - y.startTime })
      let dealSurplus = []
      for (let i = 0; i < surplus.length; i++) {
        if (!surplus[i].studentId) {
          if (surplus[i - 1] && surplus[i].startTime < surplus[i - 1].endTime) {
            surplus[i].startTime = surplus[i - 1].endTime
          }
          if (surplus[i + 1] && surplus[i].endTime > surplus[i + 1].startTime) {
            surplus[i].endTime = surplus[i + 1].startTime
          }
          if (this.judgeIdle(surplus[i].startTime, surplus[i].endTime)) {
            dealSurplus.push(surplus[i])
          }
        } else {
          dealSurplus.push(surplus[i])
        }
      }
      return dealSurplus
    },
    judgeIdle (start, end) {
      if (!start || !end) return false
      let { duration, startTime } = this.idleForm
      let date = this.SD(start)
      let a = duration ? end - start >= duration * 60000 : true
      if (!a) return false
      let b = false
      if (!startTime) {
        b = true
      } else {
        startTime = this.GS(date + ' ' + startTime)
        b = false
      }
      if (startTime && (startTime >= start && startTime < end)) {
        b = duration ? end - startTime >= duration * 60000 : true
      }
      if (!b) return false
      return true
    },
    initTableByDate () {
      let { startTime, endTime } = this.query
      startTime = this.SD(startTime)
      endTime = this.SD(endTime)
      let dates = this.$lib.getAllDates(startTime, endTime)
      if (dates.length === 0) return
      this.suppleCount.start = new Date(startTime).getDay()
      this.suppleCount.end = 6 - (new Date(endTime).getDay())
      this.classes = dates.map(item => {
        item = { date: item }
        return item
      })
    }
  }
}
</script>

<style lang="less">
.only_course{
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  .action_icon{
    .ivu-icon{
      position: absolute;
      font-size: 100px;
      transform: translateY(-50%);
      top: 50%;
      opacity: 0.5;
      &.ivu-icon-ios-arrow-back{
        left: 20px;
      }
      &.ivu-icon-ios-arrow-forward{
        right: 20px;
      }
    }
  }
  .calendar_box {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-around;
    .calendar_box{
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-around;
      width: 96%;
      height: 96%;
    }
    .calendar{
      height: 100%;
    }
    .classes-content{
      height: ~"calc(100% - 40px)";
      .content{
        height: ~"calc(100% - 30px)";
        .item_date_data{
          height: 100%;
          display: flex;
          span{
            flex: 1;
            align-items: center;
            display: flex;
            justify-content: center;
          }
          .w-1{
            flex: 2;
          }
        }
      }
    }
  }
}
.only_course.calendar-container .calendar .classes-content .has-date .content .item .item_date_data .w-4{
  display: none;
}
@media screen and (max-width: 1200px) {
  .only_course.calendar-container
    .calendar
    .classes-content
    .has-date{
      h4{
        .title_yin{
          display: none;
        }
      }
      .content
      .item
      .item_date_data{
        letter-spacing: -2px;
      }
    }
}
@media screen and (max-width: 1100px) {
  .only_course.calendar-container
    .calendar
    .classes-content
    .has-date{
      h4{
        .title_yin{
          display: none;
        }
      }
      .content
      .item
      .item_date_data{

        .w-3 {
          display: none;
        }

      }
    }
}

@media screen and (max-width: 900px) {
  .only_course.calendar-container
    .calendar
    .classes-content
    .has-date{
      h4{
        .title_yin{
          display: none;
        }
      }
      .content
      .item
      .item_date_data{
        .w-1 {
          display: none;
        }
        .w-4 {
          display: flex;
        }
      }
    }
}

@media screen and (max-width: 650px) {
  .only_course.calendar-container .calendar .classes-content .has-date h4{
    font-size: 13px;
  }
  .only_course.calendar-container .calendar .classes-content .has-date .content .item .item_date_data span{
    font-size: 12px;
  }
}
@media screen and (max-width: 560px) {
  .only_course.calendar-container .calendar .classes-content .has-date h4{
    .full_title {
      display: none;
    }
    .part_title {
      display: inline;
    }
  }
}
@media screen and (max-width: 530px) {
  .only_course.calendar-container .calendar .classes-content .has-date .content .item .item_date_data .w-4 {
    display: none;
  }
}

</style>
