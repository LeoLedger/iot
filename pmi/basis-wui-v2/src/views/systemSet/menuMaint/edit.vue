<!--
* @description 编辑菜单-盒子
* @fileName edit.vue
* @author 叶金龙
* @date 2019/06/18 15:21:04
* @version V1.0.0
!-->
<template>
    <div class="box-container">
        <edit-dialog
            :visible="editMenusVisible"
            :str="str"
            :tree-data="treeData"
            :edit-id="editId"
            :app-id="appId"
            :getbutton-obj="getbuttonObj"
            @closeMenu="closeEdit"
        />
    </div>
</template>

<script>
    import editDialog from './components/addEditDialog'
    export default {
        name: 'EditMenuBox',
        components: { editDialog },
        props: {
            editMenusVisible: {
                type: Boolean,
                default: false
            },
            str: {
                type: String
            },
            appId: {
                type: [String, Number]
            },
            treeData: {
                type: Array
            },
            editId: {
                tyep: [String, Number]
            },
            getbuttonObj: {
                type: Object
            }
        },
        data() {
            return {
                searchParam: {}
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
                this.$emit('closeEditMenus', bool)
            }
        }
    }
</script>

<style lang='scss'>
</style>
