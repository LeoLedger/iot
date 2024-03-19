<template>
    <div class="dialog-container Sfix">
        <el-dialog
            :title="title"
            :visible.sync="visible"
            :before-close="simpleClose"
            append-to-body
            with="520px"
        >
            <el-form
                v-show="dataType === 'node'"
                ref="dataForm"
                class="dataForm"
                :model="activity"
                label-width="80px"
            >
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="标志">
                            <el-input v-model="activity.identifier" disabled />
                        </el-form-item>
                        <el-form-item label="Code">
                            <el-input v-model="activity.code" />
                        </el-form-item>
                        <el-form-item label="动态时限">
                            <el-input v-model="activity.limitService" />
                        </el-form-item>
                        <el-form-item label="时限">
                            <el-input v-model="activity.limit" />
                        </el-form-item>
                        <el-form-item label="对象服务">
                            <el-input v-model="activity.runtimeTargetService" />
                        </el-form-item>
                        <el-form-item label="路由服务">
                            <el-input v-model="activity.runtimeRouteService" />
                        </el-form-item>
                        <el-form-item label="可撤件">
                            <el-switch v-model="isRevoke" />
                        </el-form-item>
                        <el-form-item label="颜色">
                            <el-input v-model="activity.color" />
                        </el-form-item>
                        <el-form-item label="合并Code">
                            <el-input v-model="activity.mergeCodeLength" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="名称">
                            <el-input v-model="activity.name" />
                        </el-form-item>
                        <el-form-item label="办理用户">
                            <DialogPick
                                v-model="activity"
                                :params="{ prop: 'target:user', title: '选择办理用户', labelKey: 'name', formKey: ['id', 'name'], dataKey: ['userId', 'userName'], multiple: true, clearable: true }"
                                type="user"
                            />
                        </el-form-item>
                        <el-form-item label="办理角色">
                            <DialogPick
                                v-model="activity"
                                :params="{ prop: 'target:role', title: '选择办理角色', labelKey: 'name', formKey: ['id', 'name'], dataKey: ['roleId', 'roleName'], multiple: true, clearable: true }"
                                type="role"
                            />
                        </el-form-item>
                        <el-form-item label="办理部门">
                            <DialogPick
                                v-model="activity"
                                :params="{ prop: 'target:dept', title: '选择办理部门', labelKey: 'name', formKey: ['id', 'name'], dataKey: ['deptId', 'deptName'], multiple: true, clearable: true }"
                                type="dept"
                            />
                        </el-form-item>
                        <el-form-item label="合并服务">
                            <el-input v-model="activity.runtimeMergeService" />
                        </el-form-item>
                        <el-form-item label="开始服务">
                            <el-input v-model="activity.runtimeBeginService" />
                        </el-form-item>
                        <el-form-item label="结束服务">
                            <el-input v-model="activity.runtimeEndService" />
                        </el-form-item>
                        <el-form-item label="可退件">
                            <el-switch v-model="isUntread" />
                        </el-form-item>
                        <el-form-item label="排序">
                            <el-input v-model="activity.orderNum" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <div class="footer">
                    <el-button icon="el-icon-close">
                        重置
                    </el-button>
                    <el-button
                        type="primary"
                        icon="el-icon-check"
                        @click="save"
                    >
                        保存
                    </el-button>
                </div>
            </el-form>
            <el-form
                v-show="dataType === 'line'"
                ref="dataForm"
                :model="activity"
                label-width="80px"
            >
                <el-form-item label="运行服务">
                    <el-input v-model="activity.runtimeService" />
                </el-form-item>
                <el-form-item label="接受对象">
                    <el-input v-model="activity.runtimeTarget" />
                </el-form-item>
                <el-form-item label="排序">
                    <el-input v-model="activity.orderNum" />
                </el-form-item>
                <el-form-item>
                    <el-button icon="el-icon-close">
                        重置
                    </el-button>
                    <el-button
                        type="primary"
                        icon="el-icon-check"
                        @click="saveLine"
                    >
                        保存
                    </el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: 'NodeProperty',
        props: {
            visible: { type: Boolean, default: false },
            title: { type: String, default: '' },
            dataType: { type: String, default: 'node' }
        },
        data() {
            return {
                activity: {},
                isUntread: false,
                isRevoke: false
            }
        },
        methods: {
            nodeInit(obj) {
                (obj.extList || []).forEach(item => {
                    if (['target:user', 'target:role', 'target:dept'].includes(item.key)) {
                        try {
                            obj[item.key] = JSON.parse(item.value)
                        } catch (e) {}
                    }
                })
                this.activity = { ...obj }
                this.isUntread = obj.isUntread === 1
                this.isRevoke = obj.isRevoke === 1
            },
            simpleClose() {
                this.$emit('closeNodeProperty', false)
            },
            // 修改连线
            saveLine() {
                this.$emit('setLineLabel', this.activity)
            },
            save() {
                var extList = this.activity.extList || [];
                ['target:user', 'target:role', 'target:dept'].forEach(name => {
                    var index = extList.findIndex(v => v.key === name)
                    if (index > -1) {
                        extList[index].value = JSON.stringify(this.activity[name] || [])
                    } else {
                        extList.push({
                            key: name,
                            value: JSON.stringify(this.activity[name] || [])
                        })
                    }
                })
                this.activity.extList = extList
                this.activity.isUntread = this.isUntread ? 1 : 0
                this.activity.isRevoke = this.isRevoke ? 1 : 0
                this.$emit('changeActivity', this.activity)
            }
        }
    }
</script>

<style scoped>
.footer{
  text-align: center;
}
</style>
