<template>
  <Modal width="1000px" v-model="modal" :title="modalTitle" @on-cancel="modalCancel">
    <div class="modal-content">
      <Form ref="form" :model="form" inline :rules="formRules" :label-width="80">
        <FormItem label="学生姓名" prop="studentId">
          <Select filterable clearable style="width: 160px" @on-change='studentChange' v-model="form.studentId" placeholder="学生姓名">
            <Option v-for="(item,value) in studentList" :key="value" :value="String(item.studentId)">{{item.studentName}}</Option>
          </Select>
        </FormItem>
        <FormItem label="单价" prop="price">
          <!--eslint-disable-next-line vue/no-parsing-error -->
          <Input style="width: 160px" :maxlength="10" v-model="form.price"><span slot="append">元/小时</span></Input>
        </FormItem>
        <FormItem label="科目" prop="subjectId">
          <Select clearable style="width: 160px" v-model="form.subjectId" placeholder="科目">
            <Option v-for="(label,value) in subjectType" :key="value" :value="value">{{label}}</Option>
          </Select>
        </FormItem>
        <FormItem label="上课日期" prop="date">
          <DatePicker clearable v-model="form.date" type="date" placeholder="日期" style="width: 160px"></DatePicker>
        </FormItem>
        <FormItem label="上课时间" prop="time">
          <!--eslint-disable-next-line vue/no-parsing-error -->
          <Input style="width: 160px" :maxlength="5" v-model="form.time"></Input>
        </FormItem>
        <FormItem label="上课时长" prop="duration">
          <!--eslint-disable-next-line vue/no-parsing-error -->
          <Input style="width: 160px" :maxlength="10" v-model="form.duration"><span slot="append">分钟</span></Input>
        </FormItem>
        <FormItem label="课时费" prop="unitPrice">
          <!--eslint-disable-next-line vue/no-parsing-error -->
          <Input style="width: 160px" readonly :maxlength="10" v-model="unitPrice"><span slot="append">元</span></Input>
        </FormItem>
        <FormItem v-if="!editId" :label-width="20">
          <Button type="primary" @click="addTable()">添加</Button>
        </FormItem>
        <FormItem v-if="!editId" :label-width="4">
          <Button @click="reset()">重置</Button>
        </FormItem>
      </Form>
      <Table stripe v-if="!editId" height="400" :columns="addFormColumns" :data="addTableData"></Table>
    </div>
    <div slot="footer">
      <Button @click="modalCancel()">取消</Button>
      <Button v-if="editId" type="primary" @click="modalOkEdit()">提交</Button>
      <Button v-else type="primary" @click="modalOk()">确定</Button>
    </div>
  </Modal>
</template>

