<template>
    <layout-base
        v-bind="$props"
        name="layout-col"
    >
        <slot/>
    </layout-base>
</template>

<script>
    import layoutBase from './layout-base'
    import baseProps from './base-props'
    export default {
        name: 'LayoutCol',
        components: { layoutBase },
        props: {
            ...baseProps,
            column: {
                type: Boolean,
                default: true
            }
        }
    }
</script>

