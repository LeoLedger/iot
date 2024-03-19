<template>
    <div
        :style="{
            width: $attrs.width,
            height: $attrs.height,
            minWidth: $attrs.minWidth,
            minHeight: $attrs.minHeight
        }"
        class="layout-box"
    >
        <div :style="{padding: padding}" class="layout-wrap">
            <div :class="['layout-scroll', {flex: flex}]">
                <slot/>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'LayoutBox',
        props: {
            flex: { type: Boolean, default: false },
            paddingTop: { type: String, default: '10px' },
            paddingLeft: { type: String, default: '10px' },
            paddingRight: { type: String, default: '10px' },
            paddingBottom: { type: String, default: '10px' }
        },
        computed: {
            padding() {
                if (this.$attrs.padding) {
                    return this.$attrs.padding
                } else {
                    return `${this.paddingTop} ${this.paddingRight} ${this.paddingBottom} ${this.paddingLeft}`
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
.layout-box {
    width: 100%;
    height: 100%;
    padding: 3px;
    overflow: hidden;
}
.layout-wrap {
    width: 100%;
    height: 100%;
    background: #fff;
    border-radius: 2px;
}
.layout-scroll {
    width: 100%;
    height: 100%;
    overflow: auto;
    &.flex{
        display: flex;
        flex-direction: column;
    }
}
</style>

