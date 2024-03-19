<!--
* @description 权限配置弹窗
* @author yc
!-->
<template>
    <el-dialog
        v-if="visible"
        :title="title"
        :visible="visible"
        :close-on-click-modal="false"
        width="700px"
        class="not-padding"
        append-to-body
        @close="$emit('update:visible', false)"
    >
        <layout-col v-loading="loading" class="content">
            <layout-row class="head-wrap" align="center" justify="space-between">
                <layout-col>
                    <el-checkbox
                        v-model="allChecked"
                        :indeterminate="indeterminate"
                        @change="handleAllChecked"
                    >
                        授予全部权限
                    </el-checkbox>
                </layout-col>
                <layout-col>
                    <el-select
                        v-model="searchParam.appId"
                        filterable
                        placeholder="请选择系统"
                        size="mini"
                        style="width: 200px"
                        @change="getList"
                    >
                        <el-option
                            v-for="item in sysTemList"
                            :key="item.appId"
                            :label="item.appName"
                            :value="item.appId"
                        />
                    </el-select>
                </layout-col>
            </layout-row>
            <layout-row not-flex auto scroll class="body-wrap">
                <el-tree
                    ref="tree"
                    node-key="menuId"
                    v-bind="treeConfig"
                    show-checkbox
                    default-expand-all
                    check-on-click-node
                    check-strictly
                    auto-expand-parent
                    :expand-on-click-node="false"
                    @check="handleCheckChange"
                >
                    <span slot-scope="{node}" class="custom-tree-node" :title="node.disabled ? '该权限继承自角色': ''">
                        <span>
                            {{ node.label }}
                            <span v-if="node.disabled">(R)</span>
                        </span>
                    </span>
                </el-tree>
            </layout-row>
        </layout-col>
        <span slot="footer">
            <el-button size="mini" @click="$emit('update:visible', false)">取 消</el-button>
            <el-button v-prereclick type="primary" size="mini" @click="handleSubmit">提 交</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import { getAppList } from '@/api/systemSet/application/index'
    import { getMenuGrant, updateMenuGrant } from '@/api/menu/index'

    export default {
        name: 'PermissionConfigDig',
        components: {
        },
        props: {
            title: { type: String, default: '权限配置' },
            visible: { type: Boolean, default: false },
            objectId: null,
            objectType: { type: Number, default: 0 }
        },
        data() {
            return {
                loading: false,
                searchParam: {
                    appId: ''
                },
                sysTemList: [],
                allChecked: false,
                indeterminate: false,
                treeConfig: {
                    data: [],
                    props: {
                        children: 'children',
                        label: 'menuName',
                        disabled: 'disabled'
                    }
                }
            }
        },
        computed: {
        },
        watch: {
            visible: {
                immediate: true,
                handler(value) {
                    if (value) {
                        this.getList()
                    }
                }
            }
        },
        created() {
            this.menuGrants = []
            this.getSystemList()
        },
        methods: {
            // 请求权限数据
            async getList() {
                if (this.objectId) {
                    this.loading = true
                    var res = await getMenuGrant({
                        appId: this.searchParam.appId,
                        objectId: this.objectId,
                        objectType: this.objectType
                    })
                    var { menus, menuGrants } = res.data.data
                    // 当用户配置了角色时，会继承该角色的权限，所以当配置用户权限时，
                    // 应禁用继承的角色权限
                    if (this.objectType === 1) {
                        let recursion = (node) => {
                            let grants = menuGrants.find(v => v.menuId === node.menuId)
                            if (grants) {
                                node.disabled = grants.grantedProviders.findIndex(v => v.type === 0) > -1
                            }
                            node.children.forEach(item => recursion(item))
                        }
                        menus.forEach(item => recursion(item))
                    }
                    this.menuGrants = menuGrants
                    this.treeConfig.data = menus
                    this.$nextTick(() => {
                        this.$refs.tree.setCheckedKeys(menuGrants.filter(v => v.granted).map(v => v.menuId))
                        this.updateAllChecked()
                    })
                    this.loading = false
                }
            },
            // 获取系统列表
            getSystemList() {
                getAppList({
                    name: '',
                    pageSize: 1000
                }).then(res => {
                    if (res.data.success) {
                        this.sysTemList = res.data.data.records
                        this.searchParam.appId = this.sysTemList[1].appId
                    } else {
                        return this.$message.error('获取系统信息错误!')
                    }
                })
            },
            // 更新全选按钮状态
            updateAllChecked() {
                var checked = this.$refs.tree.getCheckedKeys().length
                var allChecked = this.menuGrants.length === checked
                if (!allChecked) {
                    this.indeterminate = checked > 0
                }
                this.allChecked = allChecked
            },
            // 点击提交按钮时触发
            handleSubmit() {
                let menus = []
                let recursion = (list, children) => {
                    children.forEach(item => {
                        list.push({
                            menuId: item.menuId,
                            granted: false,
                            permissionKey: item.permissionKey
                        })
                        recursion(list, item.children)
                    })
                }
                recursion(menus, this.treeConfig.data)
                var checkedKeys = this.$refs.tree.getCheckedKeys()
                menus.forEach(item => {
                    item.granted = checkedKeys.indexOf(item.menuId) > -1
                })
                this.loading = true
                updateMenuGrant({
                    objectId: this.objectId,
                    objectType: this.objectType
                }, {
                    menus
                }).then(res => {
                    if (res.data.success) {
                        this.$notify({
                            title: '成功',
                            message: '保存成功',
                            type: 'success',
                            duration: 2000
                        })
                        this.$emit('update')
                        this.$emit('update:visible', false)
                    } else {
                        this.$notify({
                            title: '失败',
                            message: '数据验证失败',
                            type: 'warning',
                            duration: 2000
                        })
                        this.loading = false
                    }
                }).finally(() => {
                    this.loading = false
                })
            },
            // 点击全选按钮时触发
            handleAllChecked() {
                let tree = this.$refs.tree
                let recursion = (node) => {
                    if (Array.isArray(node.children)) {
                        node.children.forEach(item => recursion(item))
                    }
                    if (!node.disabled) {
                        tree.setChecked(node, this.allChecked)
                    }
                }
                this.treeConfig.data.forEach(node => recursion(node))
                this.updateAllChecked()
            },
            // 节点选中状态发生变化时的回调
            handleCheckChange(data) {
                let tree = this.$refs.tree
                let keys = []
                let node = tree.getNode(data.menuId)
                if (node.checked) {
                    // 节点选中时，选中所有父级节点
                    let recursion = (node) => {
                        if (node.parent) {
                            recursion(node.parent)
                        }
                        if (node.level > 0) {
                            keys.push(node.data.menuId)
                        }
                    }
                    recursion(node)
                    keys.forEach(key => {
                        tree.setChecked(key, true)
                    })
                } else {
                    // 节点取消选中时，取消所有子孙节点
                    let recursion = (node) => {
                        node.childNodes.forEach(item => {
                            recursion(item)
                        })
                        keys.push(node.data.menuId)
                    }
                    recursion(node)
                    keys.forEach(key => {
                        tree.setChecked(key, false)
                    })
                }
                this.updateAllChecked()
            }
        }
    }
</script>

<style lang='scss' scoped>
.content {
    height: 80vh;
    padding: 20px;
    .head-wrap {
        padding-bottom: 20px;
        border-bottom: 1px solid #eee;
        margin-bottom: 20px;
    }
}
.custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
}
</style>
