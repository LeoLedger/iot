<!--
* @description  选项卡布局
* @fileName index.vue
* @author 易超
!-->
<template>
    <layout-container>
        <layout-row height="100%">
            <layout-box padding-top="0">
                <layout-col height="100%">
                    <layout-row>
                        <el-tabs
                            :value="value"
                            :class="{'not-margin': notMargin}"
                            class="layout-tabs"
                            @tab-click="handleTabClick"
                        >
                            <el-tab-pane
                                v-for="item in options"
                                :key="item.name"
                                :name="item.name"
                                :label="item.label"
                            />
                        </el-tabs>
                    </layout-row>
                    <layout-row auto not-flex>
                        <keep-alive>
                            <slot/>
                        </keep-alive>
                    </layout-row>
                </layout-col>
            </layout-box>
        </layout-row>
    </layout-container>
</template>
<script>
    // 工具
    // API
    // 组件

    export default {
        props: {
            value: { type: String },
            options: { type: Array, default: () => [] },
            notMargin: { type: Boolean, default: false }
        },
        mounted() {
            var { name } = this.$route.query
            if (name) {
                this.activeName = name
                this.$emit('input', name)
            }
        },
        methods: {
            handleTabClick(data) {
                let name = data.name
                this.$emit('input', name)
                this.$emit('change', data)
                history.replaceState(null, null, `${location.origin}${location.pathname || '/'}#${this.$route.path}?name=${name}`)
            }
        }
    }
</script>

<style lang='scss' scoped>
.layout-tabs {
    /deep/ {
        .el-tabs__header {
            margin-bottom: 10px;
        }
    }
}
</style>
