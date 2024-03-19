<template>
    <layout-base
        v-bind="$props"
        name="layout-row"
    >
        <slot/>
    </layout-base>
</template>

<script>
    import layoutBase from './layout-base'
    import baseProps from './base-props'

    export default {
        name: 'LayoutRow',
        components: { layoutBase },
        props: { ...baseProps }
    }
</script>

