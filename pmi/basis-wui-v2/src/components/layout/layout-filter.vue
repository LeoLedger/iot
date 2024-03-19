<template>
    <layout-col :height="height" auto>
        <layout-col auto>
            <layout-row>
                <slot name="filter-top" />
            </layout-row>
            <layout-row v-if="showToolbar">
                <layout-col not-flex>
                    <div class="layout-filter">
                        <slot name="button"/>
                    </div>
                </layout-col>
                <layout-col ref="layout-filter" auto not-flex>
                    <div class="layout-filter" style="text-align: right;">
                        <template v-if="filterButton">
                            <slot name="filter"/>
                        </template>
                        <div class="filter-group">
                            <el-button
                                v-if="filterPopupVisible"
                                ref="filterPopupButton"
                                size="mini"
                                type="primary"
                                class="button-item"
                                @click="handleFilterPopupVisible"
                            >
                                筛选
                                <i class="el-icon-caret-bottom el-icon--right"/>
                            </el-button>
                            <el-tooltip effect="dark" content="搜索" placement="top">
                                <el-button
                                    circle
                                    size="mini"
                                    icon="el-icon-search"
                                    class="button-item"
                                    @click="handleSearch"
                                />
                            </el-tooltip>
                            <el-dropdown
                                size="medium"
                                class="button-item"
                                trigger="click"
                                @command="handleCommand"
                            >
                                <el-tooltip effect="dark" content="更多操作" placement="top">
                                    <el-button circle size="mini" icon="el-icon-more"/>
                                </el-tooltip>
                                <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item
                                        command="clear"
                                        icon="el-icon-delete-solid"
                                        @click="handleResetFilter"
                                    >清空条件</el-dropdown-item>
                                    <el-dropdown-item
                                        command="field"
                                        icon="el-icon-menu"
                                        @click="handleFieldEditVisible"
                                    >列表设置</el-dropdown-item>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </div>
                    </div>
                </layout-col>
            </layout-row>
            <layout-row auto>
                <slot name="table"/>
            </layout-row>
        </layout-col>
        <div style="height:0">
            <div
                ref="filterPopup"
                :class="{visible: filter.visible}"
                :style="filter.style"
                class="filter-popup"
            >
                <div class="body-wrap">
                    <layout-row class="layout-filter-item">
                        <slot name="filter-popup"/>
                    </layout-row>
                </div>
                <div class="foot-wrap">
                    <el-button type="primary" @click="handleSearch">查询</el-button>
                    <el-button @click="handleResetFilter">重置</el-button>
                    <el-button @click="handleFilterPopupVisible">关闭</el-button>
                </div>
            </div>
            <el-dialog
                :visible.sync="fieldEditVisible"
                append-to-body
                class="filter-transfer"
                title="多选"
                width="560px"
            >
                <el-transfer
                    v-model="transfer.value"
                    :data="transfer.data"
                    :titles="['隐藏', '显示']"
                    @change="handleTransferChange"
                />
            </el-dialog>
        </div>
        <slot/>
    </layout-col>
</template>

<script>
    export default {
        name: 'LayoutFilter',
        props: {
            height: {
                type: String,
                default: '100%'
            },
            loading: {
                type: Boolean,
                default: false
            },
            tableColumns: {
                type: Array,
                default: () => []
            },
            filterModel: {
                type: Object,
                default: () => ({})
            },
            // 是否显示更多筛选条件按钮
            filterButton: {
                type: Boolean,
                default: true
            },
            // 是否显示工具栏
            showToolbar: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                filter: {
                    style: '',
                    model: Object.assign({}, this.filterModel),
                    visible: false
                },
                transfer: {
                    data: [],
                    value: []
                },
                fieldEditVisible: false
            }
        },
        computed: {
            filterPopupVisible() {
                return this.filterButton && this.$slots['filter-popup']
            }
        },
        watch: {
            tableColumns: {
                immediate: true,
                handler() {
                    const data = []
                    const value = []
                    const recursion = (list, path) => {
                        list.forEach((item, index) => {
                            const newPath = `${path ? path + '-' : ''}${index}`
                            if (item.children && item.children.length) {
                                recursion(item.children, newPath)
                            } else if (item.notTransfer !== false) {
                                data.push({
                                    key: newPath,
                                    label: item.label,
                                    disabled: !!item.disabled
                                })
                                if (item.visible !== false) {
                                    value.push(newPath)
                                }
                            }
                        })
                    }
                    recursion(this.tableColumns, '')

                    this.transfer.data = data
                    this.transfer.value = value
                }
            }
        },
        mounted() {
            window.addEventListener('resize', this.updatePosition)
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.updatePosition)
        },
        methods: {
            updatePosition() {
                if (this.filterPopupVisible) {
                    const rect1 = this.$refs.filterPopup.getBoundingClientRect()
                    const rect2 = this.$refs.filterPopupButton.$el.getBoundingClientRect()
                    const top = rect2.top + rect2.height
                    const left = rect2.left + rect2.width - rect1.width
                    this.filter.style = `top:${top}px;left:${left}px;`
                }
            },
            handleSearch() {
                this.filter.visible = false
                this.$emit('search')
            },
            handleCommand(command) {
                switch (command) {
                case 'clear':
                    this.handleResetFilter()
                    break
                case 'field':
                    this.handleFieldEditVisible()
                    break
                }
            },
            handleFieldEditVisible() {
                this.fieldEditVisible = !this.fieldEditVisible
            },
            handleFilterPopupVisible() {
                this.updatePosition()
                this.filter.visible = !this.filter.visible
            },
            handleResetFilter() {
                this.$emit(
                    'update:filterModel',
                    Object.assign({}, this.filter.model)
                )
                this.$emit('search')
            },
            handleTransferChange(res) {
                const columns = {
                    children: this.tableColumns
                }
                this.transfer.data.forEach(item => {
                    let column = columns
                    item.key.split('-').forEach(idx => {
                        column = column.children[idx]
                    })
                    if (res.indexOf(item.key) > -1) {
                        this.$set(column, 'visible', true)
                    } else {
                        this.$set(column, 'visible', false)
                    }
                })
                // 更新存在多级嵌套结构的显示状态
                const recursion = data => {
                    if (data.children && data.children.length) {
                        let visible = false
                        data.children.every(item => {
                            if (recursion(item)) {
                                visible = true
                                return false
                            }
                            return true
                        })
                        this.$set(data, 'visible', visible)
                    } else {
                        if (data.notTransfer === false) {
                            return true
                        } else {
                            return data.visible
                        }
                    }
                }
                this.tableColumns.forEach(item => {
                    recursion(item)
                })
                this.$emit('update:tableColumns', this.tableColumns)
            }
        }
    }
</script>
<style lang="scss" scoped>
.filter-popup {
    position: fixed;
    border: 1px solid #e4e7ed;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    background: #fff;
    width: 740px;
    margin-top: 10px;
    z-index: 1000;
    pointer-events: none;
    opacity: 0;
    transform: scaleY(0);
    transform-origin: 50% 0;
    transition: 0.2s ease-in-out;
    &.visible {
        opacity: 1;
        pointer-events: initial;
        transform: scaleY(1);
    }
    .body-wrap {
        max-height: 50vh;
        overflow: auto;
        padding: 20px 10px 10px;
        .layout-filter-item {
            flex-wrap: wrap;
        }
    }
    .foot-wrap {
        padding: 10px 20px;
        background: #f5f5f5;
        text-align: center;
    }
    /deep/ {
        .el-select,
        .el-input-number,
        .el-cascader,
        .el-date-editor {
            // date 样式
            width: 100%;
        }
    }
}
</style>

