<template>
    <div class="box-container">
        <edit-dialog
            :visible="editAppVisible"
            :title="title"
            :edit-id="editId"
            @closeApp="closeEdit"
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
                title: '编辑程序信息'
            }
        },
        watch: {

        },
        created() {
            getAppById()
        },
        methods: {
            closeEdit(bool) {
                this.$emit('closeEditApp', bool)
            }
        }
    }
</script>

<style lang='scss'>
</style>
