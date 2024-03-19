<template>
    <div :style="{height: height}" class="table">
        <template v-if="list.length || !emptyHideTable">
            <div class="body-wrap">
                <div
                    v-if="!updatedColumns"
                    v-loading="true"
                    :style="`border: 1px solid #e4e4e4; height:100%`"
                    class="tableTemplate"
                    element-loading-text="列表项更新中..."
                    element-loading-background="rgba(0, 0, 0, 0.1)"
                />
                <el-table
                    v-if="updatedColumns"
                    ref="mutipleTable"
                    v-loading="computedOptions.loading"
                    :data="list"
                    v-bind="computedOptions"
                    :row-class-name="tableRowClassName"
                    :default-sort="computedOptions.defaultSort"
                    :max-height="computedOptions.maxHeight"
                    :height="computedOptions.height"
                    width="100%"
                    element-loading-text="加载中..."
                    element-loading-background="rgba(0, 0, 0, 0.1)"
                    @sort-change="tableSortChange"
                    @row-click="handleCurrentChange"
                    @selection-change="handleSelectionChange"
                    @expand-change="(row, expandedRows, expanded) => $emit('expand-change', row, expandedRows, expanded)"
                >
                    <!-- element-loading-spinner="el-icon-loading" -->
                    <el-table-column
                        v-if="!computedOptions.mutiSelect && computedOptions.showSingleSelectCheckBox"
                        prop="_select"
                        label=""
                        fixed="left"
                        width="40"
                        header-align="center"
                        align="center"
                    >
                        <template slot-scope="scope">
                            <el-radio
                                :value="singleSelectIndex"
                                :label="scope.$index"
                                :disabled="scope.row._selectable === false"
                                class="single-select-radio"
                                @change="singleSelectChange(scope.$index)"
                            >
                                <span style="display: none;" />
                            </el-radio>
                        </template>
                    </el-table-column>
                    <el-table-column
                        v-if="computedOptions.mutiSelect"
                        :selectable="computedOptions.selectable"
                        :resizable="false"
                        type="selection"
                        style="width: 55px;"
                        fixed="left"
                        align="center"
                    />
                    <el-table-column
                        v-if="computedOptions.showIndex"
                        :label="computedOptions.indexLabel || '序号'"
                        :resizable="false"
                        :index="generateIndex"
                        type="index"
                        width="50"
                        fixed="left"
                        align="left"
                    />
                    <!--数据列-->
                    <!-- label: '可配置', children:[] -->
                    <!-- 当设置visible为false时，不显示该列 -->
                    <template v-for="(column, index) in columns">
                        <ColumnItem
                            v-if="column.visible !== false"
                            :key="index"
                            :index="index"
                            :column="column"
                            :computed-options="computedOptions"
                        />
                    </template>
                    <!--按钮操作组-->
                    <el-table-column
                        v-if="operates.show"
                        :width="operates.width"
                        :resizable="false"
                        :fixed="operates.fixed"
                        :align="operates.align || 'center'"
                        label="操作"
                    >
                        <!-- 使用 <Test slot="操作" slot-scope="{$index, row}" />  -->
                        <slot slot-scope="scope" v-bind="scope" name="操作" />
                    </el-table-column>
                </el-table>
            </div>
            <div class="foot-wrap">
                <!--分页-->
                <div v-if="total > 0 && computedOptions.showPagination" :style="{ textAlign: paginationPosition }" class="pagination">
                    <el-pagination
                        :current-page="pageIndex"
                        :page-size="pageSize"
                        :limit.sync="pageSize"
                        :page-sizes="pageSizes"
                        :total="total"
                        :layout="paginationLayout"
                        background
                        @size-change="handleSizeChange"
                        @current-change="handleIndexChange"
                    />
                </div>
                <!-- 如果存在 定位在右边栏 的表格操作 -->
                <div
                    v-show="computedOptions.action"
                    class="table-action fix-right"
                    @click="showActionHandle"
                >
                    <span>表格操作</span>
                </div>
                <!-- 判断是展示相关选中的项列表 -->
                <template v-if="computedOptions.showMutiSelectList">
                    <!-- <div v-show="mutiSelectListLength">已选择{{ mutiSelectListLength }}</div> -->
                    <div v-show="selectedList.length">
                        已选择{{ selectedList.length }}
                    </div>
                    <div class="selectsWrap">
                        <!-- 被多选中的列表 -->
                        <slot :storageArr="storageArr" :curPageSelect="curPageSelect" :selectListRemove="selectListRemove" name="mutiSelectList">
                            <el-tag
                                v-for="(row, key) in selectedList"
                                :key="key"
                                disable-transitions
                                closable
                                class="tag"
                                @close="selectListRemove(row)"
                            >
                                {{ row[computedOptions.mutiSelectedLabel] }}
                            </el-tag>
                        </slot>
                    </div>
                </template>
            </div>
        </template>
    </div>
