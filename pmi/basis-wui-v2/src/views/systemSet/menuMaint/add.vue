<!--
* @description 新增菜单-盒子
* @fileName add.vue
* @author 叶金龙
* @date 2019/06/18 12:45:35
* @version V1.0.0
!-->
<template>
    <div class="box-container">
        <add-dialog
            :visible="addMenusVisible"
            :str="str"
            :app-id="appId"
            :tree-data="treeData"
            @closeMenu="closeAdd"
        />
    </div>
</template>

<script>
    import addDialog from './components/addEditDialog'
    export default {
        name: 'AddMenuBox',
        components: {
            addDialog
        },
        props: {
            addMenusVisible: {
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
            closeAdd(bool) {
                this.$emit('closeAddMenus', bool)
            }
        }
    }
</script>

<style lang='scss'>
</style>
