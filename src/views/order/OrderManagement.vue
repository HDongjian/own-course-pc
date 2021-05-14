<template>
  <div class="order-management">
    <div class="tool">
      <Form ref="query" :model="query" inline :label-width="80">
        <FormItem prop="studentId" label='学生姓名'>
          <Select filterable clearable style="width: 160px" v-model="query.studentId" placeholder="学生姓名">
            <Option v-for="(label,value) in orderStudentType" :key="value" :value="value">{{label}}</Option>
          </Select>
        </FormItem>
        <FormItem label="订单编号" prop="orderNumber" :label-width="80">
          <Input v-model="query.orderNumber" placeholder="订单编号" style="width: 160px" />
        </FormItem>
        <FormItem label="订单日期" prop="orderStartDate" :label-width="80">
          <DatePicker v-model="query.orderStartDate" type="date" placeholder="开始时间" style="width: 160px"></DatePicker>
        </FormItem>
        <FormItem label="—" class="date-line" prop="orderEndDate" :label-width="20">
          <DatePicker v-model="query.orderEndDate" type="date" placeholder="结束时间" style="width: 160px"></DatePicker>
        </FormItem>
        <FormItem prop="orderType" label='订单类型'>
          <Select clearable style="width: 160px" v-model="query.orderType" placeholder="订单类型">
            <Option v-for="(label,value) in orderType" :key="value" :value="value">{{label}}</Option>
          </Select>
        </FormItem>
        <FormItem :label-width="20">
          <Button type="primary" @click="load(1)">查询</Button>
          <Button @click="reset()">重置</Button>
          <Button type="primary" @click="add()">添加订单</Button>
        </FormItem>
      </Form>
    </div>
    <Table :loading="loading" stripe height="520" :columns="columns" :data="data"></Table>
    <Page v-if="query.total>0" :total="query.total" show-total :page-size="query.pageSize" :current="query.pageNum" @on-change="change" />
    <Modal v-model="modal" :title="modalTitle" @on-cancel="modalCancel">
      <div class="modal-content">
        <Form ref="form" :model="form" :rules="formRules" :label-width="110">
          <FormItem label="学生名称" prop="studentId">
            <Select filterable clearable style="width: 100%" v-model="form.studentId" placeholder="学生姓名">
              <Option v-for="(label,value) in orderStudentType" :key="value" :value="value">{{label}}</Option>
            </Select>
          </FormItem>
          <FormItem label="课时数" prop="classCount">
            <Input :maxlength="10" v-model="form.classCount"></Input>
          </FormItem>
          <FormItem label="每节课分钟数" prop="classMinute">
            <Input :maxlength="10" v-model="form.classMinute"><span slot="append">分钟</span></Input>
          </FormItem>
          <FormItem label="订单金额" prop="orderAmount">
            <Input :maxlength="10" v-model="form.orderAmount"><span slot="append">元</span></Input>
          </FormItem>
          <FormItem label="单价">
            <Input readonly :maxlength="10" v-model="orderUnit"><span slot="append">元</span></Input>
          </FormItem>
          <FormItem label="订单日期" prop="orderDate">
            <DatePicker clearable v-model="form.orderDate" type="date" placeholder="订单日期" style="width: 100%"></DatePicker>
          </FormItem>
          <FormItem label="订单类型" prop="orderType">
            <Select style="width: 100%" v-model="form.orderType" placeholder="订单类型">
              <Option v-for="(label,value) in orderType" :key="value" :value="value">{{label}}</Option>
            </Select>
          </FormItem>
          <FormItem label="订单号" prop="orderNumber">
            <Input :maxlength="10" v-model="form.orderNumber"></Input>
          </FormItem>
          <FormItem label="备注" prop="description">
            <Input :maxlength="200" v-model="form.description" type="textarea" :autosize="{minRows: 3,maxRows: 3}"></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button @click="modalCancel()">取消</Button>
        <Button type="primary" @click="modalOk()">确定</Button>
      </div>
    </Modal>
    <Modal v-model="detailModal" title="课时记录" width="80%">
      <Card>
        <div style="height:36px;line-height:36px" slot="title">课时记录 <Button class="fr" type="primary" @click="downLoadCourse()">导出</Button></div>
        <course-table ref="couseTable" :data="courseList"></course-table>
      </Card>
      <div slot="footer"></div>
    </Modal>
  </div>
</template>

