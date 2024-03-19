<template>
    <layout-base v-bind="$props" name="layout-row">
        <slot/>
    </layout-base>
</template>

<script>
    import baseProps from './base-props'
    import LayoutBase from './layout-base'
    export default {
        name: 'LayoutRow',
        components: { LayoutBase },
        props: { ...baseProps }
    }
</script>

