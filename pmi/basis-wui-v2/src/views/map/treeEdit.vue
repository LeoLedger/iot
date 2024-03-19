<template>
    <div class="box-container">
        <edit-dialog
            :visible="editMapTreeVisible"
            :str="str"
            :edit-tree-id="editTreeId"
            @closeMapTree="closeEdit"
        />
    </div>
</template>

<script>
    import editDialog from './components/addTreeEditDialog'
    export default {
        name: 'EditMapTreeBox',
        components: { editDialog },
        props: {
            editMapTreeVisible: {
                type: Boolean,
                default: false
            },
            str: {
                type: String
            },
            editTreeId: {
                type: [String, Number]
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
            closeEdit(bool) {
                this.$emit('closeEditMapTree', bool)
            }
        }
    }
</script>

<style lang='scss'>
</style>
