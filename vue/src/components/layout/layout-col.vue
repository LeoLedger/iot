<template>
    <layout-base v-bind="$props" name="layout-col">
        <slot/>
    </layout-base>
</template>

<script>
    import baseProps from './base-props'
    import LayoutBase from './layout-base'
    export default {
        name: 'LayoutCol',
        components: { LayoutBase },
        props: {
            ...baseProps,
            column: { default: true }
        }
    }
</script>

