<template>
  <div class="default-container calendar-container">
    <div class="tool">
      <Form style="display:inline" ref="query" :model="query" inline :label-width="80">
        <FormItem label="空余时间" prop="idle" :label-width="120">
          <i-switch v-model="query.idle"></i-switch>
        </FormItem>
        <FormItem v-show="!query.idle" prop="studentId" label='学生姓名' :label-width="120">
          <Select filterable clearable style="width: 160px" v-model="query.studentId" placeholder="学生姓名">
            <Option v-for="(item,value) in studentList" :key="value" :value="item.studentId">{{item.studentName}}</Option>
          </Select>
        </FormItem>
        <FormItem v-show="!query.idle" prop="companyId" label='机构' :label-width="80">
          <Select clearable style="width: 160px" v-model="query.companyId" placeholder="机构">
            <Option v-for="(label,value) in companyType" :key="value" :value="value">{{label}}</Option>
          </Select>
        </FormItem>
        <FormItem label="月份" prop="mouth" :label-width="80">
          <DatePicker @on-change="mouthChange" :editable="false" type="month" placeholder="选择月份" v-model="query.mouth" style="width: 160px"></DatePicker>
        </FormItem>
        <!-- <FormItem label="日期" prop="startTime" :label-width="40">
          <DatePicker  v-model="query.startTime" type="date" placeholder="开始时间" style="width: 160px"></DatePicker>
        </FormItem>
        <FormItem label="—" class="date-line" prop="endTime" :label-width="20">
          <DatePicker v-model="query.endTime" type="date" placeholder="结束时间" style="width: 160px"></DatePicker>
        </FormItem> -->
      </Form>
      <Form style="display:inline" ref="idleForm" :model="idleForm" inline :rules="idleFormRules" :label-width="80">
        <FormItem v-show="query.idle" label="开始时间" prop="startTime">
          <!-- eslint-disable-next-line vue/no-parsing-error -->
          <Input style="width: 160px" :maxlength="5" v-model="idleForm.startTime"></Input>
        </FormItem>
        <FormItem v-show="query.idle" label="截止日期" prop="endDate">
          <DatePicker :editable="false" v-model="idleForm.endDate" type="date" placeholder="截止日期" style="width: 160px"></DatePicker>
        </FormItem>
        <FormItem v-show="query.idle" label="限制时长" prop="duration">
          <!-- eslint-disable-next-line vue/no-parsing-error -->
          <Input style="width: 160px" :maxlength="10" v-model="idleForm.duration"><span slot="append">分钟</span></Input>
        </FormItem>
        <FormItem :label-width="20">
          <Button type="primary" @click="load()">查询</Button>
          <Button @click="reset()">重置</Button>
          <Button type="primary" @click="add()">批量添加</Button>
        </FormItem>
      </Form>
    </div>
    <div class="calendar_box form-content">
      <!-- <div class="position-title week-title">
        <div :class="['weeks',{'weekend':i===0||i===6}]" v-for="(week,i) in weeks" :key="i">星期{{week}}</div>
      </div> -->
      <div ref="calendar">
        <div @contextmenu.prevent='classContextMenu' class="calendar cl">
          <div class="week-title">
            <div :class="['weeks',{'weekend':i===0||i===6}]" v-for="(week,i) in weeks" :key="i">星期{{week}}</div>
          </div>
          <div ref="classes" class="classes-content cl">
            <div :style="`height:${lineCount}`" :class="['class',{'weekend':i===1||i===7}]" v-for="i in suppleCount.start" :key="i+'start'"></div>
            <div :style="`height:${lineCount}`" :class="['class','has-date',{'weekend':GW(d.date)===0||GW(d.date)===6,'is-festival':$lib.getLunarDay(d.date).isFestival,'today': GT()===d.date}]" v-for="d in dealClasses" :key="d.date">
              <h4>{{d.date}}({{$lib.getLunarDay(d.date).result}})</h4>
              <div class="content">
                <div :style="`height:${100/(d.classes.length||1)}%;`" :row='JSON.stringify(c)' class="item" id="course" v-for="c in d.classes||[]" :key="c.id">
                  <div v-if="c.studentId" class="item_date_data">
                    {{getSETime(c)}} &nbsp; {{studentType[c.studentId]}} &nbsp; {{subjectType[c.subjectId]}}
                    <!-- <span class="w-1">{{getSETime(c)}} - 的各个过过</span> -->
                    <!-- <span class="w-2">{{studentType[c.studentId]}}</span> -->
                    <!-- <span class="w-3">{{subjectType[c.subjectId]}}</span> -->
                  </div>
                  <div class="idle-item" v-else>{{getSETime(c)}}</div>
                  <my-icon v-if="c.isAudition==='1'" icon-class="is-audition"></my-icon>
                </div>
              </div>
            </div>
            <div :style="`height:${lineCount}`" :class="['class',{'weekend':i===suppleCount.end}]" v-for="i in suppleCount.end" :key="i+'end'"></div>
            <div class="time-watermark">
              <p>{{printTime}}</p>
              <p v-if="showWatermark">￥{{printShow.money}}</p>
              <p v-if="showWatermark">小时数:{{printShow.count}}</p>
            </div>
          </div>
        </div>
      </div>
      <Spin size="large" fix v-if="loading"></Spin>
    </div>

    <add-course :modalData="modal" :editData="editData" :title="modalTitle" @close="addClose"></add-course>
    <div class="right-menu" @contextmenu.prevent='rightMenuContext' :style="rightMenuStyle">
      <div v-if="rowData.courseId">
        <div @click="edit(rowData)" class="items">编辑</div>
        <div @click="delect(rowData)" class="items">删除</div>
        <div class="separate" data-group="0"></div>
      </div>
      <div v-if="query.idle" class="items" @click="checkIdle()">查看空段</div>
      <div class="items" @click="downImage(true)">下载图片</div>
      <div class="items" @click="downImage(false)">无水印下载</div>
    </div>
    <Modal width="400px" v-model="idleModal" title="当月空段" @on-cancel="idleModalCancel">
      <Input ref="idleContent" v-model="idleContent" type="textarea" :rows="16" placeholder="空段编辑" />
      <div slot="footer">
        <Button type="primary" @click="idleExport()">复制</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { validateWage, validateTime } from '../../utils/validate'
