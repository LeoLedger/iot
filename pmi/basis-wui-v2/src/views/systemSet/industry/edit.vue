<!--
* @description 行业管理-修改
* @fileName edit.vue
* @author Herux
* @date 2020/09/11
* @version V1.0.0
!-->
<template>
    <div class="box-container">
        <edit-dialog
            :str="str"
            :authVisible="editAuthVisible"
            :editInfoObj="editInfoObj"
            @closeAuth="closeAuth"
        ></edit-dialog>
    </div>
</template>

<script>
    import editDialog from "./components/addEditDialog";

    export default {
        name: "editIndustryBox",
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
            }
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
