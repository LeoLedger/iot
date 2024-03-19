<!--
* @description 盘点状态
* @author yc
!-->
<template>
    <div :class="{readonly: readonly}" class="check-status">
        <div
            v-if="config"
            :style="{color: config.border ? config.color : '#fff', borderColor: config.borderColor || config.color, background: config.border ? '' : config.color}"
            class="button"
            @click="handleActive"
        >{{ config.label }}</div>
        <div v-else class="empty">- -</div>
    </div>
</template>

<script>
    // API
    // 方法
    import enums from '@/utils/enum'
    // 组件

    export default {
        components: {
        },
        props: {
            value: { type: Number, default: 0 },
            readonly: { type: Boolean, default: false }
        },
        data() {
            return {
                activeStatus: enums.stocktakingStatus.filter(v => v.value !== 2),
                stocktakingStatus: enums.stocktakingStatus
            }
        },
        computed: {
            config() {
                return enums.stocktakingStatus.find(v => v.value === this.value)
            }
        },
        watch: {
        },
        mounted() {
        },
        methods: {
            handleActive() {
                if (!this.readonly) {
                    if (this.value === 2) {
                        this.$confirm('此操作将删除此盘盈设备, 是否继续?', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning',
                            center: true
                        }).then(() => {
                            this.$emit('delete')
                        })
                    } else {
                        var index = this.activeStatus.findIndex(v => v.value === this.value)
                        if (++index === this.activeStatus.length) {
                            index = 0
                        }
                        var value = this.activeStatus[index].value
                        this.$emit('input', value)
                    }
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
.check-status {
    cursor: pointer;
    &.readonly {
        cursor: initial;
        .button {
            user-select: initial;
        }
    }
    .button {
        display: inline-block;
        text-align: center;
        line-height: 22px;
        border-radius: 12px;
        padding: 0 10px;
        font-size: 12px;
        min-width: 56px;
        border-style: solid;
        border-width: 1px;
        user-select: none;
    }
}
</style>
