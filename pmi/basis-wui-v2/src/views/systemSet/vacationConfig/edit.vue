<template>
    <div class="box-container">
        <edit-dialog
            :visible="editAppVisible"
            :title="title"
            :edit-id="editId"
            @close="closeEdit"
        />
    </div>
</template>

<script>
    import editDialog from './components/addEditDialog'
    export default {
        name: 'EditAppDialog',
        components: {
            editDialog
        },
        props: {
            editAppVisible: {
                type: Boolean,
                default: false
            },
            editId: {
                type: [String, Number]
            }
        },
        data() {
            return {
                searchParam: {},
                title: '编辑日期信息'
            }
        },
        watch: {

        },
        created() {
            get()
        },
        methods: {
            closeEdit() {
                this.$emit('closeEdit', false)
            }
        }
    }
</script>

<style lang='scss'>
</style>
