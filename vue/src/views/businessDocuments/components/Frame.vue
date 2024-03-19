<!--
* @description  业务单据公共框架
* @author 易超
!-->
<template>
    <layout-container height="100%">
        <layout-row auto>
            <layout-col>
                <layout-box width="240px" flex>
                    <layout-row not-flex class="title-bar">单据类型</layout-row>
                    <layout-row auto not-flex scroll>
                        <div
                            v-for="item in menus"
                            :key="item.name"
                            :class="{active: activeName === item.name }"
                            class="tab-item"
                            @click="handleActive(item.name)"
                        >
                            <div class="label">{{ item.label }}</div>
                            <div v-if="canHandle && canApprovalCount[item.type] > 0" class="count">{{ canApprovalCount[item.type] > 99 ? '99+' : canApprovalCount[item.type] }}</div>
                        </div>
                    </layout-row>
                </layout-box>
            </layout-col>
            <layout-col auto>
                <transition name="fade-transform" mode="out-in">
                    <component
                        :is="activeName"
                        :is-edit="isEdit"
                        :can-handle="canHandle"
                    />
                </transition>
            </layout-col>
        </layout-row>
    </layout-container>
</template>
<script>
    // API
    // 方法
    import enums from '@/views/businessDocuments/components/enum'

    const components = {}
    enums.map(item => {
        components[item.name] = require('@/views/businessDocuments/components/' + item.name).default
    })

    export default {
        components,
        props: {
            isEdit: { type: Boolean, default: false },
            canHandle: { type: Boolean, default: false }
        },
        data() {
            return {
                counts: {},
                activeName: ''
            }
        },
        computed: {
            menus() {
                return enums.filter(item => this.canHandle ? this.checkFeature([item.handleKey]) : this.checkFeature([item.key]))
            },
            components() {
                return this.menus.map(v => v.name)
            }
        },
        mounted() {
            var { name } = this.$route.query
            if (name) {
                this.activeName = name
            } else if (this.menus.length) {
                this.activeName = this.menus[0].name
            }
            if (this.canHandle) {
                this.getCanApprovalCount()
            }
        },
        beforeDestroy() {
            clearInterval(this.timer)
        },
        methods: {
            handleActive(name) {
                this.activeName = name
                history.replaceState(null, null, `${location.origin}${location.pathname || '/'}#${this.$route.path}?name=${name}`)
            }
        }
    }
</script>

<style lang='scss' scoped>
.title-bar {
    border-bottom: solid 1px #ebeef5;
    margin-bottom: 10px;
    padding-bottom: 10px;
    font-size: 14px;
}
.tab-item {
    display: flex;
    align-items: center;
    border-left: solid 4px transparent;
    background: #f4f6f7;
    padding: 10px;
    font-size: 14px;
    margin-bottom: 3px;
    cursor: pointer;
    transition: 0.3s ease-in-out;
    color: #666;
    &.active {
        color: #333;
        background: #d4d4d4;
        border-left-color: #409eff;
    }
    .label {
        flex: 1;
    }
    .count {
        color: #fff;
        font-size: 12px;
        line-height: 17px;
        padding: 0 5px;
        border-radius: 8px;
        width: 33px;
        text-align: center;
        background: #409eff;
    }
}
</style>
