<template>
  <div class="course_table">
    <CheckboxGroup size="large" v-model="columnChecks">
      <Checkbox v-for="(item,i) in checkColumns" :key="i" :label="item.key" border>{{item.title}}</Checkbox>
    </CheckboxGroup>
    <Table ref="STable" stripe :columns="dealColumns" :data="data"></Table>
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
          width: 120,
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
          title: '订单课时数',
          key: 'classCount',
          align: 'center'
        },
        {
          title: '剩余课时数',
          align: 'center',
          width: 180,
          key: 'surplusCount'
        },
        {
          title: '每节课分钟数',
          align: 'center',
          width: 200,
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
          title: '单价',
          key: 'perHourPay',
          align: 'center',
          render: (h, params) => {
            return h('p', `${parseInt(params.row.orderAmount / params.row.classCount)}元/小时`)
          }
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
          align: 'center'
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
          tooltip: true
        }
        // {
        //   title: '创建时间',
        //   key: 'createTime',
        //   align: 'center',
        //   render: (h, params) => {
        //     return h('p', this.$lib.myMoment(new Date(params.row.updateTime)).formate())
        //   }
        // }
      ]
    }
  },
  computed: {
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
      this.$lib.exportTable(this.$refs.STable.$el, `${name}同学订单记录`, `${this.$lib.myMoment().formate('YYYY年MM月DD日 HH时mm分ss秒')}`)
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
