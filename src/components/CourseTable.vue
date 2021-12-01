<template>
  <div class="course_table">
    <CheckboxGroup size="large" v-model="columnChecks">
      <Checkbox v-for="(item,i) in checkColumns" :key="i" :label="item.key" border>{{item.title}}</Checkbox>
    </CheckboxGroup>
    <Table ref="STable" stripe :columns="dealColumns" :data="dealData"></Table>
  </div>
</template>

<script>
export default {
  props: {
    data: { type: Array, require: true }
  },
  data () {
    return {
      columnChecks: [],
      columns: [
        {
          title: '序号',
          type: 'index',
          width: 80,
          align: 'center'
        },
        {
          title: '姓名',
          key: 'studentName',
          align: 'center'
        },
        {
          title: '订单ID',
          key: 'orderId',
          align: 'center'
        },
        {
          title: '订单类型',
          key: 'orderType',
          align: 'center'
        },
        {
          title: '机构名称',
          key: 'companyName',
          align: 'center'
        },
        {
          title: '日期',
          key: 'date',
          align: 'center'
        },
        {
          title: '时间',
          align: 'center',
          key: 'time',
          width: 140
        },
        {
          title: '科目',
          align: 'center',
          key: 'subjectName'
        },
        {
          title: '上课时长',
          align: 'center',
          key: 'duration'
        },
        {
          title: '课时费',
          align: 'center',
          key: 'unitPrice'
        }
      ]
    }
  },
  computed: {
    dealData () {
      return this.data.map(item => {
        item.date = this.$lib.myMoment(item.startTime).formate('YYYY-MM-DD')
        item.time = this.$lib.myMoment(item.startTime).formate('HH:mm') + '-' + this.$lib.myMoment(item.endTime).formate('HH:mm')
        item.duration = (new Date(item.endTime).getTime() - new Date(item.startTime).getTime()) / 60000 + '分钟'
        return item
      })
    },
    checkColumns () {
      return this.columns.filter(item => {
        return !!item.key
      })
    },
    dealColumns () {
      return this.columns.filter(item => {
        return item.key ? this.columnChecks.includes(item.key) : true
      })
    }
  },
  created () {
    this.setColumnChecks()
  },
  methods: {
    setColumnChecks () {
      this.columnChecks = this.checkColumns.map(item => item.key)
    },
    downLoad (name) {
      this.$lib.exportTable(this.$refs.STable.$el, `${name}课程记录`, `${this.$lib.myMoment().formate('YYYY年MM月DD日 HH时mm分ss秒')}`)
    }
  }
}
</script>

<style lang="less">
.course_table{
 .ivu-checkbox-group{
   margin-bottom: 15px;
 }
}
</style>
