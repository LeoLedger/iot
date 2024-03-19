
export default {
    name: 'Approval',
    props: {
        dataId: { type: String },
        rowData: { type: Object },
        visible: { type: Boolean, default: false },
        onlyShow: { type: Boolean, default: true }
    },
    data() {
        return {
            baseData: {},
            jsonData: void 0,
            processIndex: 0
        }
    },
    computed: {
        extendParams() {
            var data = { ...this.rowData, ...this.baseData }
            if (data) {
                return {
                    canHandle: data.canHandle,
                    approvalId: data.guidId,
                    approvalType: this.approvalType,
                    wfInstId: data.wfInstId,
                    wfActivityInstId: data.wfActivityInstId,
                    jsonData: JSON.stringify(this.jsonData)
                }
            }
            return {}
        }
    },
    methods: {
        // 基础数据更新时触发
        handleBaseUpdate(data) {
            data = { ...data }
            delete data.canHandle
            this.baseData = data
        },
        // 审批流程提交前触发
        handleBeforeSubmit() {
            return true
        },
        // 流程列表更新时触发
        handleProcessUpdate(list) {
            this.processIndex = Number(list.slice(-1)[0].definitionCode)
        }
    }
}
