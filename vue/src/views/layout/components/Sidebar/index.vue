<template>
    <el-scrollbar wrap-class="scrollbar-wrapper">
        <el-menu
            :show-timeout="200"
            :default-active="$route.path"
            :collapse="isCollapse"
            :background-color="variables.menuBg"
            :text-color="variables.menuText"
            :active-text-color="variables.menuActiveText"
            mode="vertical"
        >
            <sidebar-item
                v-for="route in routes"
                :key="route.path"
                :item="route"
                :base-path="route.path"
            />
        </el-menu>
    </el-scrollbar>
</template>

<script>
    import { mapGetters } from 'vuex'
    import variables from '@/styles/variables.scss'
    import SidebarItem from './SidebarItem'

    export default {
        components: { SidebarItem },
        computed: {
            ...mapGetters(['routers', 'sidebar']),
            variables() {
                return variables
            },
            routes() {
                return this.routers
            },
            isCollapse() {
                return !this.sidebar.opened
            }
        }
    }
</script>

<style lang="scss" scoped>
/deep/ {
    .el-menu-item,
    .el-submenu__title,
    .item-wrap{
        display: flex;
        align-items: center;
        line-height: 20px;
        white-space: initial;
        .text {
            flex: 1;
            padding-right: 20px;
        }
        .root {
            padding-right: 0;
        }
    }
}
</style>
