<!--
* @fileName 库存管理 - 仓库添加/编辑/详情
* @author   望浩然
* @date     2021/4/6
-->

<template>
    <div>
        <el-dialog
            v-if="visible"
            :visible.sync="visible"
            :before-close="handleCancel"
            :close-on-click-modal="false"
            :title="dialogTitle"
            class="not-top-padding"
            width="820px"
            append-to-body>
            <el-tabs v-model="activeTab">
                <el-tab-pane name="0" label="基础信息" style="height: 400px">
                    <BaseForm
                        ref="BaseForm"
                        :is-edit="true"
                        :disabled="type === 'detail'"
                        :form-data="ruleForm"/>
                </el-tab-pane>
                <el-tab-pane name="1" label="包含仓位" style="height: 400px">
                    <div class="group-container">
                        <div v-for="(item, index) in groupTree" :key="index" class="group-item">
                            <template>
                                <div class="label">
                                    <div class="text">{{ item.name }}</div>
                                </div>
                                <div class="children">
                                    <div
                                        v-for="(child, cIndex) in item.children"
                                        v-show="type !== 'detail' || child.wsType === 1"
                                        :class="{ active: child.wsType === 1 }"
                                        :key="cIndex"
                                        class="item"
                                        @click="onClickGroupChild(child)">
                                        {{ child.name }}
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </el-tab-pane>
                <el-tab-pane v-if="type === 'detail'" name="2" label="仓库动态" style="height: 400px">
                    <group-log-table
                        :guid-id="ruleForm.guidId"
                        :product-category="productCategory"
                    />
                </el-tab-pane>
            </el-tabs>
            <span slot="footer">
                <el-button size="mini" @click="handleCancel">关 闭</el-button>
                <el-button v-prereclick v-if="type !== 'detail'" :loading="loading" size="mini" type="primary" @click="handleSubmit">保 存</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import BaseForm from '@/views/inventoryManagement/warehouses/groupEditBaseForm'
    import GroupLogTable from '@/views/inventoryManagement/warehouses/groupLogTable'
    import warehousesApi from '@/api/inventory/warehouses'
    const defaultRuleForm = {
        name: '',
        type: 0,
        sort: '0',
        address: '',
        remark: '',
        adminName: '',
        adminUserid: ''
    }
    export default {
        name: 'Edit',
        components: { GroupLogTable, BaseForm },
        props: {
            // 数据ID
            dataId: {
                type: String,
                default: null
            },
            // 用来识别本窗口表单类型: 创建:create 修改:edit 详情:detail
            type: {
                type: String,
                default: 'create'
            },
            // 窗口可视属性
            visible: {
                type: Boolean,
                default: false
            },
            productCategory: String
        },
        data() {
            return {
                ruleForm: Object.assign({}, defaultRuleForm),
                // 各种列表数据
                typeList: [], // 仓库类型
                groupTree: [], // 仓位类型数据
                // 标签
                activeTab: '0',
                // 加载
                loading: false
            }
        },
        computed: {
            // 通过type获取窗口名称
            dialogTitle() {
                if (this.type === 'create') return '添加仓库'
                if (this.type === 'edit') return '编辑仓库信息'
                if (this.type === 'detail') return '仓库详情查看'
            },
            groupChildVisible() {
                return (item) => {
                    // 详情模式，只显示已拥有仓位
                    if (this.type === 'detail') {
                        return item.wsType === 1
                    } else return true
                }
            }
        },
        watch: {
            // 监听dataId重新初始化表单数据
            dataId(val) {
                this.init()
            },
            visible() {
                this.init()
            }
        },
        mounted() {
            this.init()
        },
        methods: {
            init() {
                // 获取仓位列表数据
                warehousesApi.getShippingSpaceList().then(res => {
                    const groupList = res.data
                    // 最终输出树状数据
                    this.groupTree = this.getGroupTree(groupList)
                    // 根据表单类型初始化
                    if (this.type === 'create') {
                        this.ruleForm = Object.assign({}, defaultRuleForm)
                        this.ruleForm.files = []
                    } else {
                        this.getDetail()
                    }
                })
            },
            // 通过dateId获取表单数据
            getDetail() {
                if (this.dataId) {
                    this.loading = true
                    warehousesApi.detail(this.dataId).then(res => {
                        if (res.success) {
                            this.ruleForm = res.data
                            // 激活的仓位列表
                            const enableGroupList = res.data.listWss || []
                            // 遍历groupTree和enableGroupTree,将已包含的仓位设置为true
                            this.groupTree.map(item => {
                                item.children.map(cItem => {
                                    enableGroupList.map(eItem => {
                                        if (eItem.productType === cItem.productType && eItem.name === cItem.name) {
                                            cItem.wsType = eItem.wsType
                                        }
                                    })
                                })
                            })
                        }
                        setTimeout(() => {
                            this.loading = false
                        }, 500)
                    })
                }
            },
            // 数据字典
            getShippingSpaceList() {
                // 获取仓库类型列表
                this.typeList = [
                    { id: 1, name: '实体仓库' },
                    { id: 2, name: '虚拟仓库' }
                ]
                this.groupTree = []
                // 获取仓位列表数据
                warehousesApi.getShippingSpaceList().then(res => {
                    const groupList = res.data
                    // 最终输出树状数据
                    this.groupTree = this.getGroupTree(groupList)
                })
            },
            getGroupTree(groupList) {
                // 初始化类型数组
                const arr_typeName = []
                // 首先拿出所有类型
                groupList.map(item => {
                    if (item.productTypeName && arr_typeName.indexOf(item.productTypeName) < 0) {
                        arr_typeName.push(item.productTypeName)
                    }
                })
                // 一维数组转二维
                const objArr_typeName = []
                arr_typeName.map((item, index) => {
                    objArr_typeName.push({ key: index, name: item, children: [] })
                })
                // 往类型二维数组的children中添加仓位数据
                objArr_typeName.map(item => {
                    groupList.map(item_ => {
                        if (item.name === item_.productTypeName) {
                            item.children.push(item_)
                        }
                    })
                })
                return objArr_typeName
            },
            onClickGroupChild(child) {
                console.log('child', child.wsType)
                if (this.type !== 'detail') {
                    this.$set(child, 'wsType', child.wsType === 1 ? 0 : 1)
                    // 强制刷新视图
                    this.$nextTick(() => {
                        this.$forceUpdate()
                    })
                }
            },
            handleSubmit() {
                this.loading = true
                this.$refs.BaseForm.submit((data) => {
                    // 将groupTree转list
                    let groupList = []
                    this.groupTree.map(item => {
                        groupList = groupList.concat(item.children)
                    })
                    // 判断是否至少有一个仓位
                    let hasOne = false
                    groupList.map(item => {
                        if (item.wsType === 1) {
                            hasOne = true
                        }
                    })
                    if (!hasOne) {
                        this.loading = false
                        return this.$message({ type: 'warning', message: '请至少选择一个仓位' })
                    }
                    warehousesApi.update({
                        ...this.ruleForm,
                        ...data,
                        listWss: groupList
                    }).then(res => {
                        if (res.success) {
                            this.$notify({
                                title: '保存成功',
                                message: res.msg,
                                type: 'success',
                                duration: 2000
                            })
                            this.$emit('confirm')
                            this.$emit('close', true)
                        }
                    }).finally(() => {
                        this.loading = false
                    })
                })
            },
            handleCancel() {
                this.$emit('close', false)
            }
        }
    }
</script>

<style scoped lang="scss">
.group-container {
  .group-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
    .label {
      border-bottom: 1px solid #f5f7fa;
      padding: 0 10px;
      height: 35px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      .text {
        font-size: 13px;
        &:before {
          height: 10px;
          content: '';
          width:0;
          border-left: 3px solid #2abeff;
          margin-right: 10px;
        }
      }
    }
    .children {
      display: flex;
      flex-direction: row;
      .item {
        min-width: 120px;
        padding: 5px 20px;
        text-align: center;
        color: #2a2a2a;
        background: #e4e4e4;
        margin-right: 10px;
        border-radius: 20px;
        &.active {
          background: #13C2C2;
          color: white;
        }
      }
    }
  }
}
</style>