<script>
import { validateWage } from '../../utils/validate'
export default {

  data () {
    return {
      loading: true,
      getCatch: true,
      orderType: {
        '1': '淘宝订单',
        '2': '淘宝试听',
        '3': '推荐订单',
        '4': '推荐试听',
        '5': '其他'
      },
      query: {
        studentName: '',
        orderType: '',
        orderNumber: '',
        companyId: '',
        orderStartDate: '',
        orderEndDate: '',
        total: 0,
        pageSize: 10,
        pageNum: 1
      },
      columns: [
        {
          title: '序号',
          width: 80,
          align: 'center',
          render: (h, params) => {
            return h('p', (this.query.pageNum - 1) * 10 + params.index + 1)
          }
        }, {
          title: '学生姓名',
          key: 'studentName',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return h('p', this.studentType[params.row.studentId])
          }
        },
        {
          title: '订单课时数',
          key: 'classCount',
          align: 'center'
        },
        {
          title: '每节课分钟数',
          align: 'center',
          key: 'classMinute'
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
          },
          width: 150
        },
        {
          title: '订单日期',
          key: 'orderDate',
          align: 'center',
          render: (h, params) => {
            return h('p', this.$lib.myMoment(new Date(params.row.orderDate)).formate('YYYY-MM-DD'))
          }
        },
        {
          title: '订单类型',
          key: 'orderType',
          align: 'center',
          render: (h, params) => {
            return h('p', this.orderType[params.row.orderType] || '--')
          }
        },
        {
          title: '订单号',
          align: 'center',
          render: (h, params) => {
            return h('p', params.row.orderNumber || '--')
          }
        },
        {
          title: '备注',
          key: 'description',
          align: 'center',
          width: 250,
          tooltip: true
        },
        {
          title: '创建时间',
          key: 'createTime',
          width: 170,
          align: 'center',
          render: (h, params) => {
            return h('p', this.$lib.myMoment(new Date(params.row.updateTime)).formate())
          }
        },
        {
          title: '操作',
          key: 'action',
          width: 180,
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
                style: {
                  marginRight: '16px',
                  color: 'red'
                },
                on: {
                  click: () => {
                    this.delect(params.row)
                  }
                }
              }, '删除'),
              h('a', {
                style: {
                  color: '#2D8cF0'
                },
                on: {
                  click: () => {
                    this.detail(params.row)
                  }
                }
              }, '课时记录')
            ])
          }
        }
      ],
      data: [],
      modal: false,
      modalTitle: '添加学生',
      modifyId: '',
      form: {
        studentId: '',
        classCount: '',
        orderDate: '',
        orderAmount: '',
        orderNumber: '',
        description: '',
        classMinute: '',
        orderType: ''
      },
      formRules: {
        studentId: [
          { required: true, message: '学生名称不能为空', trigger: 'change' }
        ],
        orderDate: [
          { required: true, type: 'date', message: '订单日期不能为空', trigger: 'change' }
        ],
        orderType: [
          { required: true, message: '订单类型不能为空', trigger: 'change' }
        ],
        classCount: [
          { required: true, validator: validateWage, trigger: 'blur' }
        ],
        classMinute: [
          { required: true, validator: validateWage, trigger: 'blur' }
        ],
        orderAmount: [
          { required: true, validator: validateWage, trigger: 'blur' }
        ]
      },
      examType: {},
      onlineMaps: {
        1: '线上',
        2: '线下',
        3: '线上和线下'
      },
      subjectMap: {},
      statusType: {
        1: '正常',
        2: '结课'
      },
      detailModal: false,
      courseList: []
    }
  },
  computed: {
    orderUnit () {
      let { classCount, orderAmount } = this.form
      if (!classCount || !orderAmount) return 0
      return parseInt(orderAmount / classCount)
    }
  },
  created () {
    this.load(1)
  },
  methods: {
    load (page) {
      this.query.pageNum = page
      let params = { ...this.query }
      params.orderStartDate = params.orderStartDate ? this.$lib.myMoment(params.orderStartDate).formate('YYYY-MM-DD') + ' 00:00:00' : ''
      params.orderEndDate = params.orderEndDate ? this.$lib.myMoment(params.orderEndDate).formate('YYYY-MM-DD') + ' 23:59:59' : ''
      this.$http.request({
        method: 'get',
        url: `/api/order/page`,
        params
      }).then((res) => {
        let data = res.data.data
        this.data = data.data
        this.query.total = data.total
        this.loading = false
      })
    },
    async detail (row) {
      this.detailModal = true
      this.$http.request({
        method: 'get',
        url: `/api/course/list?orderId=${row.orderId}`
      }).then((res) => {
        let data = res.data.data || []
        data = data.sort((x, y) => {
          return new Date(x.startTime).getTime() - new Date(y.startTime).getTime()
        })
        this.courseList = data.map(item => {
          item.studentName = this.studentType[item.studentId]
          item.companyName = this.companyType[item.companyId]
          item.subjectName = this.subjectType[item.subjectId]
          item.orderType = this.orderType[row.orderType]
          return item
        })
      })
    },
    change (page) {
      this.load(page)
    },
    reset () {
      this.$refs.query.resetFields()
    },
    add () {
      this.modal = true
      this.modifyId = ''
      this.modalTitle = '添加学生'
    },
    edit (row) {
      this.modal = true
      this.modifyId = row.orderId
      this.modalTitle = `编辑${row.studentName}`
      for (const key in row) {
        if (this.form.hasOwnProperty(key)) {
          if (key === 'subjectIds') {
            this.form[key] = row[key].split(',')
          } else {
            this.$set(this.form, key, String(row[key]))
          }
        }
      }
      this.companyChange(row.companyId)
    },
    delect (data) {
      this.$Modal.confirm({
        title: '提示',
        content: `确定要删除${this.studentType[data.studentId]}学生订单`,
        onOk: () => {
          this.$http.request({
            method: 'post',
            url: `/api/order/delect/${data.orderId}`,
            data: this.form
          }).then((res) => {
            if (res.data.code === 200) {
              this.load(this.query.pageNum)
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
          data.orderDate = this.$lib.myMoment(data.orderDate).formate()
          let url = this.modifyId ? `/api/order/update/${this.modifyId}` : `/api/order/add`
          this.$http.request({
            method: 'post',
            url: url,
            data
          }).then((res) => {
            if (res.data.code === 200) {
              this.load(this.query.pageNum)
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
      this.subjectMap = {}
    },
    companyChange (value) {
      let examIds = ''
      for (const company of this.companyList) {
        if (company.companyId === Number(value)) {
          examIds = company.companyType
        }
      }
      if (!examIds) return
      this.$http.request({
        method: 'get',
        url: `/api/subject/byExamIds`,
        params: { examIds }
      }).then((res) => {
        this.subjectList = res.data.data
        for (const data of res.data.data) {
          this.$set(this.subjectMap, data.subjectId, data.subjectName)
        }
      })
    },
    getSubject (types) {
      let names = ''
      types = types.split(',')
      for (const t of types) {
        names += this.subjectType[t] + ' '
      }
      return names
    }
  }
}
</script>
