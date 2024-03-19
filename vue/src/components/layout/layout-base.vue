<template>
    <div
        :class="[name, 'layout-base', {auto: auto, wrap: wrap, notFlex: notFlex, column: column, scroll: scroll}]"
        :style="{width: width, height: height, minWidth: minWidth, minHeight: minHeight, alignItems: align, justifyContent: justify}"
    >
        <slot/>
    </div>
</template>

<script>
    import baseProps from './base-props'
    export default {
        name: 'LayoutBase',
        props: {
            ...baseProps,
            name: String
        }
    }
</script>

<style lang="scss" scoped>
.layout-base {
    display: flex;
    flex-shrink: 0;
    overflow: hidden;
    &.auto {
        flex-grow: 1;
        flex-shrink: initial;
    }
    &.wrap {
        flex-wrap: wrap;
    }
    &.column {
        flex-direction: column;
    }
    &.notFlex {
        display: initial;
    }
    &.scroll{
        overflow: auto;
    }
}
</style>

