<!--
* @description 选择故障设备
* @author yc
!-->
<template>
    <div>
        <el-dialog
            v-if="visible"
            :visible="visible"
            :title="title"
            :close-on-click-modal="false"
            width="1200px"
            class="not-padding"
            append-to-body
            @close="$emit('update:visible', false)"
        >
            <div class="container">
                <el-tabs v-model="tabActive" class="layout-tabs">
                    <el-tab-pane :disabled="loading" name="0" label="在运营库"/>
                    <el-tab-pane :disabled="loading" name="1" label="寄存库"/>
                </el-tabs>
                <Device
                    ref="Device"
                    :value="value"
                    :excludes="excludes"
                    :extend-params="extendParams"
                    @change="handlePickChange"
                    @loading-change="handleLoadingChange"
                />
            </div>
            <span slot="footer">
                <el-button size="mini" @click="$emit('update:visible', false)">取 消</el-button>
                <el-button v-prereclick type="primary" size="mini" @click="handleSubmit">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    // API
    // 方法
    // 组件
    import Device from '@/components/SelectDialog/Device'

    export default {
        name: 'ReplaceDeviceDialog',
        components: {
            Device
        },
        props: {
            type: { type: [String, Number], default: '0' },
            value: { type: null, default: '' },
            title: { type: String, default: '选择设备' },
            params: Object,
            visible: { type: Boolean, default: false },
            excludes: Array
        },
        data() {
            return {
                loading: false,
                tabActive: '0',
                selectList: [],
                searchParam: {
                    pageSize: 15
                },
                warehouseEnum: [
                    // 在运营库
                    {
                        typeId: this.getWarehousesSpaceType(0, '在运营'),
                        warehousesId: 'bc5fe3a9-5b92-4aad-b7fe-acc62dcc82de' // 智能设备
                    },
                    // 寄存库
                    {
                        typeId: this.getWarehousesSpaceType(0, '寄存'),
                        warehousesId: 'bc5fe3a9-5b92-4aad-b7fe-acc62dcc82de'
                    }
                ]
            }
        },
        computed: {
            extendParams() {
                return {
                    ...this.searchParam,
                    ...this.params,
                    ...this.warehouseEnum[this.tabActive],
                    notSelectClick: () => {
                        this.$message.warning('该设备已被选择！')
                    }
                }
            }
        },
        watch: {
            type: {
                immediate: true,
                handler(value) {
                    this.tabActive = String(value)
                }
            }
        },
        mounted() {
        },
        methods: {
            // 点击提交按钮时触发
            handleSubmit() {
                if (this.selectList.length) {
                    this.$emit('update:visible', false)
                    this.$emit('change', this.selectList)
                } else {
                    this.$message.warning('请至少选中一项')
                }
            },
            handlePickChange(list) {
                this.selectList = list
            },
            handleLoadingChange(loading) {
                this.loading = loading
            }
        }
    }
</script>

<style lang='scss' scoped>
.container {
    padding: 0 15px 10px;
}
</style>
