<template>
  <Table ref="STable" stripe :columns="columns" :data="dealData"></Table>
</template>

<script>
export default {
  props: {
    data: { type: Array, require: true }
  },
  data () {
    return {
      columns: [
        {
          title: '序号',
          type: 'index',
          width: 80,
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
    }
  },
  methods: {
    downLoad (name) {
      this.$refs.STable.exportCsv({
        filename: name
      })
    }
  }
}
</script>

<style>

</style>
