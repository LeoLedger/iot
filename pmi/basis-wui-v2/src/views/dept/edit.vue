<template>
    <div class="box-container">
        <edit-dept-item :visible="editDialogVisible" :dialogTitle="dialogTitle" :deptId="deptId"
                        @closeDialog="closeDialog"></edit-dept-item>
    </div>
</template>

<script>
    import AddDeptItem from "./components/addEditDeptItem";

    export default {
        name: "edit",
        data() {
            return {
                searchParam: {}
            };
        },
        props: {
            editDialogVisible: {
                type: Boolean,
                default: false
            },
            dialogTitle: {
                type: String
            },
            deptId: {
                type: String
            }
        },
        components: {
            AddDeptItem
        },
        methods: {
            closeDialog(isFlush) {
                this.$emit("closeAddDialog", isFlush);
            }
        }
    };
</script>

<style scoped>

</style>
