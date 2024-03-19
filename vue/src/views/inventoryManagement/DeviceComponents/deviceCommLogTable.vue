<!--
* @description 设备通信记录列表
* @fileName deviceCommLogTable.vue
* @author 望浩然
-->
<template>
    <div class="deviceCommLog-container">
        <layout-filter
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            @search="handleSearch"
        >
            <template slot="button">
                <el-button
                    v-waves
                    v-prereclick
                    type="warning"
                    size="mini"
                    class="filter-item"
                    icon="el-icon-download"
                    @click="handleExport"
                >导出</el-button>
            </template>
            <template slot="filter">
                <el-date-picker
                    v-model="searchParam.date"
                    :default-time="['00:00:00', '23:59:59']"
                    type="daterange"
                    format="yyyy-MM-dd"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                />
                <el-select v-model="apiType" @change="handleSearch">
                    <el-option :value="1" label="通信状态记录"/>
                    <el-option :value="2" label="GPS轨迹（2天）"/>
                    <el-option :value="3" label="GPS轨迹（历史）"/>
                </el-select>
            </template>
            <template slot="table">
                <TableComponent
                    v-bind="tableData"
                    :cur_row="currentRow"
                    :page-index.sync="searchParam.pageIndex"
                    :page-size.sync="searchParam.pageSize"
                    @refreshList="handleSearch"
                />
            </template>
        </layout-filter>
    </div>
</template>

<script>
    import deviceApi from '@/api/inventory/device'
    import moment from 'moment'
    const gpsColumns = [
        {
            prop: 'cGpsDate',
            label: '操作时间',
            minWidth: 120,
            type: 'date',
            format: 'YYYY-MM-DD HH:mm:ss'
        },
        {
            prop: 'cUpType',
            label: '上传方式',
            width: 100,
            type: 'dict',
            dictType: 'deviceUpType'
        },
        // {
        //     prop: 'cIsInSection',
        //     label: '是否在标段范围内',
        //     width: 100,
        //     type: 'dict',
        //     dictType: 'deviceIsInSection'
        // },
        // {
        //     prop: 'cIsInSectionAreaLineStr',
        //     label: '是否在片区范围内',
        //     width: 100,
        //     type: 'dict',
        //     dictType: 'deviceIsInSection'
        // },
        {
            prop: 'cLat',
            label: '纬度',
            width: 150
        },
        {
            prop: 'cLong',
            label: '经度',
            width: 150
        },
        {
            prop: 'cSpeedHkm',
            label: '速度(km/h)',
            width: 100
        }
    ]
    const commColumns = [
        {
            prop: 'cDbCreateDate',
            label: '操作时间',
            minWidth: 150,
            type: 'date',
            format: 'YYYY-MM-DD HH:mm:ss'
        },
        {
            prop: 'cChargeState',
            label: '充电状态',
            width: 100,
            type: 'dict',
            dictType: 'deviceChargeState'
        },
        {
            prop: 'cGpsState',
            label: 'GPS状态',
            width: 120,
            type: 'dict',
            dictType: 'deviceGpsState'
        },
        {
            prop: '_cGsmLevel',
            label: 'GSM信号等级',
            width: 120
        },
        {
            prop: 'cVoltageLevel',
            label: '电量',
            width: 120
        },
        {
            prop: 'cWarningExtInfo',
            label: '告警扩展',
            width: 120,
            type: 'dict',
            dictType: 'deviceWarnExt'
        },
        {
            prop: 'cWarningState',
            label: '报警状态',
            width: 120,
            type: 'dict',
            dictType: 'deviceWarnState'
        },
        {
            prop: 'cwarningExtInfoChild0',
            label: '运动状态',
            type: 'dict',
            dictType: 'deviceWarnExtInfoChild'
        }
    ]
    export default {
        props: {
            // 设备imei
            dataId: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                groupData: null,
                currentRow: null,
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [],
                    options: {
                        height: '100%',
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true // 是否展示 列表序列号
                    },
                    // 列操作按钮
                    operates: {
                        width: 120,
                        fixed: 'right'
                    }
                },
                apiType: 1,
                searchParam: {
                    pageIndex: 1,
                    pageSize: 100,
                    date: []
                }
            }
        },
        watch: {
            dataId() {
                this.init()
            },
            'searchParam.pageSize'() {
                this.getList()
            },
            'searchParam.pageIndex'() {
                this.getList()
            }
        },
        mounted() {
            this.init()
        },
        methods: {
            /** 初始化 */
            init() {
                const defaultStart = moment(new Date()).format('yyyy-MM-DD') + ' 00:00:00'
                const defaultEnd = moment(new Date()).format('yyyy-MM-DD') + ' 23:59:59'
                this.searchParam.date = [defaultStart, defaultEnd]
                this.getList()
            },
            /** 加载数据 */
            // 获取列表数据
            async getList() {
                if (this.dataId) {
                    this.tableData.options.loading = true
                    const params = { ...this.searchParam }
                    let api, columns
                    switch (this.apiType) {
                    case 1:
                        api = deviceApi.getCommunication
                        columns = commColumns
                        break
                    case 2:
                        api = deviceApi.getGps
                        columns = gpsColumns
                        break
                    case 3:
                        api = deviceApi.getGpsHistory
                        columns = gpsColumns
                        break
                    }
                    this.tableData.columns = columns
                    params.startDate = params.date[0]
                    params.endDate = params.date[1]
                    params.date = undefined
                    params.imei = this.dataId
                    const res = await api(params)
                    if (res.success && res.data) {
                        res.data.records.map(item => {
                            if (item.cGsmLevel !== undefined) {
                                item._cGsmLevel = this.getGsmLevelDesc(item.cGsmLevel)
                            }
                        })
                        this.tableData.list = res.data.records
                        this.tableData.total = res.data.total
                    }
                    this.tableData.options.loading = false
                }
            },
            /** 事件处理 */
            // 搜索
            handleSearch(obj) {
                if (typeof obj === 'object') {
                    this.searchParam = Object.assign({}, this.searchParam, obj)
                    this.getList()
                } else {
                    if (this.searchParam.pageIndex !== 1) {
                        this.searchParam.pageIndex = 1
                    } else {
                        this.getList()
                    }
                }
            },
            // 导出
            handleExport() {
                const api = this.apiType === 1 ? deviceApi.exportCommunication : deviceApi.exportGps
                const data = { ...this.searchParam }
                data.imei = this.dataId
                data.pageSize = this.tableData.total
                api(data)
            },
            getGsmLevelDesc(val) {
                if (val < 20) {
                    return '不稳定'
                } else if (val >= 20 && val < 40) {
                    return '较差'
                } else if (val >= 40 && val < 60) {
                    return '正常'
                } else if (val >= 60 && val < 80) {
                    return '较强'
                } else if (val >= 80) {
                    return '非常强'
                }
            }
        }
    }
</script>

<style lang='scss'>
.deviceCommLog-container {
  height: 100%;
  /* 可点击的文字样式 */
  .layout-container {
    padding: 0;
    background: white;
  }
}
</style>