</template>
<script type="text/jsx">
    const isEmpty = function(value) {
        return ['', null, void 0].includes(value)
    }

    const ExpandDom = {
        functional: true,
        props: {
            row: Object,
            render: Function,
            index: Number,
            column: {
                type: Object,
                default: null
            }
        },
        render: (h, ctx) => {
            const params = {
                row: ctx.props.row,
                index: ctx.props.index
            }
            if (ctx.props.column) params.column = ctx.props.column
            return ctx.props.render(h, params)
        }
    }
    const ColumnItem = {
        functional: true, // render 为其增加 context
        name: 'ColumnItem',
        components: { ExpandDom },
        render(h, context) {
            const props = context.props || {}
            const { column, computedOptions, index } = props
            const { children = [] } = column || {}
            // template 写法
            /* <el-table-column>
                    <template scope-slot="props">
                        <el-button
                            type="primary"
                            size="mini"
                            @click="openDialog('edit',props.row)"
                            >编辑</el-button>
                    </template>
                </el-table-column>*/
            // jsx 写法
            /* 插槽相关 */
            const renderScope = (scope, props) => {
                if (props.render) {
                    return (
                    <ExpandDom
                        column={props}
                        row={scope.row}
                        render={props.render}
                        index={index.index}
                    />
                    )
                }
                if (props.isClick && !isEmpty(scope.row[props.prop])) {
                    return (
                        <span
                            class='row-index'
                            onClick={() => {
                                props.onClick && props.onClick(scope.row, props)
                            }}
                        >
                            {isEmpty(scope.row[props.prop]) ? '- -' : scope.row[props.prop]}
                        </span>
                    )
                }

                if (props.formatter) {
                    // return <span v-html="props.formatter(scope.row, column)" />
                    return (
                    <span
                        domPropsInnerHTML={props.formatter(
                            scope.row,
                            props,
                            column
                        )}
                    />
                    )
                }
                return (
                    <span title={scope.row[props.prop]} style={props.style}>
                        {(typeof scope.row[props.prop] !== 'number' &&
                            (scope.row[props.prop] || '- -')) ||
                            scope.row[props.prop]}
                    </span>
                )
            }
            /* 渲染ColumnItem */
            const renderColumn = column => {
                return (
                    <el-table-column
                        prop={column.prop}
                        type={column.type}
                        label={column.label}
                        align={column.align || 'left'}
                        width={column.width}
                        formatter={column.formatter}
                        minWidth={column.minWidth}
                        fixed={column.fixed}
                        sortable={column.sortable}
                        sortMethod={column.sortMethod}
                        resizable={computedOptions.resizable}
                        showOverflowTooltip={computedOptions.showOverflowTooltip}
                        {...{
                            scopedSlots: {
                                header: column.slotHeader
                                    ? scope => column.slotHeader(scope, column)
                                    : scope => (
                                        <span title={column.label}>
                                            {column.label}
                                        </span>
                                    ),
                                default: scope => renderScope(scope, column)
                            }
                        }}
                    />
                )
            }
            // 若存在子级children 遍历children column 配置 （目前仅支持一级）
            if (children.length) {
                const childNodes = children
                    .filter(item => {
                        // 筛选出可以显示的列
                        return item.visible !== false
                    })
                    .map(item => {
                        return renderColumn(item)
                    })
                return (
                <el-table-column label={column.label}>
                    {childNodes}
                </el-table-column>
                )
            } else {
                return renderColumn(column)
            }
        }
    }

    export default {
        name: 'TableComponent',
        components: {
            ColumnItem
        },
        props: {
            height: { type: String, default: '' },
            selectedList: { type: Array, default: () => [] },
            list: { type: Array, default: () => [] }, // 后台数据列表
            /**
             * [{
             *     prop, // 属性名
             *     label, // 列名
             *     align, // 对齐方式
             *     width, // 列宽
             *     minWidth, // 最小列宽
             *     sortable, // 是否允许排列顺序
             *     formatter: function(row, column){}, // 返回需要展示的操作
             *     render: function(h, params){}, // 自定义render vue虚拟元素创建 【一般不使用，可用formatter替代】 // 方式1
             *     render: function(h, params){}, // 现在添加了jsx 插件之后：【!!!推荐使用!!!!!! 】 // 方式2
             *                可以直接写 html格式的 (eg: <span class="row-index" onClick={() => this.queryCurRowData(row.id)}>{row.code || '- -'}</span>)
             * }]
             */
            columns: {
                // 可以配置 [{label: '有children 的父级(类型一)', children: [{prop, label,width....}]}, {label: '普通类型(类型二)',prop,width...}]
                type: Array,
                default: () => []
            },
            /** 操作 按钮组配置
             * {
             *  width, // 该列宽度
             *  fixed, // 是否固定 // (true, 'left', 'right') //  【目前 该情况的场景没写入兼容的主体样式】
             *  show, // 判断当前TabComponent 是否 展示相关配置项
             *  list: [{ // 操作按钮数组 【该数组长度为0 操作列表将不展示】
             *     label, // 文本
             *     type, // 样式类型 （success/warning/danger/info）
             *     disabled, // 是否禁用
             *     method:function(index, row){}, // 该操作按钮的回调方法
             * }]
             * }
             */
            operates: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            total: {
                type: Number,
                default: 0
            }, // 总数
            pageIndex: {
                type: Number,
                default: 1
            },
            pageSize: {
                type: Number,
                default: 15
            }, // 每页显示的数量
            pageSizes: {
                type: Array,
                default() {
                    if (process.env.NODE_ENV === 'production') {
                        return [10, 11, 12, 13, 14, 15, 20, 30, 50]
                    } else {
                        return [1, 10, 11, 12, 13, 14, 15, 20, 30, 50]
                    }
                }
            },
            pagerCount: {
                type: Number,
                default: 5
            }, // 展示的page页数的 数量
            paginationLayout: {
                type: String,
                default: 'total, sizes, prev, pager, next, jumper'
            },
            paginationPosition: {
                type: String,
                default: 'right'
            },
            /**
             * table 表格的控制参数
             * 具体配置参考 defaultOptions
             */
            options: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            /**
             * 根据对应的 数据标记 切换 当前行(tr)的 样式
             */
            // 根据对应需求 添加 tr样式(注意： 若添加了 斑马线的话 斑马线样式会覆盖 tr样式 【斑马线的样式是放在 td 上边的】)
            tableRowClassName: {
                type: Function,
                default: ({ row, rowIndex }) => { row.index = rowIndex }
                // eg: ({row, rowIndex}) => {true ? 'xxx' : 'yyy'}
            },
            // 选中行的数据
            curRow: {
                type: Object
            },
            // 空数据时是否不显示表格
            emptyHideTable: { type: Boolean, default: false }
        },
        data() {
            return {
                storageArr: [], // 临时存储的数组
                curPageSelect: [], // 当前列表选中的数据
                updatedColumns: true,
                singleSelectIndex: null,
                // 详情弹窗参数
                dialogData: {},
                dialogVisible: false
            }
        },
        computed: {
            computedOptions() {
                const defaultOptions = {
                    border: true,
                    action: false, // 展示action 表格操作
                    showOverflowTooltip: true, // 超出内容 省略号 同时添加 tiptool
                    showPagination: true, // 是否展示 分页栏
                    loading: false, // 是否展示 tableLoading
                    mutiSelect: false, // 是否多选
                    mutiSelectedKey: 'id', // 根据 该值 查找当前页面数据是否包含当前数据 添加 多选被选中的状态
                    mutiSelectedLabel: 'name', // 多选展示的 label
                    /**
                     * 单选模式的必备配置说明:
                     * 1. $props 传入 selectedList 表示初始选中的数据数组
                     * 2. 此处 mutiSelectedKey 必须配置, 是用于辨别已选项和列表项是否匹配的key
                     * 3. 此处 showSingleSelectCheckBox 必须配置, 用于启用单选模式,并显示单选框
                     * 4. 此处 curRowKey 必须配置, 是用于辨别当前高亮行和列表项是否匹配的key
                     * 5. 事件 handleSingleSelectChange(row) 单选框触发change事件的回调, 参数是被选行的数据对象
                     * 6. 事件 handleCurrentChange(row) 点击某行触发click事件的回调, 参数是被选行的数据对象
                     * */
                    showMutiSelectList: false, // 判断是否展示 所有被选中的项
                    showSingleSelectCheckBox: false, // 开启单选模式, 显示单选模式的勾选框
                    //
                    // 如果需要过滤某些数据 不允许选中的情况下请新增 selectable 操作方法
                    selectable: (row, index) => true,
                    curRowKey: 'id', // 根据 该值 查找当前页面数据是否包含当前数据 添加 高亮状态
                    showIndex: true, // 是否展示序号
                    indexLabel: '', // 自选的序号lebel标签
                    stripe: false, // 是否为斑马纹 table
                    highlightCurrentRow: true, // 是否要高亮当前行
                    resizable: true, // 是否允许拖动
                    height: '100%', // 高度
                    maxHeight: '100%', // 最大高度
                    emptyText: '暂无数据', // 空数据时显示的文本内容
                    showSummary: false // 是否展示合计
                }
                return Object.assign({}, defaultOptions, this.options)
            }
        },
        watch: {
            list: {
                deep: true,
                handler() {
                    this.updateSelected()
                }
            },
            '$props.selectedList': {
                deep: true,
                handler() {
                    this.updateSelected()
                }
            },
            cur_row: {
                //
                handler: function(newList, oldList) {
                    this.updateSelectedRow()
                }
            },
            //  columns 动态支持
            columns: {
                handler: function(newList, oldList) {
                    // const _el = this.$refs.mutipleTable.$el
                    // const curEl = _el.querySelector('.el-table__body-wrapper')
                    // curEl.scrollLeft = 0
                    this.updatedColumns = false
                    setTimeout(() => {
                        this.updatedColumns = true
                        this.updateSelectedRow()
                    }, 10)
                },
                deep: true
            }
        },
        mounted() {
        },
        methods: {
            updateSelected(newList = this.list) {
                this.singleSelectIndex = null
                // 判断是否为多选
                const {
                    mutiSelect,
                    mutiSelectedKey = 'id',
                    curRowKey = 'id',
                    showSingleSelectCheckBox
                } = this.computedOptions
                if (mutiSelect) {
                    // 判断是否为多选
                    const {
                        selectedList = [] // 获取是 原来被选中的值... (通过x_y 防止 fix xY --> x-y 通过$attr 无法读取)
                    } = this.$props
                    const indexs = []
                    const storageArr = []
                    const curPageSelect = []
                    selectedList.map(item => {
                        const _index = newList.findIndex(_item => {
                            return _item[mutiSelectedKey] === item[mutiSelectedKey]
                        })
                        if (_index !== -1) {
                            indexs.push(_index)
                            curPageSelect.push(item)
                        } else {
                            // 当前页没有的 数据 作为临时存储 在更新数据之前  合并当前页被选中的数据 提交给父级组件
                            storageArr.push(item)
                        }
                    })
                    this.storageArr = storageArr
                    this.curPageSelect = curPageSelect
                    this.$nextTick(() => {
                        indexs.forEach(index => {
                            this.$refs.mutipleTable && this.$refs.mutipleTable.toggleRowSelection(
                                this.list[index],
                                true
                            ) // 遍历被选中的 多选
                        })
                    })
                } else {
                    // 是否激活单选
                    if (this.computedOptions && this.computedOptions.showSingleSelectCheckBox) {
                        const {
                            selectedList = [] // 获取是 原来被选中的值... (通过x_y 防止 fix xY --> x-y 通过$attr 无法读取)
                        } = this.$props
                        const indexs = []
                        const storageArr = []
                        const curPageSelect = []
                        selectedList.map(item => {
                            const _index = newList.findIndex(_item => {
                                return _item[mutiSelectedKey] === item[mutiSelectedKey]
                            })
                            if (_index !== -1) {
                                indexs.push(_index)
                                curPageSelect.push(item)
                                this.singleSelectIndex = _index
                                this.singleSelectChange(_index)
                            } else {
                                this.singleSelectIndex = null
                                // 当前页没有的 数据 作为临时存储 在更新数据之前  合并当前页被选中的数据 提交给父级组件
                                storageArr.push(item)
                            }
                        })
                        this.storageArr = storageArr
                        this.curPageSelect = curPageSelect
                    }
                }
                this.updateSelectedRow()
                // 解决不显示合计栏的问题
                this.$nextTick(() => {
                    this.$refs.mutipleTable && this.$refs.mutipleTable.doLayout()
                })
            },
            // 单选时显示勾选框
            singleSelectChange(index) {
                if (this.computedOptions.showSingleSelectCheckBox) {
                    // 把上次勾选的取消
                    if (this.singleSelectIndex || this.singleSelectIndex === 0) {
                        this.list[this.singleSelectIndex]._select = false
                    }
                    this.singleSelectIndex = index
                    if (index !== null) {
                        this.list[index]._select = true
                        this.$emit('handleSingleSelectChange', this.list[index])
                    }
                }
            },
            // 更新选中行
            updateSelectedRow() {
                const { curRowKey = 'id' } = this.computedOptions
                const cur_row = this.cur_row || {}
                // 高亮数据判断
                if (cur_row && Object.keys(cur_row).length) {
                    let curRowIndex = -1
                    curRowIndex = this.list.findIndex(_item => {
                        return _item[curRowKey] === cur_row[curRowKey]
                    })
                    if (curRowIndex > -1) {
                        this.singleSelectIndex = curRowIndex
                    } else this.singleSelectIndex = null
                    this.$nextTick(() => {
                        curRowIndex > -1 && this.$refs.mutipleTable.setCurrentRow(this.list[curRowIndex]) // 高亮原本被选中的数据
                    })
                }
            },
            // 排序
            tableSortChange(res) {
                var dbProp = this.columns.find(v => v.prop === res.prop).dbProp
                if (dbProp) {
                    this.singleSelectIndex = null
                    this.$emit('refreshList', {
                        orderBy: res.order === 'descending' ? `${dbProp} desc` : `${dbProp} asc`
                    })
                } else {
                    return new Error('请添加dbProp')
                }
            },
            // 获取列表的 index
            generateIndex(index) {
                const { pageSize, pageIndex } = this
                let _index = ++index
                if (pageSize) {
                    _index = pageSize * (pageIndex - 1) + _index
                }
                return _index
            },
            handleCurrentChange(row, column, cell, event) {
                if (row._selectable !== false) {
                    // 选中当前列 触发
                    this.$emit('handleCurrentChange', row) //
                    if (this.computedOptions.mutiSelect === false) {
                        // 如果是单选操作
                        if (row) {
                            this.singleSelectChange(row.index)
                        }
                    }
                } else {
                    // 点击不可选中的行时触发事件
                    this.$emit('not-selected-click', row)
                }
            },
            // 切换每页显示的数量
            handleSizeChange(size) {
                this.$emit('update:pageIndex', 1)
                this.$emit('update:pageSize', size)
            },
            // 切换页码
            handleIndexChange(index) {
                this.singleSelectIndex = null
                this.$emit('update:pageIndex', index)
            },
            // 支持多选时 行选中触发
            handleSelectionChange(val) {
                this.curPageSelect = val
                if (this.computedOptions.mutiSelect) {
                    this.$emit('handleSelectionChange', this.storageArr.concat(val))
                } else {
                    this.$emit('handleSelectionChange', val)
                }
            },
            // 显示 表格操作弹窗 // 具体的 该功能待开发中 todo...
            showActionHandle() {
                this.$emit('handleAction', '表格操作test')
            },
            // 可用于父级 通过 ref 获取该实例 手动切换
            toggleRowSelectionByIndex(index) {
                this.$refs.mutipleTable.toggleRowSelection(this.list[index])
            },
            // 用于父级 关于 不在当前页的选中数据 处理 删除 使用
            storageArrRemove(row) {
                var { mutiSelectedKey = 'id' } = this.computedOptions
                var index = this.storageArr.findIndex(item => item[mutiSelectedKey] === row[mutiSelectedKey])
                if (index > -1) {
                    this.storageArr.splice(index, 1)
                }
            },
            selectListRemove(row, isCurPageItem) {
                const {
                    mutiSelectedKey = 'id',
                    mutiSelect
                } = this.computedOptions
                const index1 = this.list.findIndex(item => item[mutiSelectedKey] === row[mutiSelectedKey])
                const mutipleTable = this.$refs.mutipleTable
                if (!mutipleTable) return
                // 如果是单选的话 直接清空
                if (!mutiSelect) {
                    return this.$emit('handleSelectionChange', [])
                }
                if (index1 > -1) {
                    return this.toggleRowSelectionByIndex(index1)
                }
                const _index = this.storageArr.findIndex(item => item[mutiSelectedKey] === row[mutiSelectedKey])
                if (_index > -1) {
                    this.storageArr.splice(_index, 1)
                    this.$emit('handleSelectionChange', this.curPageSelect.concat(this.storageArr))
                }
            }
        }
    }
