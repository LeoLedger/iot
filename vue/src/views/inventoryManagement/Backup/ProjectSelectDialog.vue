<!--
* @fileName 选择备用项目 窗口
* @author   望浩然
* @date     2021/4/17
-->
<template>
    <el-dialog
        :visible.sync="visible"
        :before-close="handleCancel"
        :close-on-click-modal="false"
        title="选择备用项目"
        class=""
        width="1000px"
        append-to-body>
        <layout-filter
            :table-columns.sync="tableData.columns"
            :filter-model.sync="searchParam"
            @search="handleSearch"
        >
            <template slot="filter">
                <el-input
                    v-model="searchParam.projectName"
                    size="mini"
                    placeholder="项目名称"
                    clearable
                    class="filter-item"
                    @change="handleSearch"
                />
            </template>
            <template slot="table">
                <TableComponent
                    ref="TableComponent"
                    v-bind="tableData"
                    :options="tableData.options"
                    :selected-list="[ selectRow ]"
                    :page-index.sync="searchParam.pageIndex"
                    :page-size.sync="searchParam.pageSize"
                    @handleSingleSelectChange="handleSelectionChange"
                />
            </template>
        </layout-filter>
        <span slot="footer">
            <el-button size="mini" @click="handleCancel">取 消</el-button>
            <el-button v-prereclick :disabled="!selectRow" :loading="loading" size="mini" type="primary" @click="handleSubmit">确定分配</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import projectApi from '@/api/PM/project'
    import moment from 'moment'
    import deviceApi from '@/api/inventory/device'
    import enums from '@/utils/enum'
    export default {
        name: 'ProjectSelectDialog',
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            deviceList: {
                type: Array,
                default: () => []
            }
        },
        data() {
            const that = this
            return {
                loading: false,
                tableData: {
                    list: [],
                    total: 0,
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'code',
                            label: '项目编号',
                            width: 150
                        },
                        {
                            prop: 'projectName',
                            label: '项目名称',
                            isClick: true,
                            dialogType: 'project',
                            idKey: 'guidId',
                            minWidth: 200
                        },
                        {
                            prop: 'status',
                            label: '状态',
                            width: 100,
                            align: 'center',
                            type: 'status',
                            enums: enums.projectStatus
                        },
                        {
                            prop: 'businessType',
                            label: '业务类型',
                            formatter: (params, formData) => {
                                return (that.getDict('businessType').find(v => v.value === params[formData.prop]) || {}).label || '- -'
                            }
                        },
                        {
                            prop: 'areaName',
                            label: '所属区域',
                            width: 200
                        },
                        {
                            prop: 'customerName',
                            label: '源客户',
                            width: 200
                        },
                        {
                            prop: 'projectManagerUserName',
                            label: '项目经理'
                        },
                        {
                            prop: '_period',
                            label: '项目周期',
                            width: 200
                        }
                    ],
                    options: {
                        height: '500px',
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        showSingleSelectCheckBox: true,
                        rowIndex: 'guid'
                    },
                    // 列操作按钮
                    operates: {
                        show: false
                    }
                },
                searchParam: {
                    pageSize: 15,
                    pageIndex: 1,
                    status: 1
                },
                selectRow: null
            }
        },
        watch: {
            'searchParam.pageSize'() {
                this.getList()
            },
            'searchParam.pageIndex'() {
                this.getList()
            }
        },
        mounted() {
            this.getList()
        },
        methods: {
            // 请求列表数据
            async getList() {
                this.tableData.options.loading = true
                var res = await projectApi.getList(this.searchParam)
                if (res.success) {
                    this.tableData.list = res.data.records.map(item => {
                        item._period = `${moment(item.startDate).format('YYYY-MM-DD')} 至 ${moment(item.endDate).format('YYYY-MM-DD')}`
                        return item
                    })
                    this.tableData.total = res.data.total
                }
                this.tableData.options.loading = false
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
            handleCancel() {
                this.selectRow = null
                this.$emit('close', false)
                this.$emit('update:visible')
            },
            handleSubmit() {
                if (this.selectRow) {
                    this.loading = true
                    // 调用接口实现设备绑定到项目
                    const deviceList = this.deviceList
                    // 为设备添加备用项目参数
                    deviceList.map(item => {
                        item.standbyProjectName = this.selectRow.projectName
                        item.standbyProjectId = this.selectRow.guidId
                    })
                    // 调用分配接口
                    deviceApi.distributionToProject(deviceList).then(res => {
                        if (res.success) {
                            this.$message({ type: 'success', message: '分配成功' })
                            this.$emit('confirm')
                            this.$emit('close', false)
                        }
                    })
                }
            },
            handleSelectionChange(row) {
                this.selectRow = row
            }
        }
    }
</script>

<style scoped lang="scss">
/deep/ .status-text {
  display: flex;
  align-items: center;
  justify-content: center;
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
  }
  &[data-type = '0'] {
    &::before {
      background: rgb(230,90,107);
    }
    &::after {
      content: '已关闭';
    }
  }
  &[data-type = '1'] {
    &::before {
      background: rgb(58,194,112);
    }
    &::after {
      content: '正常';
    }
  }
}
</style>
