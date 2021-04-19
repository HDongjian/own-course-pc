<template>
  <div class="course-management">
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
        <FormItem prop="subjectId" label='科目' :label-width="40">
          <Select clearable style="width: 160px" v-model="query.subjectId" placeholder="科目">
            <Option v-for="(label,value) in subjectType" :key="value" :value="value">{{label}}</Option>
          </Select>
        </FormItem>
        <FormItem label="日期" prop="startTime" :label-width="40">
          <DatePicker  v-model="query.startTime" type="date" placeholder="开始时间" style="width: 160px"></DatePicker>
        </FormItem>
        <FormItem label="—" class="date-line" prop="endTime" :label-width="20">
          <DatePicker v-model="query.endTime" type="date" placeholder="结束时间" style="width: 160px"></DatePicker>
        </FormItem>
        <FormItem :label-width="20">
          <Button type="primary" @click="load(1)">查询</Button>
          <Button @click="reset()">重置</Button>
          <Button type="primary" @click="downLoad()">导出</Button>
        </FormItem>
      </Form>
      <div>
        <Button type="primary" @click="add()">批量添加</Button>
      </div>
    </div>
    <Table stripe height="520" :columns="columns" :data="data"></Table>
    <Page v-if="query.total>0" :total="query.total" show-total :page-size="query.pageSize" :current="query.pageNum" @on-change="change"/>
    <add-course :modalData="modal" :editData="editData" @close="addClose"></add-course>
  </div>
</template>

<script>
export default {

  data () {
    return {
      getCatch: true,
      modal: false,
      editData: {},
      query: {
        studentId: '',
        companyId: '',
        subjectId: '',
        total: 0,
        pageSize: 10,
        pageNum: 1,
        startTime: '',
        endTime: ''
      },
      columns: [
        {
          title: '序号',
          width: 80,
          align: 'center',
          render: (h, params) => {
            return h('p', (this.query.pageNum - 1) * 10 + params.index + 1)
          }
        },
        {
          title: '学生姓名',
          key: 'courseName',
          align: 'center',
          render: (h, params) => {
            return h('p', this.studentType[params.row.studentId])
          }
        },
        {
          title: '机构名称',
          key: 'courseName',
          align: 'center',
          render: (h, params) => {
            return h('p', this.companyType[params.row.companyId])
          }
        },
        {
          title: '日期',
          key: 'date',
          align: 'center',
          render: (h, params) => {
            return h('p', this.$lib.myMoment(params.row.startTime).formate('YYYY-MM-DD'))
          }
        },
        {
          title: '时间',
          align: 'center',
          width: 140,
          render: (h, params) => {
            return h('p', this.$lib.myMoment(params.row.startTime).formate('HH:mm') + '-' + this.$lib.myMoment(params.row.endTime).formate('HH:mm'))
          }
        },
        {
          title: '科目',
          align: 'center',
          render: (h, params) => {
            return h('p', this.subjectType[params.row.subjectId])
          }
        },
        {
          title: '上课时长',
          align: 'center',
          render: (h, params) => {
            return h('p', (new Date(params.row.endTime).getTime() - new Date(params.row.startTime).getTime()) / 60000 + '分钟')
          }
        },
        {
          title: '课时费',
          align: 'center',
          render: (h, params) => {
            return h('p', params.row.unitPrice + '元')
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
      data: []
    }
  },
  created () {
    this.load(1)
  },
  methods: {
    change (page) {
      this.load(page)
    },
    load (page) {
      this.query.pageNum = page || 1
      let params = { ...this.query }
      params.startTime = params.startTime ? this.$lib.myMoment(params.startTime).formate() : ''
      params.endTime = params.endTime ? this.$lib.myMoment(params.endTime).formate('YYYY-MM-DD') + ' 23:59:59' : ''
      this.$http.request({
        method: 'get',
        url: `/api/course/page`,
        params
      }).then((res) => {
        let data = res.data.data
        this.data = data.data
        this.query.total = data.total
      })
    },
    reset () {
      this.$refs.query.resetFields()
    },
    downLoad () {
      let params = { ...this.query }
      if (params.startTime) {
        params.startTime = this.$lib.myMoment(params.startTime).formate()
      }
      if (params.endTime) {
        params.endTime = this.$lib.myMoment(params.endTime).formate('YYYY-MM-DD') + ' 23:59:59'
      }
      let url = this.$lib.downLoadUrl('/api/course/download', params)
      location.href = url
    },
    add () {
      this.modal = true
      this.modifyId = ''
      this.modalTitle = '添加课程'
      this.editData = {}
    },
    addClose () {
      this.modal = false
      this.load(this.query.pageNum)
    },
    edit (row) {
      this.modal = true
      this.editData = row
    },
    delect (data) {
      this.$Modal.confirm({
        title: '提示',
        content: `确定要删除${this.studentType[data.studentId]}在${this.$lib.myMoment(data.startTime).formate('YYYY-MM-DD HH:mm')}的课程`,
        onOk: () => {
          this.$http.request({
            method: 'post',
            url: `/api/course/delect/${data.courseId}`,
            data: this.form
          }).then((res) => {
            if (res.data.code === 200) {
              this.load(this.query.pageNum)
              this.$Message.success('删除成功')
            }
          })
        }
      })
    }
  }
}
</script>
