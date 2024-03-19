<template>
    <div class="table">
        <div v-if="list.length || !emptyHideTable" :style="{height: computedOptions.height, minHeight: computedOptions.minHeight}" class="table-body">
            <div
                :style="{height: tempHeight}"
                class="body-wrap"
            >
                <div
                    v-loading="true"
                    v-if="!updatedColumns"
                    :style="`border: 1px solid #e4e4e4; height:100%`"
                    class="tableTemplate"
                    element-loading-text="列表项更新中..."
                    element-loading-background="rgba(0, 0, 0, 0.1)"
                />
                <el-form
                    ref="TableForm"
                    :model="tableFormData"
                    :rules="tableFormData.rules"
                    class="table-form"
                >
                    <el-table
                        v-loading="computedOptions.loading"
                        v-if="updatedColumns"
                        ref="mutipleTable"
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
                                    <span style="display: none;"/>
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
                            align="center"
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
                </el-form>
            </div>
            <div class="foot-wrap">
                <!--分页-->
                <div v-if="total > 0 && computedOptions.showPagination" class="pagination">
                    <div v-if="computedOptions.mutiSelect" class="select-info">
                        <div class="text">已选择 <span class="num">{{ selectedList.length }}</span> 项</div>
                        <div
                            v-if="selectedList.length"
                            class="link-text"
                            @click="handleCancelAllSelected"
                        >取消全部</div>
                    </div>
                    <div v-if="!(computedOptions.onePageHidePagination && total <= pageSize)" class="right">
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
                    <div class="selectsWrap">
                        <!-- 被多选中的列表 -->
                        <slot :storageArr="storageArr" :curPageSelect="curPageSelect" :selectListRemove="selectListRemove" name="mutiSelectList" >
                            <el-tag
                                v-for="(row, key) in selectedList"
                                :key="key"
                                disable-transitions
                                closable
                                class="tag"
                                @close="selectListRemove(row)">
                                {{ row[computedOptions.mutiSelectedLabel] }}
                            </el-tag>
                        </slot>
                    </div>
                </template>
            </div>
        </div>
        <NoData v-else :text="computedOptions.emptyText"/>
        <!-- 详情弹窗 -->
        <PublicDetailDialog
            v-if="dialogVisible"
            v-bind="dialogData"
            :visible.sync="dialogVisible"
        />
        <DrawMapDialog
            v-if="drawMapDialog.visible"
            v-bind="drawMapDialog"
            :edit-add-address="drawMapDialog.visible"
            is-detail
            show-map-types
            @closeEditMap1="drawMapDialog.visible = false"
        />
    </div>