import * as domtoimage from 'dom-to-image'
export default {

  data () {
    const validateDay = (rule, value, callback) => {
      if (!value) {
        callback()
      }
      if (!validateTime(value)) {
        callback(new Error('时间格式不正确'))
      }
      callback()
    }
    return {
      loading: false,
      getCatch: true,
      dayHeight: 120,
      modal: false,
      editData: {},
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
      classes: [],
      rightMenu: {
        x: 0,
        y: 0
      },
      rowData: {},
      showWatermark: false,
      printTime: '',
      dayTimeLimit: {
        startTime: '00:00',
        endTime: '23:59'
      },
      allow: {
        time: [],
        week: ''
      },
      idleModal: false,
      idleContent: '',
      idleForm: {
        startTime: '',
        endDate: '',
        duration: 90
      },
      idleFormRules: {
        startTime: [
          { required: false, validator: validateDay, trigger: 'blur' }
        ],
        duration: [
          { required: true, validator: validateWage, trigger: 'blur' }
        ]
      },
      idleData: [],
      dealClasses: [],
      modalTitle: ''
    }
  },
  computed: {
    lineCount () {
      let { start, end } = this.suppleCount
      let total = (this.dealClasses.length + Number(start || 0) + Number(end || 0)) / 7
      total = Math.ceil(total)
      return `${100 / total}%`
    },
    printShow () {
      let printShow = {
        money: 0,
        count: 0
      }
      for (const c of this.data) {
        printShow.money += c.unitPrice
        printShow.count += ((new Date(c.endTime).getTime() - new Date(c.startTime).getTime()) / 3600000)
      }
      return printShow
    },
    rightMenuStyle () {
      return {
        left: this.rightMenu.x + 'px',
        top: this.rightMenu.y + 'px',
        display: this.rightMenu.x || this.rightMenu.y ? 'block' : 'none'
      }
    }
  },
  created () {
    this.loading = true
    this.initCatch()
    this.initData()
    setTimeout(() => {
      this.loading = false
    }, 1500)
  },
  methods: {
    async initData () {
      this.initSearch()
      await this.loadTimeMan()
      this.load()
      this.$bus.$on('document', type => {
        if (this.rightMenu.x || this.rightMenu.y) {
          this.rightMenu.x = 0
          this.rightMenu.y = 0
        }
      })
    },
    loadTimeMan () {
      return this.$http.request({
        method: 'get',
        url: `/api/time/list`
      }).then((res) => {
        let data = res.data.data
        for (const item of data) {
          if (Number(item.timeRange) === 1) {
            this.allow.time.push({
              startTime: item.dayStart,
              endTime: item.dayEnd
            })
          } else if (Number(item.timeRange) === 2) {
            this.allow.week += item.weekDay
          }
        }
      })
    },
    classContextMenu (e) {
      e.stopPropagation()
      console.log(e)
      console.log(e.path)
      if (e.path) {
        this.rowData = {}
        for (const el of e.path) {
          if (el.id === 'course') {
            this.rowData = JSON.parse(el.getAttribute('row'))
          }
        }
      } else {
        this.rowData = JSON.parse(e.target.getAttribute('row'))
      }
      if (!this.rowData) return

      this.rightMenu.x = e.clientX
      this.rightMenu.y = e.clientY
    },
    checkIdle () {
      let str = ''
      for (const d of this.dealClasses) {
        if (!this.hasIdle(d.classes)) continue
        str += d.date + this.$lib.myMoment(d.date).formate('dddd') + '\n'
        for (const c of d.classes) {
          if (!c.studentId) {
            str += this.getSETime(c) + '\n'
          }
        }
        str += '\n'
      }
      this.idleContent = str
      this.idleModal = true
    },
    hasIdle (classes) {
      for (const c of classes) {
        if (!c.studentId) {
          return true
        }
      }
      return false
    },
    idleModalCancel () {
      this.idleContent = ''
      this.idleModal = false
    },
    idleExport () {
      var idle = this.$refs.idleContent.$el.getElementsByTagName('textarea')[0]
      idle.select() // 选择对象
      document.execCommand('Copy') // 执行浏览器复制命令
      this.$Message.success('复制成功')
      this.idleModalCancel()
    },
    rightMenuContext (event) {
      event.stopPropagation()
    },
    mouthChange (mouth) {
      let date = mouth + '-01 00:00:00'
      this.query.startTime = this.$lib.getDateMonthFirst(date)
      this.query.endTime = this.$lib.getDateMonthLast(date)
    },
    load () {
      let params = { ...this.query, pageSize: this.$store.state.pageSize }
      this.initTableByDate()
      params.startTime = params.startTime ? this.SD(params.startTime) + ' 00:00:00' : ''
      params.endTime = params.endTime ? this.SD(params.endTime) + ' 23:59:59' : ''
      this.$http.request({
        method: 'get',
        url: `/api/course/list`,
        params
      }).then((res) => {
        this.data = res.data.data
        this.dealAllClasses()
      })
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
      this.suppleCount.end = 6 - (new Date(endTime).getDay())

      this.classes = dates.map(item => {
        item = { date: item }
        return item
      })
    },
    add () {
      this.modal = true
      this.modifyId = ''
      this.modalTitle = '添加课程'
      this.editData = {}
    },
    addClose () {
      this.modal = false
      this.load()
    },
    edit (row) {
      this.modal = true
      this.editData = row
    },
    downImage (watermark) {
      let { startTime, endTime } = this.query
      startTime = this.SD(startTime)
      endTime = this.SD(endTime)
      let time = this.$lib.myMoment().formate('YYYY年MM月DD日 HH:mm')
      this.printTime = time
      this.loading = true
      let node = this.$refs.calendar
      let options = {
        height: node.clientHeight, width: node.clientWidth, cacheBust: true
      }
      console.log(options)
      setTimeout(() => {
        domtoimage.toPng(node, options).then((blob) => {
          this.loading = false
          // this.$lib.downBlobFile(`${startTime}-${endTime}课表统计-${time}.png`, blob)
          this.$lib.downloadFile(`${startTime}-${endTime}课表统计-${time}.png`, blob)
          this.printTime = ''
        })
      }, 500)
    },
    delect (data) {
      this.$http.request({
        method: 'post',
        url: `/api/course/delect/${data.courseId}`,
        data: this.form
      }).then((res) => {
        if (res.data.code === 200) {
          this.load()
          this.$Message.success('删除成功')
        }
      })
    }
  }
}
</script>
<style lang="less">
.calendar-container {
  .ivu-spin-fix {
    z-index: 60;
  }
}
</style>
