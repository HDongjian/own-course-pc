<template>
  <div class="student-management">
    <div class="tool">
      <Form ref="query" :model="query" inline :label-width="80">
        <FormItem prop="studentId" label='学生姓名'>
          <Select filterable clearable style="width: 160px" v-model="query.studentId" placeholder="学生姓名">
            <Option v-for="(label,value) in studentType" :key="value" :value="value">{{label}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="companyId" label='所在机构'>
          <Select clearable style="width: 160px" v-model="query.companyId" placeholder="所在机构">
            <Option v-for="(label,value) in companyType" :key="value" :value="value">{{label}}</Option>
          </Select>
        </FormItem>
        <FormItem prop="status" label='状态'>
          <Select clearable style="width: 160px" v-model="query.status" placeholder="所在机构">
            <Option value="1">正常</Option>
            <Option value="2">结课</Option>
          </Select>
        </FormItem>
        <FormItem :label-width="20">
          <Button type="primary" @click="load(1)">查询</Button>
          <Button @click="reset()">重置</Button>
        </FormItem>
      </Form>
      <div>
        <Button type="primary" @click="add()">添加学生</Button>
      </div>
    </div>
    <Table stripe height="520" :columns="columns" :data="data"></Table>
    <Page v-if="query.total>0" :total="query.total" show-total :page-size="query.pageSize" :current="query.pageNum" @on-change="change"/>
    <Modal v-model="modal" :title="modalTitle" @on-cancel="modalCancel">
      <div class="modal-content">
        <Form ref="form" :model="form" :rules="formRules" :label-width="100">
          <FormItem label="学生名称" prop="studentName">
            <!--eslint-disable-next-line vue/no-parsing-error -->
            <Input :maxlength="10" v-model="form.studentName"></Input>
          </FormItem>
          <FormItem label="所在机构" prop="companyId">
            <Select @on-change='companyChange' style="width: 100%" v-model="form.companyId" placeholder="所在机构">
              <Option v-for="(label,value) in companyType" :key="value" :value="value">{{label}}</Option>
            </Select>
          </FormItem>
          <FormItem label="所报科目" prop="subjectIds">
            <Select multiple style="width: 100%" v-model="form.subjectIds" placeholder="科目">
              <Option v-for="(label,value) in subjectMap" :key="value" :value="value">{{label}}</Option>
            </Select>
          </FormItem>
          <FormItem label="课时费" prop="perHourPay">
            <!--eslint-disable-next-line vue/no-parsing-error -->
            <Input :maxlength="10" v-model="form.perHourPay"><span slot="append">元/小时</span></Input>
          </FormItem>
          <FormItem label="当前分数" prop="currentScore">
            <!--eslint-disable-next-line vue/no-parsing-error -->
            <Input :maxlength="10" v-model="form.currentScore"></Input>
          </FormItem>
          <FormItem label="目标分数" prop="targetScore">
            <!--eslint-disable-next-line vue/no-parsing-error -->
            <Input :maxlength="10" v-model="form.targetScore"></Input>
          </FormItem>
          <FormItem label="备注" prop="description">
            <!--eslint-disable-next-line vue/no-parsing-error -->
            <Input :maxlength="200" v-model="form.description" type="textarea" :autosize="{minRows: 3,maxRows: 3}"></Input>
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
import { validateWage } from '../../utils/validate'
export default {

  data () {
    return {
      getCatch: true,
      query: {
        studentName: '',
        companyId: '',
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
          align: 'center',
          width: 100
        },
        {
          title: '所在机构',
          key: 'studentName',
          align: 'center',
          render: (h, params) => {
            return h('p', this.companyType[params.row.companyId])
          }
        },
        {
          title: '所报科目',
          align: 'center',
          render: (h, params) => {
            return h('p', this.getSubject(params.row.subjectIds))
          }
        },
        {
          title: '课时费(元/小时)',
          key: 'perHourPay',
          align: 'center',
          width: 150
        },
        {
          title: '当前分数',
          key: 'currentScore',
          align: 'center',
          tooltip: true,
          render: (h, params) => {
            return h('p', params.row.currentScore || '--')
          }
        },
        {
          title: '目标分数',
          key: 'targetScore',
          align: 'center',
          render: (h, params) => {
            return h('p', params.row.targetScore || '--')
          }
        },
        {
          title: '状态',
          align: 'center',
          render: (h, params) => {
            return h('p', this.statusType[params.row.status])
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
                  color: params.row.status === '1' ? '#2D8cF0' : 'green'
                },
                on: {
                  click: () => {
                    this.changeStatus(params.row)
                  }
                }
              }, params.row.status === '1' ? '结课' : '复课')
            ])
          }
        }
      ],
      data: [],
      modal: false,
      modalTitle: '添加学生',
      modifyId: '',
      form: {
        studentName: '',
        companyId: '',
        subjectIds: [],
        currentScore: '',
        targetScore: '',
        perHourPay: '',
        description: ''
      },
      formRules: {
        studentName: [
          { required: true, message: '学生名称不能为空', trigger: 'blur' }
        ],
        subjectIds: [
          { required: true, type: 'array', min: 1, message: '请选择科目类型', trigger: 'change' },
          { type: 'array', max: 10, message: '请选择科目类型', trigger: 'change' }
        ],
        companyId: [
          { required: true, message: '所在机构', trigger: 'blur' }
        ],
        perHourPay: [
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
      }
    }
  },
  created () {
    this.load(1)
  },
  methods: {
    load (page) {
      this.query.pageNum = page
      let params = { ...this.query }
      params.startTime = params.startTime ? this.$lib.myMoment(params.startTime).formate('YYYY-MM-DD') + ' 00:00:00' : ''
      params.endTime = params.endTime ? this.$lib.myMoment(params.endTime).formate('YYYY-MM-DD') + ' 23:59:59' : ''
      this.$http.request({
        method: 'get',
        url: `/student/page`,
        params
      }).then((res) => {
        let data = res.data.data
        this.data = data.data
        this.query.total = data.total
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
      this.modifyId = row.studentId
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
        content: `确定要删除${data.studentName}学生`,
        onOk: () => {
          this.$http.request({
            method: 'post',
            url: `/student/delect/${data.studentId}`,
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
    changeStatus (data) {
      this.$http.request({
        method: 'post',
        url: `/student/status`,
        data: {
          studentId: data.studentId,
          status: data.status === '1' ? '2' : '1'
        }
      }).then((res) => {
        if (res.data.code === 200) {
          this.load(this.query.pageNum)
          this.$Message.success('修改成功')
        }
      })
    },
    modalOk () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          let data = { ...this.form }
          data.subjectIds = data.subjectIds.join(',')
          let url = this.modifyId ? `/student/update/${this.modifyId}` : `/student/add`
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
        url: `/subject/byExamIds`,
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
