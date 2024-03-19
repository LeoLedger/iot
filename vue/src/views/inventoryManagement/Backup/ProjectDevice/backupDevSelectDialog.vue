<template>
    <el-dialog
        :visible.sync="visible"
        :before-close="handleCancel"
        :close-on-click-modal="false"
        title="选择 - 待分配设备"
        class=""
        width="1000px"
        append-to-body>
        <DeviceSelectTable
            ref="DeviceSelectTable"
            :row-data="rowData"
            :is-dis="true"
            style="height: 600px"
            @selectChange="handleSelectDevice"
        />
        <span slot="footer">
            <el-button size="mini" @click="handleCancel">取 消</el-button>
            <el-button v-prereclick :disabled="selectList.length < 1" size="mini" type="primary" @click="handleSubmit">确定分配</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import DeviceSelectTable from '@/views/inventoryManagement/Backup/DeviceSelectTable'
    export default {
        name: 'BackupDevSelectDialog',
        components: { DeviceSelectTable },
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            // 已选但实际上还没保存的设备列表
            selectedList: {
                type: Array,
                default: () => []
            },
            // 已删除但实际上还没删除的设备列表
            deletedList: {
                type: Array,
                default: () => []
            },
            productId: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                selectList: [],
                rowData: {
                    // 客服部门仓库 备用设备仓位 待分配 正常设备
                    standbyProjectId: 'empty',
                    unitStatus: 1,
                    productId: this.productId,
                    listType: 0,
                    selectDeviceIds: this.selectedList,
                    removeDeviceIds: this.deletedList,
                    warehousesId: '9f1d6d84-98da-4bc3-bc7c-ec299ef2b4d5',
                    warehousesSpaceId: '09509d7b-5be3-4a89-a472-58c14b35cc2c'
                }
            }
        },
        watch: {
            selectedList: {
                deep: true,
                immediate: true,
                handler(list) {
                    this.rowData.selectDeviceIds = this.selectedList
                    this.rowData.removeDeviceIds = this.deletedList
                }
            }
        },
        methods: {
            handleCancel() {
                this.$emit('close', false)
                this.$emit('update:visible')
            },
            handleSelectDevice(list) {
                if (list && list.length) {
                    this.selectList = list
                } else {
                    this.selectList = []
                }
            },
            handleSubmit() {
                this.$emit('confirm', this.selectList)
                this.$emit('update:visible')
            }
        }
    }
</script>

<style scoped>

</style>
