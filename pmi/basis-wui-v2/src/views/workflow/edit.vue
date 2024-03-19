<template>
    <div class="box-container">
        <edit-dialog
            :visible="editVisible"
            :title="title"
            :work-flow-id="workFlowId"
            @closeApp="closeEdit"
        />
    </div>
</template>

<script>

    import editDialog from './components/addEditDialog'
    export default {
        name: 'Edit',
        components: {
            editDialog
        },
        props: {
            editVisible: {
                type: Boolean,
                default: false
            },
            workFlowId: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                title: '编辑流程信息'
            }
        },
        methods: {
            closeEdit(bool) {
                this.$emit('closeEditApp', bool)
            }
        }
    }
</script>

<style scoped>

</style>
