<template>
    <div class="box-container">
        <add-dialog
            :visible="addMapTreeVisible"
            :str="str"
            @closeMapTree="closeAdd"
        />
    </div>
</template>

<script>
    import addDialog from './components/addTreeEditDialog'
    export default {
        name: 'TreeAddBox',
        components: {
            addDialog
        },
        props: {
            addMapTreeVisible: {
                type: Boolean,
                default: false
            },
            str: {
                type: String
            }
        },
        data() {
            return {
            }
        },
        watch: {
            xxxxx: {
                immediate: true,
                handler(val) {}
            }
        },
        created() {},
        methods: {
            closeAdd(bool) {
                this.$emit('closeAddMapTree', bool)
            }
        }
    }
</script>

<style lang='scss'>
</style>
