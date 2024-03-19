<!--
* @description 占比圆环 ProportionRing
* @author JQB
!-->
<template>
  <div :id="id" class="proportionRing" />
</template>

<script>
import echarts from 'echarts'
import { vwToPx } from '@/utils'

export default {
    name: 'ProportionRing',
    props: {
        // id 必须唯一
        id: {
            type: String,
            default: 'proportionRing_' + (+new Date())
        },
        data: {
            type: Array,
            default: () => [] // 相关data 配置可参考 echarts pie 类型的 data
        }
    },
    data() {
        return {
        }
    },
    watch: {
        data: {
            immediate: true,
            handler(val) {
                this.setCircleChart()
            }
        }
    },
    created() {
    },
    mounted() {
        const chartDiv = document.getElementById(this.id)
        this.chart = echarts.init(chartDiv)
        this.chart.showLoading({
            text: '加载中',
            textColor: '#409EFF',
            color: '#fff',
            maskColor: 'rgba(0,0,0,0.3)'
        })
    },
    methods: {
        setCircleChart() {
            // 渐变色
            /* const linear_color = new echarts.graphic.LinearGradient(
                0, 0, 1, 1,
                [{
                    offset: 0,
                    color: '#3577e5'
                }, {
                    offset: 1,
                    color: '#25f4e5'
                }])*/
            const data = this.data
            // console.error(this.data, 'Data')
            const option = {
                tooltip: {
                    trigger: 'item',
                    // formatter: '{a} <br/>{b}: {c} ({d}%)'
                    formatter: '{b0}: {c0}'
                },
                legend: {
                    orient: 'horizontal',
                    bottom: 0,
                    padding: [5, 10],
                    data: data.map(v => v.name) // ['通过', '不通过', '未响应']
                },
                label: { color: '#333' },
                series: [
                    {
                        name: '访问来源',
                        type: 'pie',
                        radius: ['40%', '60%'],
                        // startAngle: 90, // 设置旋转角度
                        labelLine: {
                            smooth: true,
                            length: 20,
                            length2: 30
                        },
                        label: {
                            formatter: '{d}% ' // ,
                            // backgroundColor: '#eee',
                            // borderColor: '#aaa',
                            // borderWidth: 1,
                            // borderRadius: 4,
                            // shadowBlur:3,
                            // shadowOffsetX: 2,
                            // shadowOffsetY: 2,
                            // shadowColor: '#999',
                            // padding: [0, 7],
                            /* rich: {
                                a: {
                                    color: '#999',
                                    lineHeight: 22,
                                    align: 'center'
                                },
                                // abg: {
                                //     backgroundColor: '#333',
                                //     width: '100%',
                                //     align: 'right',
                                //     height: 22,
                                //     borderRadius: [4, 4, 0, 0]
                                // },
                                hr: {
                                    borderColor: '#aaa',
                                    width: '100%',
                                    borderWidth: 0.5,
                                    height: 0
                                },
                                b: {
                                    fontSize: 16,
                                    lineHeight: 33
                                },
                                per: {
                                    color: '#eee',
                                    backgroundColor: '#334455',
                                    padding: [2, 4],
                                    borderRadius: 2
                                }
                            }*/
                        },
                        hoverAnimation: false,
                        tooltip: {
                            formatter: '{b0}: {c0}'
                        },
                        data: data
                    }
                ]
            }
            this.$nextTick(() => {
                this.chart.resize()
                this.chart.hideLoading()
                this.chart.setOption(option, true)
            })
        }
    }
}
</script>

<style lang='scss' scoped>
.proportionRing {
  width: 100%;
  height: 400px;
  margin: 0 auto;
}
</style>
