<template>
  <div class="time-managemant">
    <div class="tool">
      <Button type="primary" @click="add()">配置时间</Button>
    </div>
    <Table stripe :columns="columns" :data="data"></Table>
    <Modal v-model="modal" :title="modalTitle" @on-cancel="modalCancel">
      <div class="modal-content">
        <Form ref="form" :model="form" :rules="formRules" :label-width="120">
          <FormItem label="时间主题" prop="timeTitle">
            <!--eslint-disable-next-line vue/no-parsing-error -->
            <Input :maxlength="20" v-model="form.timeTitle"></Input>
          </FormItem>
          <FormItem label="时间范围" prop="timeRange">
            <Select @on-change="rangeChange" style="width: 100%" v-model="form.timeRange" placeholder="时间范围">
              <Option v-for="(label,value) in dealRangeMap" :key="value" :value="value">{{label}}</Option>
            </Select>
          </FormItem>
          <!-- <FormItem label="限制类型" prop="timeType">
            <Select style="width: 100%" v-model="form.timeType" placeholder="限制类型">
              <Option v-for="(label,value) in typeMap" :key="value" :value="value">{{label}}</Option>
            </Select>
          </FormItem> -->
          <FormItem v-if="Number(form.timeRange) === 1" label="每天开始时间" prop="dayStart">
            <!--eslint-disable-next-line vue/no-parsing-error -->
            <Input :maxlength="5" v-model="form.dayStart"></Input>
            <!-- <TimePicker format="HH:mm" v-model="form.dayStart" placeholder="每天开始时间" style="width: 100%"></TimePicker> -->
          </FormItem>
          <FormItem v-if="Number(form.timeRange) === 1" label="每天结束时间" prop="dayEnd">
            <!--eslint-disable-next-line vue/no-parsing-error -->
            <Input :maxlength="5" v-model="form.dayEnd"></Input>
            <!-- <TimePicker format="HH:mm" v-model="form.dayEnd" placeholder="每天结束时间" style="width: 100%"></TimePicker> -->
          </FormItem>
          <FormItem v-if="Number(form.timeRange) === 2" label="每周周几" prop="">
            <Select multiple style="width: 100%" v-model="form.weekDay" placeholder="每周周几">
              <Option v-for="(i, key) in weekArr" :key="i" :value="String(key)">{{i}}</Option>
            </Select>
          </FormItem>
          <FormItem v-if="Number(form.timeRange) === 3" label="每月几号" prop="mouthDay">
            <Select style="width: 100%" v-model="form.mouthDay" placeholder="每月几号">
              <Option v-for="(i,key) in mouthArr" :key="key" :value="key">{{i}}</Option>
            </Select>
          </FormItem>
          <FormItem v-if="Number(form.timeRange) === 4" label="当天开始时间" prop="specialStart">
            <!--eslint-disable-next-line vue/no-parsing-error -->
            <Input :maxlength="5" v-model="form.specialStart"></Input>
            <!-- <TimePicker format="HH:mm" v-model="form.specialStart" placeholder="当天开始时间" style="width: 100%"></TimePicker> -->
          </FormItem>
          <FormItem v-if="Number(form.timeRange) === 4" label="当天结束时间" prop="specialEnd">
            <!--eslint-disable-next-line vue/no-parsing-error -->
            <Input :maxlength="5" v-model="form.specialEnd"></Input>
            <!-- <TimePicker format="HH:mm" v-model="form.specialEnd" placeholder="当天结束时间" style="width: 100%"></TimePicker> -->
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button @click="modalCancel()">取消</Button>
        <Button type="primary" @click="modalOk()">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { validateTime } from '../../utils/validate'
