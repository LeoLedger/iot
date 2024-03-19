<template>
    <div
        :class="[name, 'layout-base', {auto: auto, wrap: wrap, notFlex: notFlex, column: column, scroll: scroll}]"
        :style="{width: width, height: height, minWidth: minWidth, minHeight: minHeight, alignItems: align, justifyContent: justify}"
    >
        <slot/>
    </div>
</template>

<script>
/**
 * @property    {Boolean}   auto        是否弹性改变大小
 * @property    {Boolean}   notFlex     是否不使用flex布局
 * @property    {String}    width       设置宽度
 * @property    {String}    height      设置高度
 * @property    {String}    align       垂直排列方式
 * 	@value  flex-start      从上往下排列
 * 	@value  center          居中排列
 * 	@value  flex-end        从下往上排列
 * @property    {String}    justify     水平排列方式
 * 	@value  flex-start      从左往右排列
 * 	@value  center          居中排列
 * 	@value  flex-end        从右往左排列
 * 	@value  space-around    两侧的间隔相等
 * 	@value  space-between   左右对齐
 */

    import baseProps from './base-props'
    export default {
        name: 'LayoutBase',
        props: {
            ...baseProps,
            name: {
                type: String,
                default: ''
            }
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