/**
TableComponent的 组件配置
// 需要展示的列配置
columns = [
    {
        prop: 'principalName',
        label: '项目负责人',
        align: 'center',
        width: 100
    },
    {
        prop: 'shortendname',
        label: '状态',
        align: 'center',
        width: '160',
        render: (h, params) => {
            return h('el-tag', {
                props: {type: params.row.state === 0 ? 'success' : params.row.state === 1 ? 'info' : 'danger'} // 组件的props
            }, params.row.state === 0 ? '上架' : params.row.state === 1 ? '下架' : '审核中')
        }
    }
]
// 操作列的 相关配置对象
operates = {
    width: 140,
    // fixed: 'right'
}
*/
/*
<TableComponent
    :list="list" // 后台请求的列表数据
    :total="total" // 该列表总共有多少数据
    :options="options" // table相关的 配置对象 // 配置参考 defaultOptions
    :columns="columns" // 需要展示的列配置 // 参考上面的 columns
    :operates="operates" // 列操作按钮的相关配置 // 参考上面的 operates
    v-bind:pageSize.sync="pageSize" // 更改请求数据列表的 pageSize
    v-bind:pageIndex.sync="pageIndex" // 切换当前的 请求第几页
    @handleAction="handleAction" // 自定义的 一个按钮操作  options.action 等于true才展示
    @handleSelectionChange="handleSelectionChange" // 若存在多选的情况 将目前被选中的数据 传递给父组件
    :selectedList="testList" // 多选情况下 接口返回的元贝备选中的 数组  【有多选数据必传】
    :curRow="testCurRow" // 当前高亮的 数据  【需要高亮上次数据必传】
    :checkSelectedKey="checkSelectedKey" // 查询当前页面数据是否被选中 筛选的唯一key值 【有多选数据不传默认 为 ‘id'】
/>
*/
</script>
<style scoped lang="scss">
$border-c1: #efefef; // 边框
%text_hide {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

/deep/ {
    .el-table::after,
    .el-table::before {
        display: none;
    }
    .el-table--border {
        border: 1px solid $border-c1;
    }
    .el-table {
        .cell,
        .el-table--border td:first-child .cell {
            padding-left: 10px;
            padding-right: 10px;
        }
        // 解决右侧fixed的边框不显示的问题
        .el-table__fixed-right {
            right: -1px;
        }

        .el-table__empty-block {
            /* 列表数据为空样式 */
            border-left: 1px solid $border-c1;
            border-right: 1px solid $border-c1;
        }
        //解决fixed部分的合计栏上边框会挡住滚动条的问题
        .el-table__fixed-footer-wrapper tbody td {
            border-top: none;
        }
        //解决fixed部分的下边框会一直存在
        .el-table__fixed-right::before,
        .el-table__fixed::before {
            display: none;
        }
        //解决同时设置了show-summary和fixed后，fixed部分会挡住滚动条，使处于fixed的部分滚动条无法拖动
        .el-table__fixed,
        .el-table__fixed-right {
            pointer-events: none;
            .el-table__fixed-header-wrapper,
            .el-table__fixed-body-wrapper,
            .el-table__fixed-footer-wrapper {
                pointer-events: initial;
            }
        }

        .cell {
            @extend %text_hide;
        }
    }
    .el-table--scrollable-x .el-table__body-wrapper {
        overflow-y: auto;
    }
    .filter-item {
        display: inline-block;
        margin-bottom: 10px;
        vertical-align: top;
    }
}

.table {
    width: 100%;
    height: 100%;
    /*height: auto !important;*/
    /*max-height: 100%;*/
    display: flex;
    flex-direction: column;
    .body-wrap {
        /*max-height: calc(100% - 106px);*/
        flex: 1;
        height: 100%;
        overflow: hidden;
    }
    .el-table__fixed-right {
        bottom: 0 !important;
        right: 6px !important;
        z-index: 1004;
    }

    .table-action {
        top: calc((100% - 80px) / 2);
        background-color: rgba(0, 0, 0, 0.7);
    }

    .fix-right {
        position: absolute;
        right: 0;
        height: 100px;
        color: #ffffff;
        width: 30px;
        display: block;
        z-index: 1005;
        writing-mode: vertical-rl;
        text-align: center;
        line-height: 28px;
        border-bottom-left-radius: 6px;
        border-top-left-radius: 6px;
        cursor: pointer;
    }
    .not-data {
        color: #999;
        padding: 15px 0;
        text-align: center;
    }
}
.pagination {
    margin-top: 10px;
    text-align: right;
}
.selectsWrap {
    max-height: 106px;
    overflow-y: auto;
    .tag {
        margin-top: 6px;
        margin-left: 8px;
    }
}

/deep/ .single-select-radio {
  .el-radio__label {
    display: none;
  }
}
</style>
