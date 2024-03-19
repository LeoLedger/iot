<!--
* @description  车辆维修登记
* @author 望浩然
* @date 2021/5/10 - 2021/5/13
!-->
<template>
    <layout-container>
        <layout-row height="100%">
            <layout-box padding-top="0">
                <layout-row height="100%">
                    <el-tabs v-model="tabActiveName" class="layout-tabs">
                        <el-tab-pane name="1" label="维修单">
                            <ApprovalList v-if="tabActiveName === '1'"/>
                        </el-tab-pane>
                        <el-tab-pane name="2" label="维修设备">
                            <DeviceList v-if="tabActiveName === '2'"/>
                        </el-tab-pane>
                    </el-tabs>
                </layout-row>
            </layout-box>
        </layout-row>
    </layout-container>
</template>
<script>
    // 工具

    // API

    // 组件
    import ApprovalList from './ApprovalList'
    import DeviceList from './DeviceList'

    export default {
        components: {
            ApprovalList,
            DeviceList
        },
        props: {},
        data() {
            return {
                tabActiveName: '1'
            }
        },
        computed: {

        },
        mounted() {

        },
        methods: {

        }
    }
</script>

<style lang='scss' scoped>

</style>