export default {
  data () {
    const validateDay = (rule, value, callback) => {
      if (!validateTime(value)) {
        callback(new Error('时间格式不正确'))
      }
      let { dayStart, dayEnd } = this.form
      if (validateTime(dayStart) && validateTime(dayEnd)) {
        if (this.$lib.contrastTime(dayStart, dayEnd)) {
          callback(new Error('结束时间必须大于开始时间'))
        }
        let date = this.$lib.myMoment().formate('YYYY-MM-DD')
        let ns = new Date(date + ' ' + dayStart).getTime()
        let ne = new Date(date + ' ' + dayEnd).getTime()
        for (const item of this.data) {
          if (Number(item.timeRange) !== 1) continue
          let ds = new Date(date + ' ' + item.dayStart).getTime()
          let de = new Date(date + ' ' + item.dayEnd).getTime()
          if (!(ns >= de || ds >= ne)) {
            callback(new Error('该时间段与现有配置冲突'))
          }
        }
        callback()
      }
      callback()
    }
    const validateSP = (rule, value, callback) => {
      if (!validateTime(value)) {
        callback(new Error('时间格式不正确'))
      }
      let { specialStart, specialEnd } = this.form
      if (validateTime(specialStart) && validateTime(specialEnd) && this.$lib.contrastTime(specialStart, specialEnd)) {
        callback(new Error('结束时间必须大于开始时间'))
      }
      callback()
    }
    return {
      data: [],
      columns: [
        {
          title: '序号',
          type: 'index',
          width: 80,
          align: 'center'
        }, {
          title: '时间主题',
          key: 'timeTitle',
          align: 'center'
        },
        {
          title: '时间范围',
          align: 'center',
          render: (h, params) => {
            return h('p', this.rangeMap[params.row.timeRange])
          }
        },
        // {
        //   title: '限制类型',
        //   align: 'center',
        //   render: (h, params) => {
        //     return h('p', this.typeMap[params.row.timeType])
        //   }
        // },
        {
          title: '配置内容',
          key: 'currentScore',
          align: 'center',
          render: (h, params) => {
            return h('p', this.setRangeCnt(params.row))
          }
        },
        {
          title: '创建时间',
          key: 'createTime',
          align: 'center',
          render: (h, params) => {
            return h('p', this.$lib.myMoment(new Date(params.row.createTime)).formate())
          }
        },
        {
          title: '操作',
          key: 'action',
          width: 150,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('a', {
                style: {
                  marginRight: '16px'
                },
                on: {
                  click: () => {
                    this.edit(params.row)
                  }
                }
              }, '编辑'),
              h('a', {
                on: {
                  click: () => {
                    this.delect(params.row)
                  }
                }
              }, '删除')
            ])
          }
        }
      ],
      modal: false,
      modalTitle: '添加配置',
      modifyId: '',
      form: {
        timeTitle: '',
        timeType: '1',
        timeRange: '',
        dayStart: '',
        dayEnd: '',
        weekDay: [],
        mouthDay: '',
        specialStart: '',
        specialEnd: ''
      },
      weekArr: ['日', '一', '二', '三', '四', '五', '六'],
      mouthArr: ['1号', '2号', '3号', '4号', '5号', '6号', '7号', '8号', '9号', '10号', '11号', '12号', '13号', '14号', '15号', '16号', '17号', '18号', '19号', '20号', '21号', '22号', '23号', '24号', '25号', '26号', '27号', '28号', '29号', '30号', '31号'],
      formRules: {
        timeTitle: [
          { required: true, message: '时间主题不能为空', trigger: 'blur' }
        ],
        timeType: [
          { required: true, message: '限制类型不能为空', trigger: 'change' }
        ],
        timeRange: [
          { required: true, message: '时间范围不能为空', trigger: 'change' }
        ],
        dayStart: [
          { required: true, validator: validateDay, trigger: 'blur' }
        ],
        dayEnd: [
          { required: true, validator: validateDay, trigger: 'blur' }
        ],
        weekDay: [
          { required: true, message: '每周周几不能为空', trigger: 'change' }
        ],
        mouthDay: [
          { required: true, message: '每月几号不能为空', trigger: 'change' }
        ],
        specialStart: [
          { required: true, validator: validateSP, trigger: 'blur' }
        ],
        specialEnd: [
          { required: true, validator: validateSP, trigger: 'blur' }
        ]
      },
      typeMap: {
        1: '允许',
        2: '不允许'
      },
      rangeMap: {
        1: '每天',
        2: '每周'
        // 3: '每月',
        // 4: '当天'
      }
    }
  },
  computed: {
    dealRangeMap () {
      let deal = false
      let map = { ...this.rangeMap }
      for (const item of this.data) {
        if (Number(item.timeRange) === 2) {
          deal = true
        }
      }
      if (!this.modifyId && deal) {
        delete map[2]
      }
      return map
    }
  },
  created () {
    this.load()
  },
  methods: {
    load () {
      this.$http.request({
        method: 'get',
        url: `/api/time/list`,
        params: this.query
      }).then((res) => {
        this.data = res.data.data
      })
    },
    add () {
      this.modal = true
      this.modifyId = ''
      this.modalTitle = '添加配置'
    },
    edit (row) {
      this.modal = true
      this.modifyId = row.timeId
      this.modalTitle = `编辑${row.timeTitle}`
      for (const key in row) {
        if (this.form.hasOwnProperty(key)) {
          if (key === 'weekDay') {
            this.form[key] = row[key].split(',')
          } else {
            this.$set(this.form, key, String(row[key]))
          }
        }
      }
    },
    delect (data) {
      this.$Modal.confirm({
        title: '提示',
        content: `确定要删除${data.timeTitle}配置`,
        onOk: () => {
          this.$http.request({
            method: 'post',
            url: `/api/time/delect/${data.timeId}`,
            data: this.form
          }).then((res) => {
            if (res.data.code === 200) {
              this.load()
              this.$Message.success('删除成功')
            }
          })
        }
      })
    },
    modalOk () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          let data = { ...this.form }
          data.weekDay = data.weekDay.join(',')
          let url = this.modifyId ? `/api/time/update/${this.modifyId}` : `/api/time/add`
          this.$http.request({
            method: 'post',
            url: url,
            data
          }).then((res) => {
            if (res.data.code === 200) {
              this.load()
              this.$Message.success(this.modifyId ? '编辑成功' : '添加成功')
              this.modalCancel()
            }
          })
        }
      })
    },
    modalCancel () {
      this.modal = false
      this.$refs.form.resetFields()
      this.subjectType = {}
    },
    rangeChange () {
      this.form.dayStart = ''
      this.form.dayEnd = ''
      this.form.weekDay = []
      this.form.mouthDay = ''
      this.form.specialStart = ''
      this.form.specialEnd = ''
    },
    setRangeCnt (row) {
      let { timeRange, timeType, dayStart, dayEnd, weekDay, mouthDay, specialStart, specialEnd } = row
      timeRange = Number(timeRange)
      if (timeRange === 1) {
        return `${this.rangeMap[timeRange]}${dayStart}-${dayEnd}${this.typeMap[timeType]}排课`
      } else if (timeRange === 2) {
        weekDay = weekDay.split(',')
        weekDay = weekDay.map(item => { return this.weekArr[item] })
        weekDay.join(',')
        return `${this.rangeMap[timeRange]}${weekDay}${this.typeMap[timeType]}排课`
      } else if (timeRange === 3) {
        return `${this.rangeMap[timeRange]}${mouthDay}${this.typeMap[timeType]}排课`
      } else if (timeRange === 4) {
        return `${this.rangeMap[timeRange]}${specialStart}-${specialEnd}${this.typeMap[timeType]}排课`
      }
    }
  }
}
</script>
