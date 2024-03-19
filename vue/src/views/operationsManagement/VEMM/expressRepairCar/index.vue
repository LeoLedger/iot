<!--
* @description  车辆寄修
* @author 望浩然
* @date 2021/10/9 - 2021/10/10
!-->
<template>
    <layout-container>
        <layout-row height="100%">
            <layout-box padding-top="0">
                <layout-row height="100%">
                    <el-tabs v-model="tabActiveName" class="layout-tabs">
                        <el-tab-pane name="1" label="寄修单">
                            <ApprovalList v-if="tabActiveName === '1'"/>
                        </el-tab-pane>
                        <el-tab-pane name="2" label="寄修设备">
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
