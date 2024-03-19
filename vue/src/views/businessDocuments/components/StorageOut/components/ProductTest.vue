<!--
* @description 来料批次检测
* @author yc
!-->
<template>
    <div>
        <TableComponent
            v-bind="tableData"
            empty-hide-table
        >
            <template slot="操作" slot-scope="{$index, row}">
                <el-dropdown trigger="click" size="small">
                    <el-button
                        size="mini"
                        icon="el-icon-more"
                        title="操作"
                    />
                    <el-dropdown-menu slot="dropdown">
                        <div class="layout-dropdown-item" @click="handleUpdate(row)">
                            <el-dropdown-item icon="el-icon-edit" divided>编辑</el-dropdown-item>
                        </div>
                        <div class="layout-dropdown-item" @click="handleDelete($index)">
                            <el-dropdown-item icon="el-icon-delete" divided>删除</el-dropdown-item>
                        </div>
                    </el-dropdown-menu>
                </el-dropdown>
            </template>
        </TableComponent>
        <!-- 选择来料批次检测记录 -->
        <SelectDialog
            v-if="selectDialog.visible"
            v-bind="selectDialog"
            :visible.sync="selectDialog.visible"
            type="materialTesting"
            multiple
            @change="handleListChange"
        />
        <!-- 更新表单 -->
        <UpdateDialog
            v-if="updateDialogVisible"
            :data-id="activeRowId"
            :visible.sync="updateDialogVisible"
            is-edit
            @update="handleUpdateRow"
        />
    </div>
</template>

<script>
    // API
    // 方法
    import enums from '@/utils/enum'
    // 组件
    import SelectDialog from '@/components/SelectDialog/index.vue'
    import UpdateDialog from '@/views/operationsManagement/materialTesting/components/UpdateDialog'

    export default {
        name: 'MaterialTesting',
        components: {
            SelectDialog,
            UpdateDialog
        },
        props: {
            type: { type: [Number, String], default: 1 },
            isEdit: { type: Boolean, default: true },
            isCreate: { type: Boolean, default: false },
            formData: { type: Object }
        },
        data() {
            return {
                tableData: {
                    total: 0,
                    list: [],
                    // 通过配置项 更改 table数据列表的展示
                    columns: [
                        {
                            prop: 'code',
                            label: '批次',
                            minWidth: 150,
                            isClick: true,
                            dialogType: 'materialTesting'
                        },
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            minWidth: 120
                        },
                        {
                            type: 'dict',
                            dictType: 'productType',
                            prop: 'productType',
                            minWidth: 120,
                            label: '产品类型'
                        },
                        {
                            prop: 'count',
                            label: '抽检数量',
                            width: 90
                        },
                        {
                            prop: 'countInvalid',
                            label: '不良品数',
                            width: 90
                        },
                        {
                            type: 'date',
                            prop: 'createTime',
                            label: '抽检日期',
                            width: 90
                        },
                        {
                            prop: 'checkResult',
                            type: 'status',
                            style: 'block',
                            enums: enums.spotCheckResult,
                            label: '抽检结果',
                            width: 80
                        }
                    ],
                    options: {
                        stripe: true, // 是否为斑马纹 table
                        loading: false, // 是否添加表格loading加载动画
                        showIndex: true, // 是否展示 列表序列号
                        height: null,
                        maxHeight: null
                    },
                    // 列操作按钮
                    operates: {
                        width: 67,
                        fixed: 'right',
                        show: this.isEdit
                    }
                },
                selectDialog: {
                    visible: false
                },
                activeRowId: null,
                updateDialogVisible: false
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
                        this.tableData.list = data.incomingInspectionList || []
                    }
                }
            }
        },
        mounted() {
        },
        methods: {
            // 配置来料批次检测列表
            handleConfig() {
                let { guidId, outType, supplierId, products } = this.formData
                this.selectDialog = {
                    value: this.tableData.list,
                    title: '领料批次检测记录',
                    visible: true,
                    extendParams: {
                        outType,
                        supplierId,
                        approvalId: guidId,
                        productIds: products.map(item => item.productId),
                        productTestType: 1,
                        lockedProps: ['productTestType']
                    }
                }
            },
            // 点击编辑按钮时触发
            handleUpdate(data = {}) {
                this.activeRowId = data.guidId
                this.updateDialogVisible = true
            },
            // 点击删除按钮时触发
            handleDelete(index) {
                this.tableData.list.splice(index, 1)
                this.$emit('change', this.tableData.list)
            },
            // 列表改变时触发
            handleListChange(list) {
                this.tableData.list = list
                this.$emit('update', this.tableData.list)
            },
            // 更新行数据时触发
            handleUpdateRow(data) {
                var rowData = this.tableData.list.find(v => v.guidId === this.activeRowId)
                if (rowData) {
                    this.tableData.columns.forEach(({ prop }) => {
                        rowData[prop] = data[prop]
                    })
                    this.$emit('update', this.tableData.list)
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
