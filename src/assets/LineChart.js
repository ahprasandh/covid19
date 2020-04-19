import { Line } from 'vue-chartjs'

export default {
  extends: Line,
  props: {
    color: {
      default: "#979797"
    },
    data: {
    },
    labels: {},
    cumulate: {
      default: true
    },
    id: {}
  },
  methods: {
    cumulativeSum: (sum => value => sum += value)(0),
    start() {
      var set = this.cumulate ? this.data.map((s => v =>{return s += v})(0)) : this.data
      var chartdata = {
        datasets: [{
          label: null,
          data: set,
          borderColor: this.color,
          fill: false,
          borderWidth: 1,
          pointRadius: 1
        }],
        labels: set
      }
      var options = {
        legend: {
          display: false
        },
        scales: {
          display: false,
          yAxes: [{
            display: false,
            ticks: {
              beginAtZero: true
            },
          }],
          xAxes: [{
            display: false,
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
      this.renderChart(chartdata, options)
    }
  },
  mounted() {
    this.start()
  },
  watch: {
    data() {
      this.start()
    }
  }
}