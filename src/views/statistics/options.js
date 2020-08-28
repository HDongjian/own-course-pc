
let color = ['#2db7f5', '#19be6b', '#ff9900', '#F04864']
export const dayCourse = function () {
  let date = []
  let data = {}
  let series = []
  let legend = []
  for (const key in this.classes) {
    date.push(key)
    for (const i in this.classes[key]) {
      if (data[i]) {
        data[i].push(this.classes[key][i])
      } else {
        data[i] = [this.classes[key][i]]
      }
    }
  }
  for (const item in data) {
    legend.push(this.subjectType[item])
    series.push({
      name: this.subjectType[item],
      type: 'bar',
      stack: '总量',
      label: {
        normal: {
          show: true,
          position: 'insideRight'
        }
      },
      data: data[item]
    })
  }
  let option = {
    color,
    tooltip: {
      trigger: 'axis',
      axisPointer: { // 坐标轴指示器，坐标轴触发有效
        type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
      }
    },
    legend: {
      data: legend
    },
    grid: {
      left: '5%',
      right: '8%',
      bottom: '3%',
      containLabel: true
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}小时'
      },
      min: 0,
      max: function (value) {
        return value.max + 2
      }
    },
    xAxis: {
      type: 'category',
      data: date
    },
    series
  }
  return option
}
