
import { mapGetters } from 'vuex'
import workFlowApi from '@/api/workFlow'
// 组件
import InputDialog from './InputDialog'

export default {
    components: {
        InputDialog
    },
    props: {
        isEdit: { type: Boolean, default: false },
        canHandle: { type: Boolean, default: false }
    },
    data() {
        return {
            inputDialog: {
                visible: false
            },
            publicParam: {
                canHandle: this.canHandle ? true : null,
                approvalStatus: this.canHandle ? 0 : null,
                pageSize: 15,
                pageIndex: 1
            },
            searchParam: {},
            // 列操作按钮
            tableOperates: {
                width: 55,
                fixed: 'right',
                show: this.isEdit
            },
            activeRowId: null,
            activeRowData: null,
            updateDialogVisible: false,
            approvalDialogVisible: false
        }
    },
    computed: {
        ...mapGetters(['userInfo'])
    },
    watch: {
    },
    created() {
        this.searchParam = {
            ...this.publicParam,
            ...this.searchParam
        }
        this.$watch('searchParam.pageSize', () => {
            this.getList()
        })
        this.$watch('searchParam.pageIndex', () => {
            this.getList()
        })
    },
    mounted() {
        this.getList()
    },
    methods: {
        hasSelf(data) {
            return this.userInfo.name === 'admin' || this.userInfo.userId === data.applyUserId
        },
        // 请求列表数据
        async getList() {
            this.tableData.options.loading = true
            var res = await this.requestApi.getList({
                ...this.publicParam,
                ...this.searchParam
            })
            if (res.success) {
                this.tableData.list = this.dataFilter(res.data.records)
                this.tableData.total = res.data.total
            }
            this.tableData.options.loading = false
        },
        // 数据过滤
        dataFilter(dataList) {
            return dataList
        },
        // 撤回单据
        async queryWithdraw(value) {
            try {
                var { guidId, wfActivityInstId } = this.activeRowData
                var res = await workFlowApi.withdraw({
                    content: value,
                    approvalId: guidId,
                    approvalType: this.approvalType,
                    wfActivityInstId
                })
                this.$notify({
                    title: '撤回成功',
                    message: res.msg,
                    type: 'success',
                    duration: 2000
                })
                this.getList()
                this.getCanApprovalCount()
            } catch (e) {
                console.log(e)
            }
            this.inputDialog.loading = false
            this.inputDialog.visible = false
        },
        // 筛选列表
        handleFilter() {
            if (this.publicParam.pageIndex !== 1) {
                this.publicParam.pageIndex = 1
            } else {
                this.getList()
            }
        },
        // 点击删除按钮时触发
        async handleDelete(data) {
            await this.$confirm('此操作将删除此单据信息, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                center: true
            })
            this.tableData.options.loading = true
            try {
                var res = await this.requestApi.delete(data[this.deleteIdKey || 'id'])
                if (res.success) {
                    await this.getList()
                    this.getCanApprovalCount()
                    this.$notify({
                        title: '成功',
                        message: '删除成功',
                        type: 'success',
                        duration: 2000
                    })
                }
            } catch (e) {}
            this.tableData.options.loading = false
        },
        // 点击新增or编辑按钮时触发
        handleUpdate(data = {}) {
            this.activeRowId = data[this.guidIdKey || 'guidId']
            this.updateDialogVisible = true
        },
        // 点击导出按钮时触发
        handleExport() {
            var data = { ...this.publicParam, ...this.searchParam }
            data.pageSize = this.tableData.total
            this.requestApi.export(data)
        },
        // 点击审批按钮时触发
        handleApproval(data) {
            this.activeRowId = data[this.guidIdKey || 'guidId']
            this.activeRowData = data
            this.approvalDialogVisible = true
        },
        // 点击撤回按钮时触发
        handleWithdraw(data) {
            this.inputDialog = {
                title: '撤回单据',
                visible: true,
                loading: false,
                buttonText: '确定撤回',
                placeholder: '请填写撤回原因'
            }
            this.inputDialogCallback = this.queryWithdraw
            this.activeRowData = data
        },
        // 点击排序时触发
        handleRefreshList(obj) {
            this.searchParam = Object.assign({}, this.searchParam, obj)
            this.getList()
        },
        // 点击弹窗确定按钮时触发
        handleInputDialogConfirm(value) {
            if (!value) {
                return this.$message.warning(this.inputDialog.placeholder)
            }
            this.inputDialog.loading = true
            this.inputDialogCallback && this.inputDialogCallback(value)
        }
    }
}