<script>
import { validateWage, validateTime } from '../utils/validate'
export default {
  data () {
    const validateDay = (rule, value, callback) => {
      if (!validateTime(value)) {
        callback(new Error('时间格式不正确'))
      }
      callback()
    }
    return {
      modal: false,
      modalTitle: '添加课程',
      modifyId: '',
      form: {
        studentId: '',
        subjectId: '',
        price: '',
        date: '',
        time: '',
        duration: '90'
      },
      formRules: {
        studentId: [
          { required: true, message: '学生姓名不能为空', trigger: 'change' }
        ],
        price: [
          { required: true, validator: validateWage, trigger: 'blur' }
        ],
        subjectId: [
          { required: true, message: '科目不能为空', trigger: 'change' }
        ],
        date: [
          { required: true, type: 'date', message: '请选择上课日期', trigger: 'change' }
        ],
        time: [
          { required: true, validator: validateDay, trigger: 'blur' }
        ],
        duration: [
          { required: true, validator: validateWage, trigger: 'blur' }
        ]
      },
      studentList: [],
      studentType: {},
      subjectType: {},
      addFormColumns: [
        {
          title: '序号',
          type: 'index',
          width: 80,
          align: 'center'
        },
        {
          title: '日期',
          key: 'date',
          align: 'center',
          render: (h, params) => {
            return h('p', this.$lib.myMoment(params.row.startTime).formate('YYYY-MM-DD'))
          }
        }, {
          title: '时间',
          align: 'center',
          width: 140,
          render: (h, params) => {
            return h('p', this.$lib.myMoment(params.row.startTime).formate('HH:mm') + '-' + this.$lib.myMoment(params.row.endTime).formate('HH:mm'))
          }
        }, {
          title: '姓名',
          align: 'center',
          render: (h, params) => {
            return h('p', this.studentType[params.row.studentId])
          }
        }, {
          title: '科目',
          align: 'center',
          render: (h, params) => {
            return h('p', this.subjectMap[params.row.subjectId])
          }
        }, {
          title: '上课时长',
          align: 'center',
          render: (h, params) => {
            return h('p', params.row.duration + '分钟')
          }
        }, {
          title: '课时费',
          align: 'center',
          render: (h, params) => {
            return h('p', params.row.unitPrice + '元')
          }
        }, {
          title: '操作',
          key: 'action',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return h('a', {
              on: {
                click: () => {
                  this.delectTableByDate(params)
                }
              }
            }, '删除')
          }
        }
      ],
      addTableData: [],
      myEditData: {},
      editId: '',
      subjectMap: {}
    }
  },
  props: {
    modalData: { type: Boolean, default: false },
    editData: { type: Object }
  },
  watch: {
    modalData () {
      this.modal = this.modalData
      this.addTableData = []
    },
    editData () {
      this.myEditData = { ...this.editData }
      this.modalTitle = '编辑课程'
      this.editId = this.myEditData.courseId || ''
      this.editId && this.dataToForm(this.myEditData)
    }
  },
  computed: {
    unitPrice () {
      let { price, duration } = this.form
      if (price && duration && !isNaN(price) && !isNaN(duration)) {
        return Math.round(price / 60 * duration)
      }
      return ''
    }
  },
  created () {
    this.getStudent()
    this.getSubjects()
  },
  methods: {
    addCourse (data) {
      return this.$http.request({
        method: 'post',
        url: '/course/add',
        data
      }).then((res) => {
        if (res.data.code === 200) {
          return true
        }
        return false
      })
    },
    modalOkEdit () {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        let data = this.formToData()
        this.$http.request({
          method: 'post',
          url: '/course/update',
          data: { id: this.editId, ...data }
        }).then((res) => {
          if (res.data.code === 200) {
            this.modalCancel()
          } else {
            let data = res.data.data
            this.$Notice.success({
              title: '排课提醒',
              desc: `该课程和学生${this.studentType[data.studentId]}${this.$lib.myMoment(data.startTime).formate('YYYY-MM-DD HH:mm')}课程冲突，请重新选择`
            })
          }
        })
      })
    },
    async modalOk () {
      let count = 0; let len = this.addTableData.length
      if (len === 0) {
        this.$Notice.success({
          title: '排课提醒',
          desc: `请选择课程`
        })
        return
      }
      for (let i = len - 1; i >= 0; i--) {
        let result = await this.addCourse(this.addTableData[i])
        if (result) {
          this.addTableData.splice(i, 1)
          count++
        }
      }
      this.$Notice.success({
        title: '排课提醒',
        desc: `成功排课${count}节，失败${len - count}节`
      })
      if (len === count) {
        this.modalCancel()
      }
    },
    addTable () {
      console.log(this.form)
      this.$refs.form.validate((valid) => {
        if (!valid) return
        let { studentId, subjectId, duration } = this.form
        let { startTime, endTime } = this.$lib.getStartEndTime(this.form)
        let data = {
          studentId,
          subjectId,
          startTime,
          endTime,
          duration,
          unitPrice: this.unitPrice
        }
        let result = this.$lib.hasPeriodOrNot(data, this.addTableData)
        if (result) {
          this.$Notice.success({
            title: '排课提醒',
            desc: `该课程和开始时间为${result}课程冲突，请重新选择`,
            duration: 1000
          })
          return
        }
        this.addTableData.push(data)
      })
    },
    delectTableByDate (params) {
      this.addTableData.splice(params.index, 1)
    },
    reset () {
      this.$refs.form.resetFields()
    },
    modalCancel () {
      this.modal = false
      this.addTableData = []
      this.$emit('close')
      this.$refs.form.resetFields()
    },
    studentChange (value) {
      console.log(value)
      let subjectIds = ''
      this.form.subjectId = ''
      this.subjectType = {}
      for (const student of this.studentList) {
        if (student.studentId === Number(value)) {
          subjectIds = student.subjectIds
          this.form.price = student.perHourPay
        }
      }
      if (!subjectIds) return
      this.$http.request({
        method: 'get',
        url: `/subject/byIds`,
        params: { subjectIds }
      }).then((res) => {
        this.subjectList = res.data.data
        for (const data of res.data.data) {
          this.$set(this.subjectType, data.subjectId, data.subjectName)
        }
        if (this.subjectList.length >= 1) {
          this.form.subjectId = String(this.subjectList[0].subjectId)
        }
      })
    },
    getStudent () {
      this.$http.request({
        method: 'get',
        url: `/student/list`
      }).then((res) => {
        this.studentList = res.data.data
        for (const data of res.data.data) {
          this.$set(this.studentType, data.studentId, data.studentName)
        }
      })
    },
    getSubjects () {
      this.$http.request({
        method: 'get',
        url: `/subject/list`
      }).then((res) => {
        for (const data of res.data.data) {
          this.$set(this.subjectMap, data.subjectId, data.subjectName)
        }
      })
    },
    formToData () {
      let { studentId, subjectId } = this.form
      let { startTime, endTime } = this.$lib.getStartEndTime(this.form)
      let data = {
        studentId,
        subjectId,
        startTime,
        endTime,
        unitPrice: this.unitPrice
      }
      return data
    },
    dataToForm (data) {
      let { studentId, subjectId, startTime, endTime } = data
      this.form.studentId = String(studentId)
      this.form.subjectId = String(subjectId)
      this.studentChange(this.form.studentId)
      this.form.date = this.$lib.myMoment(startTime).formate('YYYY-MM-DD')
      this.form.time = this.$lib.myMoment(startTime).formate('HH:mm')
      this.form.duration = (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000
    }
  }
}
</script>
