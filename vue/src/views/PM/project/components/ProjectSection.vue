<!--
* @description 运营标段
* @author yc
!-->
<template>
    <div>
        <TableComponent
            v-bind="tableData"
            :page-index.sync="searchParam.pageIndex"
            :page-size.sync="searchParam.pageSize"
            empty-hide-table
        />
        <SelectDialog
            v-if="selectDialog.visible"
            v-bind="selectDialog"
            :visible.sync="selectDialog.visible"
        />
    </div>
</template>

<script>
    // API
    // 方法
    import { getNumberFormat, getPriceFormat } from '@/utils'
    // 组件
    import SelectDialog from '@/components/SelectDialog/index'

    export default {
        name: 'ProjectSection',
        components: {
            SelectDialog
        },
        props: {
            formData: { type: Object }
        },
        data() {
            return {
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'name',
                            label: '标段名称',
                            minWidth: 180,
                            isClick: true,
                            dialogType: 'sections'
                        },
                        {
                            prop: 'customerName',
                            label: '服务企业',
                            minWidth: 220
                        },
                        // {
                        //     prop: 'num',
                        //     label: '合同（份）',
                        //     width: 100,
                        //     isCopy: false,
                        //     isClick: true,
                        //     onClick: (row) => {
                        //         this.handleShowContract(row)
                        //     }
                        // },
                        {
                            prop: 'contractName',
                            label: '合同名称',
                            minWidth: 200,
                            isCopy: false,
                            isClick: true,
                            onClick: (row) => {
                                this.handleShowContract(row)
                            }
                        },
                        {
                            prop: 'peopleDevice',
                            label: '人员设备',
                            width: 80,
                            isCopy: false,
                            isClick: true,
                            onClick: (row) => {
                                this.handleShowPeopleDevice(row)
                            }
                        },
                        {
                            prop: 'vehicleDevice',
                            label: '车载设备',
                            width: 80,
                            isCopy: false,
                            isClick: true,
                            onClick: (row) => {
                                this.handleShowVehicleDevice(row)
                            }
                        },
                        {
                            type: 'money',
                            prop: 'amount',
                            label: '应收账款（元）',
                            width: 120
                        },
                        {
                            type: 'money',
                            prop: 'amountReceived',
                            label: '已收款（元）',
                            width: 100
                        },
                        {
                            prop: 'rate',
                            label: '收款进度',
                            width: 100,
                            formatter: (params, formData) => {
                                return (params[formData.prop] * 100) + '%'
                            }
                        },
                        {
                            prop: 'serviceDate',
                            label: '服务周期',
                            minWidth: 180
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: null,
                        maxHeight: null,
                        showSummary: true,
                        summaryMethod: this.getSummaries,
                        onePageHidePagination: true
                    }
                },
                searchParam: {
                    pageSize: 10,
                    pageIndex: 1
                },
                selectDialog: {
                    visible: false
                }
            }
        },
        computed: {
        },
        watch: {
            formData: {
                deep: true,
                immediate: true,
                handler(data) {
                    if (data) {
                        this.dataList = (data.sectionList || []).map(item => {
                            var { name, guidId, customerName, startDate, endDate, contractName, serviceDate, contractId } = item
                            var { num, amount, amountReceived } = item.message
                            return {
                                num,
                                name,
                                guidId,
                                startDate,
                                contractName,
                                serviceDate,
                                endDate,
                                customerName,
                                peopleDevice: item.message['人员智能终端设备'],
                                vehicleDevice: item.message['车载智能终端设备'],
                                // 人员智能终端设备,
                                // 车载智能终端设备,
                                amount,
                                amountReceived,
                                contractId,
                                rate: getNumberFormat(amountReceived / amount)
                            }
                        })
                        this.filterData()
                    }
                }
            },
            'searchParam.pageSize'() {
                this.filterData()
            },
            'searchParam.pageIndex'() {
                this.filterData()
            }
        },
        mounted() {
        },
        methods: {
            // 筛选数据
            filterData() {
                var pageSize = this.searchParam.pageSize
                var pageIndex = this.searchParam.pageIndex
                var list = this.dataList || []
                this.tableData.total = list.length
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
            },
            // 获取合计栏数据
            getSummaries({ columns, data }) {
                var sums = []
                var type1 = ['num', 'peopleDevice', 'vehicleDevice']
                var type2 = ['amount', 'amountReceived']
                var type3 = ['rate']
                columns.forEach((column, index) => {
                    var values = data.map(item => Number(item[column.property]))
                    if (index === 1) {
                        return (sums[index] = '合计：')
                    } else if (type1.concat(type2, type3).includes(column.property)) {
                        sums[index] = values.reduce((prev, curr) => {
                            var value = Number(curr)
                            if (!isNaN(value)) {
                                return prev + curr
                            } else {
                                return prev
                            }
                        }, 0)
                        if (type2.includes(column.property)) {
                            sums[index] = getPriceFormat(sums[index])
                        } else if (type3.includes(column.property)) {
                            sums[index] = getNumberFormat(sums[index] / values.length) * 100 + '%'
                        }
                    } else {
                        sums[index] = ''
                    }
                })

                return sums
            },
            // 查看合同列表
            handleShowContract(data) {
                this.selectDialog = {
                    type: 'salesContract',
                    title: '查看合同',
                    visible: true,
                    onlyShow: true,
                    extendParams: {
                        sectionId: data.guidId,
                        approvalStatus: 3,
                        lockedProps: ['sectionId']
                    }
                }
            },
            // 查看人员设备列表
            handleShowPeopleDevice(data) {
                this.selectDialog = {
                    type: 'device',
                    title: '查看人员设备',
                    visible: true,
                    onlyShow: true,
                    extendParams: {
                        sectionId: data.guidId,
                        productType: '288F8C2D-9CEB-46FC-87C9-DC4C16108162',
                        productCategory: 'B16C3151-11D2-4364-8F45-63EFFFFCF424',
                        warehousesId: 'bc5fe3a9-5b92-4aad-b7fe-acc62dcc82de',
                        outContractId: data.contractId,
                        typeId: this.getWarehousesSpaceType(0, '在运营'),
                        lockedProps: ['productType', 'sectionId']
                    }
                }
            },
            // 查看车载设备列表
            handleShowVehicleDevice(data) {
                this.selectDialog = {
                    type: 'device',
                    title: '查看车载设备',
                    visible: true,
                    onlyShow: true,
                    extendParams: {
                        sectionId: data.guidId,
                        productType: '95E968C3-D1BE-4A6C-93A8-6AF62558B909',
                        productCategory: 'B16C3151-11D2-4364-8F45-63EFFFFCF424',
                        warehousesId: 'bc5fe3a9-5b92-4aad-b7fe-acc62dcc82de',
                        outContractId: data.contractId,
                        typeId: this.getWarehousesSpaceType(0, '在运营'),
                        lockedProps: ['productType', 'sectionId']
                    }
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
