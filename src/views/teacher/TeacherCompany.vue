<template>
  <div class="company-management">
    <div class="tool">
      <Form ref="query" :model="query" inline :label-width="120">
        <FormItem prop="user" label='机构名称'>
          <!--eslint-disable-next-line vue/no-parsing-error -->
          <Input type="text" v-model="query.companyName" placeholder="机构名称"></Input>
        </FormItem>
        <FormItem :label-width="20">
          <Button type="primary" @click="load()">查询</Button>
          <Button @click="reset()">重置</Button>
          <Button type="primary" @click="add()">添加机构</Button>
        </FormItem>
      </Form>
    </div>
    <Table stripe :columns="columns" :data="data"></Table>
    <Modal v-model="modal" :title="modalTitle" @on-cancel="modalCancel">
      <div class="modal-content">
        <Form ref="form" :model="form" :rules="formRules" :label-width="110">
          <FormItem label="机构名称" prop="companyName">
            <!--eslint-disable-next-line vue/no-parsing-error -->
            <Input :maxlength="20" v-model="form.companyName"></Input>
          </FormItem>
          <FormItem label="科目类型" prop="companyType">
            <Select multiple style="width: 100%" v-model="form.companyType" placeholder="科目类型">
              <Option v-for="(label,value) in examType" :key="value" :value="value">{{label}}</Option>
            </Select>
          </FormItem>
          <FormItem label="录入订单" prop="isOrder">
            <i-switch false-value="0" true-value="1" v-model="form.isOrder" size="large">
              <span slot="open">可以</span>
              <span slot="close">不可</span>
            </i-switch>
          </FormItem>
          <FormItem label="机构地址" prop="address">
            <!--eslint-disable-next-line vue/no-parsing-error -->
            <Input :maxlength="100" v-model="form.address" type="textarea" :autosize="{minRows: 3,maxRows: 3}"></Input>
          </FormItem>
          <FormItem label="联系人" prop="contactName">
            <!--eslint-disable-next-line vue/no-parsing-error -->
            <Input :maxlength="10" v-model="form.contactName"></Input>
          </FormItem>
          <FormItem label="联系电话" prop="mobile">
            <!--eslint-disable-next-line vue/no-parsing-error -->
            <Input :maxlength="11" v-model="form.mobile"></Input>
          </FormItem>
          <FormItem label="工资发放日期" prop="payrollDate">
            <!--eslint-disable-next-line vue/no-parsing-error -->
            <Input :maxlength="40" v-model="form.payrollDate"></Input>
          </FormItem>
          <FormItem label="课时费(每小时)">
            <Row>
              <Col span="11">
              <FormItem prop="wageMin">
                <!--eslint-disable-next-line vue/no-parsing-error -->
                <Input v-model="form.wageMin"></Input>
              </FormItem>
              <!--eslint-disable-next-line vue/no-parsing-error -->
              </Col>
              <!--eslint-disable-next-line vue/no-parsing-error -->
              <Col span="2" style="text-align: center">-</Col>
              <Col span="11">
              <FormItem prop="wageMax">
                <!--eslint-disable-next-line vue/no-parsing-error -->
                <Input v-model="form.wageMax"></Input>
              </FormItem>
              <!--eslint-disable-next-line vue/no-parsing-error -->
              </Col>
            </Row>
          </FormItem>
          <FormItem label="机构类型" prop="onlineType">
            <Select style="width: 100%" v-model="form.onlineType" placeholder="机构类型">
              <Option v-for="(label,value) in onlineMaps" :key="value" :value="value">{{label}}</Option>
            </Select>
          </FormItem>
          <FormItem label="线上渠道" prop="onlineChannel">
            <!--eslint-disable-next-line vue/no-parsing-error -->
            <Input :maxlength="40" v-model="form.onlineChannel"></Input>
          </FormItem>
          <FormItem label="线下地址" prop="offlineAddress">
            <!--eslint-disable-next-line vue/no-parsing-error -->
            <Input :maxlength="40" v-model="form.offlineAddress"></Input>
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
        companyName: ''
      },
      columns: [
        {
          title: '序号',
          type: 'index',
          width: 120,
          align: 'center'
        },
        {
          title: '机构名称',
          key: 'companyName',
          align: 'center'
        },
        {
          title: '科目类型',
          key: 'companyType',
          align: 'center',
          render: (h, params) => {
            return h('p', this.getExams(params.row.companyType))
          }
        },
        {
          title: '录入订单',
          key: 'isOrder',
          align: 'center',
          render: (h, params) => {
            return h('p', params.row.isOrder === '1' ? '可以' : '不可以')
          }
        },
        {
          title: '机构地址',
          key: 'address',
          align: 'center',
          tooltip: true
        },
        {
          title: '联系人',
          key: 'contactName',
          align: 'center'
        },
        {
          title: '联系电话',
          key: 'mobile',
          align: 'center'
        },
        {
          title: '工资发放日期',
          key: 'payrollDate',
          align: 'center'
        },
        {
          title: '课时费(每小时)',
          align: 'center',
          render: (h, params) => {
            return h('p', params.row.wageMin + '-' + params.row.wageMax)
          }
        },
        {
          title: '机构类型',
          align: 'center',
          render: (h, params) => {
            return h('p', this.onlineMaps[params.row.onlineType])
          }
        },
        {
          title: '线上渠道',
          key: 'onlineChannel',
          align: 'center',
          tooltip: true,
          render: (h, params) => {
            return h('p', params.row.onlineChannel || '--')
          }
        },
        {
          title: '线下地址',
          key: 'offlineAddress',
          align: 'center',
          tooltip: true,
          render: (h, params) => {
            return h('p', params.row.offlineAddress || '--')
          }
        },
        {
          title: '备注',
          key: 'description',
          align: 'center',
          tooltip: true
        },
        // {
        //   title: '创建时间',
        //   key: 'createTime',
        //   align: 'center',
        //   render: (h, params) => {
        //     return h('p', this.$lib.myMoment(new Date(params.row.createTime)).formate())
        //   }
        // },
        {
          title: '操作',
          key: 'action',
          fixed: 'right',
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
      data: [],
      modal: false,
      modalTitle: '添加机构',
      modifyId: '',
      form: {
        companyName: '',
        isOrder: '0',
        companyType: [],
        address: '',
        wageMax: '',
        wageMin: '',
        onlineType: '',
        onlineChannel: '',
        offlineAddress: '',
        contactName: '',
        mobile: '',
        payrollDate: '',
        description: ''
      },
      formRules: {
        isOrder: [
          { required: true, message: '请选择是否可以录入订单', trigger: 'change' }
        ],
        companyName: [
          { required: true, message: '机构名称不能为空', trigger: 'blur' }
        ],
        companyType: [
          { required: true, type: 'array', min: 1, message: '请选择科目类型', trigger: 'change' },
          { type: 'array', max: 10, message: '请选择科目类型', trigger: 'change' }
        ],
        address: [
          { required: true, message: '机构地址不能为空', trigger: 'blur' }
        ],
        contactName: [
          { required: true, message: '联系人不能为空', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '联系电话不能为空', trigger: 'blur' }
        ],
        payrollDate: [
          { required: true, message: '工资发放日期不能为空', trigger: 'blur' }
        ],
        onlineType: [
          { required: true, message: '请选择机构类型', trigger: 'change' }
        ],
        wageMin: [
          { required: true, validator: validateWage, trigger: 'blur' }
        ],
        wageMax: [
          { required: true, validator: validateWage, trigger: 'blur' }
        ]
      },
      examType: {},
      onlineMaps: {
        1: '线上',
        2: '线下',
        3: '线上和线下'
      }
    }
  },
  created () {
    this.load()
    this.getExam()
  },
  methods: {
    load () {
      this.$http.request({
        method: 'get',
        url: `/api/company/list`,
        params: this.query
      }).then((res) => {
        this.data = res.data.data
      })
    },
    reset () { },
    add () {
      this.modal = true
      this.modifyId = ''
      this.modalTitle = '添加机构'
    },
    edit (row) {
      this.modal = true
      this.modifyId = row.companyId
      this.modalTitle = `编辑${row.companyName}`
      for (const key in row) {
        if (this.form.hasOwnProperty(key)) {
          if (key === 'companyType') {
            this.form[key] = row[key].split(',')
          } else {
            this.form[key] = row[key]
          }
        }
      }
    },
    delect (data) {
      this.$Modal.confirm({
        title: '提示',
        content: `确定要删除${data.companyName}机构`,
        onOk: () => {
          this.$http.request({
            method: 'post',
            url: `/api/company/delect/${data.companyId}`,
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
          data.companyType = data.companyType.join(',')
          let url = this.modifyId ? `/api/company/update/${this.modifyId}` : `/api/company/add`
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
    },
    treeChoosed (ids) {
      let menuIds = []
      for (const d of ids) {
        if (!menuIds.includes(d.menuId)) {
          menuIds.push(d.menuId)
        }
        if (d.parentId !== 0 && !menuIds.includes(d.parentId)) {
          menuIds.push(d.parentId)
        }
      }
      this.form.menuIds = menuIds.join(',')
    },
    getExam () {
      this.$http.request({
        method: 'get',
        url: `/api/exam/list`
      }).then((res) => {
        for (const data of res.data.data) {
          this.$set(this.examType, data.examId, data.examName)
        }
      })
    },
    getExams (types) {
      let names = ''
      types = types.split(',')
      for (const t of types) {
        names += this.examType[t] + ' '
      }
      return names
    }
  }
}
</script>
