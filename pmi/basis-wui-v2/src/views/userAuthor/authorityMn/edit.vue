<!--
* @description
* @fileName edit.vue
* @author 叶金龙
* @date 2019/06/19 13:26:16
* @version V1.0.0
!-->
<template>
    <div class="box-container">
        <edit-dialog
            :str="str"
            :treeData="treeData"
            :authVisible="editAuthVisible"
            :editInfoObj="editInfoObj"
            @closeAuth="closeAuth"
        ></edit-dialog>
    </div>
</template>

<script>
    import editDialog from "./components/addEditDialog";

    export default {
        name: "editAuthBox",
        data() {
            return {
                searchParam: {}
            };
        },
        props: {
            editAuthVisible: {
                type: Boolean,
                default: false
            },
            str: {
                type: String
            },

            editInfoObj: {
                type: Object
            },
            treeData: {
                type: Array
            },
        },
        created() {
        },
        components: {
            editDialog
        },
        methods: {
            closeAuth(bool) {
                this.$emit("closeEditAuth", bool);
            }
        }
    };
</script>

<style lang='scss'>
</style>