</template>
<script type="text/jsx">
    // 方法
    import enums from '@/utils/enum'
    import moment from 'moment'
    import { baseImgSrc, copyInputVal, getPriceFormat } from '@/utils'
    // 组件
    import Viewer from 'viewerjs'
    import NoData from '@/components/NoData'
    import DrawMapDialog from '@/components/map/drawMap'
    import CheckStatus from '@/views/businessDocuments/components/Stocktaking/components/CheckStatus'

    const isTest = ['development', 'staging'].includes(process.env.VUE_APP_ENV)
    const isEmpty = function(value) {
        return ['', null, void 0].includes(value)
    }
    const determine = function(value, params) {
        switch (typeof value) {
        case 'boolean':
            return value
        case 'function':
            return value(params)
        }
        return value
    }
    // 表格对齐方式枚举
    const alignEnum = {
        money: 'right'
    }
    const SCRIPT_REGEXP = /(\$\{([^{}]+)\})/g

    const TableStatus = {
        functional: true,
        props: {
            row: Object,
            enums: Array,
            index: Number,
            column: Object,
            dictType: String
        },
        render: (h, context) => {
            var props = context.props || {}
            /**
             * dot      前面带颜色圆点样式
             * block    带颜色背景的块状样式
             */
            var style = props.column.style || 'dot'
            var value = props.row[props.column.prop]
            var config = (props.enums || enums[props.dictType]).find(item => item.value === value)
            if (config) {
                switch (style) {
                case 'dot':
                    return (
                        <div class='tabel-status dot'>
                            <i style={{ background: config.color }} class='dot'/>
                            <span class='text'>{ config.label }</span>
                        </div>
                    )
                case 'block':
                    return (
                        <div class='tabel-status block' style={{ background: config.color }}>{ config.label }</div>
                    )
                }
            }
            return <span>- -</span>
        }
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
            return ctx.props.render(h, ctx.props)
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
            const $table = context.parent
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
            const imageViewerClick = (scope, column) => {
                let files = scope.row[column.filesKey || 'files']
                if (Array.isArray(files)) {
                    if (files.length) {
                        $table.handleImageViewer(files)
                    } else {
                        $table.$message.warning('文件已过期')
                    }
                } else if (typeof column.method === 'function') {
                    column.method({ row: scope.row, column }).then(() => {
                        imageViewerClick(scope, column)
                    })
                }
            }
            const renderCustomType = (scope, column) => {
                var value = scope.row[column.prop]
                // 自定义类型
                if (isEmpty(value) && ['text', 'dateRange'].indexOf(column.type) === -1) {
                    return '- -'
                } else {
                    switch (column.type) {
                    // 自定义文本
                    case 'text':
                        return column.prop
                    case 'dict':
                        // 字典
                        return ($table.getDict(column.dictType).find(v => v.value === value) || {}).label || '- -'
                    case 'date':
                        // 日期
                        return moment(value).format(column.format || 'YYYY-MM-DD')
                    case 'dateRange':
                        // 日期范围
                        var end = scope.row[column.endKey]
                        var start = scope.row[column.startKey]
                        if (start && end) {
                            return `${moment(start).format(column.format || 'yyyy-MM-DD')} 至 ${moment(end).format(column.format || 'yyyy-MM-DD')}`
                        }
                        return '- -'
                    case 'money':
                        // 金额
                        return getPriceFormat(value, column.digit)
                    case 'status':
                        // 表格状态
                        return (
                            <TableStatus
                                row={scope.row}
                                enums={column.enums}
                                index={index.index}
                                column={column}
                                dictType={column.dictType}
                            />
                        )
                    // 地点
                    case 'location':
                        var lat = scope.row[column.latKey || 'latitude']
                        var lng = scope.row[column.lngKey || 'longitude']
                        return (
                            <span
                                class={(lat && lng) ? 'link-text' : ''}
                                onClick={() => {
                                    $table.drawMapDialog = {
                                        visible: true,
                                        point: { lat, lng },
                                        center: { lat, lng }
                                    }
                                }}
                            >
                                {value}
                            </span>
                        )
                    // 图片预览
                    case 'viewer':
                        return (
                            <span
                                class={value > 0 ? 'link-text' : ''}
                                onClick={() => {
                                    if (value > 0) {
                                        imageViewerClick(scope, column)
                                    }
                                }}
                            >{value}</span>
                        )
                    default:
                        return value
                    }
                }
            }
            const renderScope = (scope, column) => {
                var value = scope.row[column.prop]
                var params = { row: scope.row, column: column, index }
                if (determine(column.isRender, params) !== false && column.render) {
                    // jsx语法渲染
                    return (
                        <ExpandDom
                            column={column}
                            row={scope.row}
                            render={column.render}
                            index={index.index}
                        />
                    )
                } else if (column.formatter) {
                    // 自定义格式化
                    return (
                        <span
                            domPropsInnerHTML={column.formatter(scope.row, column, column)}
                        />
                    )
                } else if (
                    determine(column.isClick, params) &&
                    (![0, '', null, void 0].includes(value) || ['text'].includes(column.type))
                ) {
                    // 表格单元格点击事件处理
                    return (
                        <span
                            class='link-text'
                            onClick={() => {
                                var key = column.idKey || 'guidId'
                                var type = column.dialogType
                                if (typeof key === 'function') {
                                    key = key(params)
                                }
                                if (typeof type === 'function') {
                                    type = type(params)
                                }
                                if (type) {
                                    var extendParams = column.extendParams || {}
                                    if (typeof extendParams === 'function') {
                                        extendParams = column.extendParams(params)
                                    }
                                    $table.dialogData = {
                                        type,
                                        dataId: extendParams.dataId || scope.row[key],
                                        rowData: extendParams.rowData || scope.row,
                                        extendParams
                                    }
                                    $table.dialogVisible = true
                                }
                                column.onClick && column.onClick(scope.row, column)
                            }}
                        >
                            {renderCustomType(scope, column)}
                        </span>
                    )
                } else {
                    return (
                        <span
                            style={props.style}
                        >
                            {renderCustomType(scope, column)}
                        </span>
                    )
                }
            }
            // 复制按钮
            const renderCopy = (scope, column) => {
                let value = scope.row[column.prop]
                var params = { row: scope.row, column: column, index }
                let isCopy = determine(column.isCopy, { row: scope.row, column })
                let isClick = !isEmpty(value) && determine(column.isClick, params)
                let isRender = determine(column.isRender, params) !== false && column.render
                if (isCopy || !isRender && isClick && isCopy !== false) {
                    return (
                        <span class='copy-button'>
                            <span class='text'>{renderScope(scope, column)}</span>
                            <span
                                onClick={() => { copyInputVal(scope.row[column.prop]) }}
                                class='icon el-icon-copy-document'
                                title='复制'
                            />
                        </span>
                    )
                }
                return renderScope(scope, column)
            }
            // 表单项
            const renderFormItem = (scope, column) => {
                var rule = $table.tableFormData.rules[scope.column.property]
                if (rule) {
                    let pass = true
                    if (Array.isArray(rule.premise)) {
                        rule.premise.find(item => {
                            if (item.includes.indexOf(scope.row[item.prop]) === -1) {
                                pass = false
                                return true
                            }
                        })
                    }
                    if (pass) {
                        rule = { ...rule }
                        // 关键词替换
                        var replaceEnum = {
                            'index': $table.generateIndex(scope.$index)
                        }
                        while (SCRIPT_REGEXP.exec(rule.message)) {
                            if (RegExp.$2 in replaceEnum) {
                                rule.message = rule.message.replace(RegExp.$1, replaceEnum[RegExp.$2])
                            }
                        }
                        return (
                            <div class='cell-wrap'>
                                <el-form-item
                                    prop={'model.' + scope.$index + '.' + scope.column.property}
                                    rules={rule}
                                >
                                    {renderCopy(scope, column)}
                                </el-form-item>
                            </div>
                        )
                    }
                }
                return (
                    <div class='cell-wrap'>{renderCopy(scope, column)}</div>
                )
            }
            /* 渲染ColumnItem */
            const renderColumn = column => {
                // 根据是否有required来判断表头是否显示 * 号
                let header = <span title={column.label}>{column.label}</span>
                if ($table.computedOptions.showAsterisk &&
                    $table.tableFormData.rules[column.prop] &&
                    $table.tableFormData.rules[column.prop].required) {
                        header = (
                        <span>
                            <span style='color: red;margin-right: 2px;'>*</span>
                            <span title={column.label}>{column.label}</span>
                        </span>
                    )
                    }
                return (
                    <el-table-column
                        prop={column.prop}
                        type={column.columnType}
                        label={column.label}
                        align={column.align || alignEnum[column.type] || 'left'}
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
                                    : scope => header,
                                default: scope => renderFormItem(scope, column)
                            }
                        }}
                    />
                )
            }
            // 若存在子级children 遍历children column 配置 （目前仅支持一级）
            if (children.length) {
                const childNodes = children.filter(item => {
                    // 筛选出可以显示的列
                    return item.visible !== false
                }).map(item => {
                    return renderColumn(item)
                })
                return (
                    <el-table-column
                        label={column.label}
                        align={column.align || alignEnum[column.type] || 'left'}
                    >
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
            NoData,
            Viewer,
            ColumnItem,
            TableStatus,
            CheckStatus,
            DrawMapDialog
        },
        props: {
            selectedList: { type: Array, default: () => [] },
            list: { type: Array, required: true }, // 后台数据列表
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
             *                可以直接写 html格式的 (eg: <span class="link-text" onClick={() => this.queryCurRowData(row.id)}>{row.code || '- -'}</span>)
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
            },
            pagerCount: {
                type: Number,
                default: 5
            }, // 展示的page页数的 数量
            paginationLayout: {
                type: String,
                default: 'total, sizes, prev, pager, next, jumper'
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
            cur_row: {
                type: Object
            },
            // 空数据时是否不显示表格
            emptyHideTable: { type: Boolean, default: false }
        },
        data() {
            return {
                tempHeight: '',
                storageArr: [], // 临时存储的数组
                curPageSelect: [], // 当前列表选中的数据
                updatedColumns: true,
                singleSelectIndex: null,
                // 详情弹窗参数
                dialogData: {},
                dialogVisible: false,
                // 地点窗口参数
                drawMapDialog: {
                    visible: false
                },
                viewerImages: []
            }
        },
        computed: {
            pageSizes() {
                let list = [10, 20, 30, 50, 100, 200, 500, 1000, 2000]
                let pageSize = this.pageSize
                if (isTest) {
                    list.splice(0, 0, 1)
                }
                if (list.indexOf(pageSize) === -1) {
                    list.splice(0, 0, pageSize)
                }
                return list.sort((a, b) => a - b)
            },
            tableFormData() {
                return {
                    model: this.list,
                    rules: this.computedOptions.rules
                }
            },
            computedOptions() {
                const defaultOptions = {
                    rules: {}, // 表单验证规则
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
                    minHeight: '', // 最小高度
                    emptyText: '暂无数据', // 空数据时显示的文本内容
                    showSummary: false, // 是否展示合计
                    defaultSort: {},
                    showAsterisk: true, // 配置了表单规则的列是否在表头显示星号
                    onePageHidePagination: false // 只有一页时隐藏分页器
                }
                return Object.assign({}, defaultOptions, this.options)
            }
        },
        watch: {
            list: {
                deep: true,
                handler(list) {
                    if (list) {
                        // 如果当前列表数量为0，且当前页下标不等于1，
                        // 则表示刚刚用户做了删除操作，把当前页的数据删完了，且没有重置页数
                        // 这时应该把当前页数-1
                        if (list.length === 0 && this.pageIndex > 1) {
                            this.$emit('update:pageIndex', this.pageIndex - 1)
                        } else {
                            this.clearValidate()
                            this.updateSelected()
                        }
                    }
                }
            },
            selectedList: {
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
                deep: true,
                handler: function() {
                    this.updateColumns()
                }
            }
        },
        mounted() {
            this.$viewerElement = document.createElement('div')
            this.$viewer = new Viewer(this.$viewerElement)
        },
        methods: {
            // 对整个表单进行校验
            validate(isMessage = true) {
                return new Promise((resolve, reject) => {
                    this.$refs.TableForm.validate((valid, err) => {
                        if (valid) {
                            resolve()
                        } else {
                            if (isMessage) {
                                this.$message.warning(Object.values(err)[0][0].message)
                            }
                            reject(err)
                        }
                    })
                })
            },
            // 对部分表单字段进行校验
            validateField(props) {
                return new Promise((resolve, reject) => {
                    let passCount = 0
                    let errorCount = 0
                    props = Array.isArray(props) ? props : [props]
                    this.$refs.TableForm.validateField(props, (err) => {
                        if (err) {
                            if (++errorCount === 1) {
                                reject(err)
                            }
                        } else {
                            if (++passCount === props.length) {
                                resolve()
                            }
                        }
                    })
                })
            },
            // 对指定列表进行校验
            validateRows(rows) {
                return new Promise((resolve, reject) => {
                    if (rows.length) {
                        this.$refs.TableForm.clearValidate()
                        this.$nextTick(() => {
                            this.$nextTick(() => {
                                let indexs = rows.map(item => this.list.indexOf(item)).filter(index => index > -1)
                                if (indexs.length) {
                                    let rules = this.computedOptions.rules
                                    let promises = []
                                    let ruleKeys = Object.keys(rules)
                                    indexs.forEach(index => {
                                        ruleKeys.forEach(key => {
                                            let pass = true
                                            let rule = rules[key]
                                            if (Array.isArray(rule.premise)) {
                                                rule.premise.find(item => {
                                                    if (item.includes.indexOf(this.list[index][item.prop]) === -1) {
                                                        pass = false
                                                        return true
                                                    }
                                                })
                                            }
                                            if (pass) {
                                                promises.push(this.validateField(`model.${index}.${key}`))
                                            }
                                        })
                                    })
                                    Promise.all(promises).then(() => {
                                        resolve()
                                    }).catch((err) => {
                                        this.$message.warning(err)
                                        reject(err)
                                    })
                                } else {
                                    resolve()
                                }
                            })
                        })
                    } else {
                        resolve()
                    }
                })
            },
            // 对选中行的表单元素进行校验
            validateSelected() {
                return this.validateRows(this.selectedList)
            },
            // 清空验证
            clearValidate() {
                this.$nextTick(() => {
                    this.$nextTick(() => {
                        let $TableForm = this.$refs.TableForm
                        $TableForm && $TableForm.clearValidate()
                    })
                })
            },
            // 更新表格columns
            updateColumns() {
                /**
                 * el-table无法动态更新columns，所以需要利用v-if重新实例化el-table组件
                 * 但是使用v-if且没有设置height时会导致页面出现闪烁，比较影响用户体验,
                 * 这时可以在columns改变时，获取表格的高度设置到父节点上，延迟到下次更新时，再还原高度
                 */
                if (this.$refs.TableForm) {
                    this.tempHeight = this.$refs.TableForm.$el.clientHeight + 'px'
                }
                this.updatedColumns = false
                this.$nextTick(() => {
                    this.tempHeight = ''
                    this.updatedColumns = true
                    this.updateSelectedRow()
                })
            },
            updateSelected(newList = this.list) {
                this.singleSelectIndex = null
                // 判断是否为多选
                const { mutiSelect, mutiSelectedKey = 'id' } = this.computedOptions
                if (mutiSelect) {
                    // 判断是否为多选
                    const selectedList = this.selectedList
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
                        const selectedList = this.selectedList
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
                    } else {
                        this.singleSelectIndex = null
                    }
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
                // 延迟到两次数据更新后清空验证，用于解决在当前页码改变表单元素的值，
                // 当切换页码后，该行form-item的prop并不会改变，该行数据会被判定为change，
                // 所以也会出现验证失败时的红色边框
                this.clearValidate()
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
                this.$refs.TableForm.clearValidate()
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
            },
            // 取消全部选中
            handleCancelAllSelected() {
                this.$refs.mutipleTable.clearSelection()
                this.$emit('handleSelectionChange', [])
            },
            // 预览图片
            handleImageViewer(files) {
                this.$viewerElement.innerHTML = files.map(v => `<img src="${baseImgSrc + v.fileId}">`).join('')
                this.$nextTick(() => {
                    this.$viewer.index = 0
                    this.$viewer.update()
                    this.$viewer.show()
                })
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
        thead {
            td,
            th {
                padding: 4px 0;
                background: #f7f7f7;
            }
        }
        tbody {
            td,
            th {
                padding: 0;
            }
        }
        .el-table__footer {
            td,
            th {
                padding: 4px 0;
                background: #f7f7f7;
                .cell {
                    line-height: 30px;
                }
            }
        }
        .cell {
            position: relative;
        }
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
    .table-body {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        .table-form {
            height: 100%;
            /deep/ {
                .el-table .cell-wrap > .el-form-item {
                    margin-bottom: 0!important;
                    & > .el-form-item__content {
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                    .el-form-item__error {
                        display: none;
                    }
                }
            }
        }
        .body-wrap {
            position: relative;
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
    .cell-wrap {
        flex: 1;
        line-height: 24px;
        @extend %text_hide;
    }
    .copy-button {
        display: flex;
        align-items: center;
        line-height: 24px;
        padding-right: 20px;
        .text {
            @extend %text_hide;
        }
        .icon {
            position: absolute;
            top: 0;
            right: 5px;
            text-align: center;
            color: #aaa;
            font-size: 14px;
            line-height: 24px;
            cursor: pointer;
            width: 20px;
            &:hover {
                color: #13C2C2;
            }
        }
    }
    .tabel-status {
        &.dot {
            display: flex;
            align-items: center;
            line-height: 1.4em;
            .dot {
                display: inline-block;
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: #ececec;
            }
            .text {
                font-size: 13px;
                color: #777;
                margin-left: 8px;
            }
        }
        &.block {
            display: inline-block;
            color: #fff;
            text-align: center;
            line-height: 22px;
            border-radius: 11px;
            padding: 0 10px;
            font-size: 12px;
            min-width: 56px;
        }
    }
}
.tableTemplate {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
}
.pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    text-align: right;
    .num {
        color: #409eff;
    }
    .select-info {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        line-height: 30px;
        font-size: 14px;
        color: #666;
        margin-top: 10px;
        .text {
            margin-right: 10px;
        }
    }
    .right {
        flex: 1;
        text-align: right;
        margin-top: 10px;
    }
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
