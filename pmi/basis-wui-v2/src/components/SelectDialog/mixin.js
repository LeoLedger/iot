
import types from '@/components/SelectDialog/types'

const isTest = ['development', 'staging'].includes(process.env.VUE_APP_ENV)

export default {
    props: {
        value: { type: null, default: '' },
        height: { type: String, default: '626px' },
        // 是否只用于展示
        onlyShow: { type: Boolean, default: false },
        // 展示的数据
        dataList: { type: Array },
        // 最大选择文本
        maxCount: { type: Number, default: Infinity },
        // 超出数量时的提示信息文本
        overageMessage: { type: String },
        multiple: { type: Boolean, default: false },
        excludes: { type: Array, default: () => [] },
        extendParams: { type: Object, default: () => ({}) },
        // 自定义请求函数
        customRequest: { type: Function }
    },
    data() {
        this.type = this.$options._componentTag[0].toLocaleLowerCase() + this.$options._componentTag.substring(1)
        return {
            publicParam: {
                pageSize: 15,
                pageIndex: 1
            },
            tableOptions: {
                height: this.height,
                stripe: true, // 是否为斑马纹 table
                loading: false, // 是否添加表格loading加载动画
                showIndex: true, // 是否展示 列表序列号
                curRowKey: types[this.type].dataKey,
                mutiSelect: !this.onlyShow && this.multiple,
                mutiSelectedKey: types[this.type].dataKey,
                mutiSelectedLabel: types[this.type].labelKey,
                selectable: row => row._selectable,
                showSingleSelectCheckBox: !this.onlyShow
                // showMutiSelectList: !this.onlyShow && this.multiple
            },
            selectList: []
        }
    },
    watch: {
        value: {
            immediate: true,
            handler(value) {
                if (value) {
                    if (Array.isArray(value)) {
                        this.selectList = value
                    } else {
                        this.selectList = [value]
                    }
                } else {
                    this.selectList = []
                }
            }
        },
        extendParams: {
            deep: true,
            handler() {
                this.updateParams()
            }
        },
        'publicParam.pageSize'(n, o) {
            this.filterData()
        },
        'publicParam.pageIndex'(n, o) {
            this.filterData()
        }
    },
    computed: {
    },
    mounted() {
        this.initial = true
        this.updateParams()
    },
    methods: {
        // 筛选数据
        async filterData() {
            if (this.onlyShow && this.dataList) {
                var list = this.filterMethod ? this.dataList.filter(this.filterMethod) : this.dataList
                var pageSize = this.publicParam.pageSize
                var pageIndex = this.publicParam.pageIndex
                this.tableData.list = list.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
                this.tableData.total = list.length
                this.handleListUpdate && this.handleListUpdate()
            } else {
                await this.getList()
                if (isTest && this.initial) {
                    this.initial = false
                    // 如果当前模式为多选，且设置了最大选择数量，则弹出确认框询问是否自动选中最大选择数量的数据
                    if (
                        this.tableOptions.mutiSelect &&
                        this.maxCount !== Infinity &&
                        this.maxCount > 0 &&
                        this.selectList.length !== this.maxCount &&
                        this.quickSelected &&
                        this.tableData.total
                    ) {
                        this.$confirm((
                            <span>是否一键选中 <span style='color: #409eff'>{Math.min(this.maxCount, this.tableData.total)}</span> 项?</span>
                        ), '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning',
                            center: true
                        }).then(() => {
                            this.quickSelected()
                        })
                    }
                }
            }
        },
        // 更新参数
        updateParams() {
            var isRequest = true
            var notRequestProps = ['pageSize', 'pageIndex']
            var publicParam = { ...this.defaultParam }
            var extendParams = this.extendParams
            Object.keys(extendParams).forEach(key => {
                // 因为分页参数改变时会重新请求数据，当extendParams也传入时，会导致页面初始化时请求两遍接口
                // 所以这里判断extendParams是否传入分页参数，且跟默认的分页参数不一样，才请求接口
                if (notRequestProps.includes(key) && extendParams[key] !== this.publicParam[key]) {
                    isRequest = false
                }
                // 传递的函数不赋值给publicParam
                if (!['function'].includes(typeof extendParams[key]) && !['lockedProps'].includes(key)) {
                    publicParam[key] = extendParams[key]
                }
            })
            if (extendParams && extendParams.extendColumns) {
                if (Array.isArray(extendParams.extendColumns)) {
                    if (extendParams.extendColumns.length > 0) {
                        const newColumns = this.tableData.columns.concat(extendParams.extendColumns)
                        this.$set(this.tableData, 'columns', newColumns)
                    }
                }
            }
            if (this.type === 'company') {
                publicParam.type = publicParam.type === void 0 ? 0 : publicParam.type
            }
            this.publicParam = publicParam
            if (isRequest) {
                this.handleFilter()
            }
        },
        // 根据value更新选中状态
        updateSelect() {
            this.$nextTick(() => {
                var key = this.tableOptions.mutiSelectedKey
                this.tableData.list.forEach((item) => {
                    this.$set(item, '_selectable', !this.excludes.includes(item[key]))
                })
            })
        },
        // 筛选列表
        handleFilter() {
            if (this.publicParam.pageIndex !== 1) {
                this.publicParam.pageIndex = 1
            } else {
                this.filterData()
            }
        },
        // 点击确定按钮时触发
        handleChange() {
            this.$emit('change', this.selectList)
        },
        // 点击排序时触发
        handleRefreshList(obj) {
            this.publicParam = { ...this.publicParam, ...obj }
            this.filterData()
        },
        // 点击表格行时触发
        handleCurrentChange(row) {
            if (!this.multiple) {
                this.selectList = [row]
                this.handleChange()
            }
        },
        // 多选-选中表格行时触发
        handleSelectionChange(val) {
            var count = val.length
            if (count > this.maxCount) {
                this.selectList = val.slice(0, this.maxCount)
                this.tableData.list = [...this.tableData.list]
                this.$message.warning(this.overageMessage || `最大可选择数量"${this.maxCount}"，已选择"${count}"，请取消选择部分数据后再试！`)
            } else {
                this.selectList = val
                this.handleChange()
            }
        },
        // 点击不能选中的表格行时触发
        handleNotSelectedClick() {
            if (typeof this.extendParams.notSelectClick === 'function') {
                this.extendParams.notSelectClick()
            } else {
                this.$message.warning(this.notSelectMessage || '该项不能被选择或已被添加!')
            }
        }
    }
}
