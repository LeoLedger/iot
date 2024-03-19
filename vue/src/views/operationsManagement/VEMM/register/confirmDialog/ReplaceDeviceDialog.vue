<!--
* @description 选择备用设备
* @author yc
!-->
<template>
    <div>
        <el-dialog
            v-if="visible"
            :visible="visible"
            :title="title"
            :close-on-click-modal="false"
            width="900px"
            class="not-padding"
            append-to-body
            @close="$emit('update:visible', false)"
        >
            <div class="container">
                <el-tabs v-model="tabActive" class="layout-tabs">
                    <el-tab-pane name="3" label="项目备用库"/>
                    <el-tab-pane name="2" label="旧设备"/>
                </el-tabs>
                <Device
                    :value="value"
                    :excludes="excludes"
                    :extend-params="extendParams"
                    height="446px"
                    @change="handlePickChange"
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
            type: { type: [String, Number], default: '3' },
            value: { type: null, default: '' },
            title: { type: String, default: '替换设备' },
            visible: { type: Boolean, default: false },
            params: { type: Object, default: () => ({}) },
            excludes: { type: Array, default: () => [] },
            sectionId: { type: [String, Number], default: '' },
            projectId: { type: [String, Number], default: '' },
            projectName: { type: [String, Number], default: '' },
            productCode: { type: [String, Number], default: '' }
        },
        data() {
            return {
                tabActive: '3',
                selectList: [],
                searchParam: {
                    pageSize: 10,
                    productCategory: 'B16C3151-11D2-4364-8F45-63EFFFFCF424'
                }
            }
        },
        computed: {
            extendParams() {
                let warehouseEnum = {}
                if (this.tabActive === '2') {
                    warehouseEnum = {
                        isCarType: 1,
                        sectionId: this.sectionId,
                        unitStatus: 1,
                        warehousesId: '1bba900a-26c8-492e-bd6d-1583814866c9',
                        typeId: this.getWarehousesSpaceType(0, '旧设备'),
                        lockedProps: ['productType', 'typeId', 'warehousesId', 'productCategory', 'standbyProjectId', 'isCarType']
                    }
                }
                if (this.tabActive === '3') {
                    warehouseEnum = {
                        isCarType: 1,
                        standbyProjectId: this.projectId,
                        warehousesId: '9f1d6d84-98da-4bc3-bc7c-ec299ef2b4d5',
                        typeId: 'cf946b83-9f2c-11eb-bbfa-000c29bb1337',
                        lockedProps: ['productType', 'typeId', 'warehousesId', 'productCategory', 'standbyProjectId', 'isCarType']
                    }
                }
                console.log('warehouseEnum', warehouseEnum)
                return {
                    ...this.searchParam,
                    ...this.params,
                    ...warehouseEnum,
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
                    this.tabActive = value ? String(value) : '3'
                }
            }
        },
        mounted() {
        },
        methods: {
            // 点击提交按钮时触发
            handleSubmit() {
                var count = this.selectList.length
                if (!this.value && !count) {
                    this.$message.warning('请至少选中一项')
                } else {
                    this.$emit('update:visible', false)
                    // 如果是全新设备,则返回type=1
                    let type = Number(this.tabActive)
                    if (this.selectList[0].isNewDevice) {
                        type = 1
                    }
                    this.$emit('change', {
                        type: type,
                        list: this.selectList
                    })
                }
            },
            handlePickChange(list) {
                this.selectList = list
            }
        }
    }
</script>

<style lang='scss' scoped>
.container {
    padding: 0 15px 10px;
}
</style>
