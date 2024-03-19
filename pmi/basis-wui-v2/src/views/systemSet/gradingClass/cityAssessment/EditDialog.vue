<!--
* @description
* @fileName list.vue
* @author 姜庆博
* @date 2019/06/11 19:39:44
* @version V1.0.0
!-->
<template>
    <!-- 数据字典详情 新增 / 编辑 RenewalDialog -->
    <el-dialog class="formDialog"
               :title="title"
               :visible="visible"
               :close-on-click-modal="false"
               width="600px"
               @close="closeDialog">
        <Form
                :visible="visible"
                @updateVisible="changeDialog"
                isShowFooter
                :formData="formData"
                :treeData="treeData"
                v-on="$listeners"
                :isEdit="isEdit"
        />
    </el-dialog>
</template>

<script>
    import Form from "./Form"

    export default {
        name: 'EditDialog',
        components: {
            Form
        },
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            isEdit: {
                type: Boolean,
                default: false
            },
            formData: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            treeData: {
                type: Array,
                default: () => []
            },
        },
        data() {
            const {formData, isEdit} = this.$props;
            const title = isEdit && '编辑分类' || '添加分类';
            return {
                title,
                // treeData: []
            }
        },
        watch: {

        },
        created() {
            // 请求 当前树 id 的列表
        },
        methods: {
            closeDialog() {
                this.changeDialog(false)
            },
            changeDialog(bool) {
                // console.log(bool, 'changeDialog 操作弹窗的 展示 和 隐藏');
                this.$emit("update:visible", bool)
            },
        }
    }
</script>

<style lang='scss' scoped>

</style>
