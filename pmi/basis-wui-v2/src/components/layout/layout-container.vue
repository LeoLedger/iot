<template>
    <div
        v-loading="loading"
        :style="{width: width, height: height}"
        :class="['layout-container', {scroll: scroll}]"
        element-loading-text="拼命加载中"
        element-loading-background="rgba(255, 255, 255, 0.4)"
    >
        <slot/>
    </div>
</template>

<script>
    export default {
        name: 'LayoutContainer',
        props: {
            width: {
                type: String,
                default: ''
            },
            height: {
                type: String,
                default: ''
            },
            loading: {
                type: Boolean,
                default: false
            },
            scroll: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {}
        },
        computed: {},
        watch: {},
        mounted() {},
        methods: {}
    }
</script>

<style lang="scss" scoped>
.layout-container {
    display: flex;
    flex-direction: column;
    padding: 3px;
    background: #e9eef2;
    overflow: hidden;
    width: 100%;
    height: 100%;
    &.scroll{
        overflow: auto;
    }
}
</style>

