<!--
* @fileName 备用分配 - 主窗口
* @author   望浩然
* @date     2021/4/17
-->

<template>
    <div>
        <el-dialog
            :visible.sync="visible"
            :before-close="handleCancel"
            :close-on-click-modal="false"
            title="设备备用分配"
            width="1200px"
            class="not-top-padding"
            append-to-body>
            <el-tabs v-model="activeTab">
                <el-tab-pane name="0" label="待分配" style="height: 600px">
                    <DeviceSelectTable
                        v-if="activeTab === '0'"
                        ref="DeviceSelectTable"
                        :fresh-key="freshKey"
                        :is-dis="false"
                        :row-data="rowData"
                        @selectChange="handleSelectDevice"
                    />
                </el-tab-pane>
                <el-tab-pane name="1" label="项目备用设备分配列表" style="height: 600px">
                    <ProjectDeviceTable
                        v-if="activeTab === '1'"
                        :fresh-key="freshKey"
                    />
                </el-tab-pane>
            </el-tabs>
            <span slot="footer">
                <el-button size="mini" @click="handleCancel">关 闭</el-button>
                <el-button
                    v-prereclick
                    v-if="activeTab === '0'"
                    :loading="loading"
                    :disabled="selectList.length < 1"
                    size="mini"
                    type="primary"
                    @click="handleShowProjectSelect"
                >
                    {{ selectList.length?'分配已选择的设备':'请先勾选设备' }}
                    <span v-if="selectList.length">({{ selectList.length }}个)</span>
                </el-button>
            </span>
        </el-dialog>
        <!--  选择备用项目页面  -->
        <ProjectSelectDialog
            v-if="projectSelectVisible"
            :visible="projectSelectVisible"
            :device-list="selectList"
            @close="projectSelectVisible = false"
            @confirm="handleConfirm"
        />
    </div>
</template>

<script>
    import DeviceSelectTable from '@/views/inventoryManagement/Backup/DeviceSelectTable'
    import ProjectDeviceTable from '@/views/inventoryManagement/Backup/ProjectDevice/index'
    import ProjectSelectDialog from '@/views/inventoryManagement/Backup/ProjectSelectDialog'
    export default {
        name: 'BackupDialog',
        components: { ProjectSelectDialog, ProjectDeviceTable, DeviceSelectTable },
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            rowData: {
                type: Object,
                default: null
            }
        },
        data() {
            return {
                activeTab: '0',
                loading: false,
                projectSelectVisible: false,
                // 刷新标志
                freshKey: 0,
                // 设备勾选项
                selectList: []
            }
        },
        methods: {
            handleCancel() {
                this.$emit('close', false)
                this.$emit('update:visible')
            },
            handleShowProjectSelect() {
                this.projectSelectVisible = true
            },
            handleSelectDevice(list) {
                if (list && list.length) {
                    this.selectList = list
                } else {
                    this.selectList = []
                }
            },
            handleConfirm() {
                this.freshKey = new Date()
                // 分配成功后,清除待分配列表
                this.selectList = []
                this.$refs.DeviceSelectTable.clearSelectList()
            }
        }
    }
</script>

<style scoped>

</style>
