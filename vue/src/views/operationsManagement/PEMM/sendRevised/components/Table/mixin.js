
export default {
    props: {
        isEdit: { type: Boolean, default: false },
        isCreate: { type: Boolean, default: false },
        formData: { type: Object, default: () => ({}) }
    },
    data() {
        return {
            deviceList: [],
            publicParam: {
                pageSize: 10,
                pageIndex: 1
            },
            messageDialog: {
                visible: false
            }
        }
    },
    computed: {
    },
    watch: {
        'publicParam.pageSize'() {
            this.filterData()
        },
        'publicParam.pageIndex'() {
            this.filterData()
        }
    },
    mounted() {
        this.parent = null
        this.$emit('ready', this)
    },
    methods: {
        // 验证表单
        validate() {
            return new Promise(async(resolve, reject) => {
                var list = this.deviceList
                if (list.length) {
                    if (typeof this.extraValidate === 'function') {
                        try {
                            await this.extraValidate()
                        } catch (e) {}
                    }
                    // 当存在多页的时候，需要验证每一页
                    var pageTotal = Math.ceil(this.tableData.total / this.publicParam.pageSize)
                    var recursion = (pageIndex) => {
                        this.publicParam.pageIndex = pageIndex
                        this.$nextTick(() => {
                            this.$refs.TableComponent.validate().then(() => {
                                if (++pageIndex <= pageTotal) {
                                    recursion(pageIndex)
                                } else {
                                    resolve(list)
                                }
                            }).catch(reject)
                        })
                    }
                    recursion(1)
                } else {
                    this.$message.warning('故障设备列表不能为空！')
                    reject()
                }
            })
        },
        // 筛选数据
        filterData() {
            var pageSize = this.publicParam.pageSize
            var pageIndex = this.publicParam.pageIndex
            var list = this.deviceList || []
            this.tableData.total = list.length
            this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
        }
    }
}
