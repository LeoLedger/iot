<template>
    <div class="dialog-container Sfix">
        <el-dialog
            :title="title"
            :visible.sync="visible"
            :before-close="simpleClose"
            width="900px"
        >
            <el-tabs>
                <el-form
                    ref="form"
                    :rules="formRules"
                    :model="formData"
                    label-width="100px"
                    class="form-container"
                    size="mini"
                >
                    <el-row
                        type="flex"
                        justify="center"
                    >
                        <el-col
                            :xs="24"
                            :lg="24"
                        >
                            <el-row>
                                <el-col :xs="24" :span="12">
                                    <el-form-item label="标识ID" prop="appId">
                                        <el-input v-model="formData.appId" :disabled="true" clearable />
                                    </el-form-item>
                                </el-col>
                                <el-col :xs="24" :span="12">
                                    <el-form-item label="编码" prop="appCode">
                                        <el-input v-model="formData.appCode" style="width:100%" />
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-col
                                    :xs="24"
                                    :span="12"
                                >
                                    <el-form-item label="名称" prop="appName">
                                        <el-input v-model="formData.appName" clearable />
                                    </el-form-item>
                                </el-col>

                                <el-col :xs="24" :span="12">
                                    <el-form-item label="排序号" prop="orderNum">
                                        <el-input v-model="formData.orderNum" clearable />
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-form-item label="站点名称" prop="appSite" :rules="[{ required: false, type: 'url', message: '请输入正确的网址', trigger: ['change'] }]">
                                    <el-input v-model.trim="formData.appSite" clearable />
                                </el-form-item>
                            </el-row>
                            <el-row>
                                <el-form-item label="描述" prop="remark">
                                    <el-input v-model="formData.remark" type="textarea" clearable />
                                </el-form-item>
                            </el-row>
                        </el-col>
                    </el-row>
                </el-form>
            </el-tabs>
            <span slot="footer">
                <el-button
                    size="mini"
                    @click="simpleClose"
                >取 消</el-button>
                <el-button
                    type="primary"
                    size="mini"
                    @click="submit"
                >确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    import {
        saveOrEditApp,
        getAppById
    } from '@/api/systemSet/application/index'

    export default {
        name: 'Xx',
        components: {},
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            title: {
                type: String
            },
            editId: {
                type: [String, Number],
                default: null
            }
        },
        data() {
            return {
                nsList: [],
                formData: {
                    id: 0,
                    appId: '',
                    appCode: '',
                    appName: '',
                    appSite: '',
                    orderNum: 0,
                    remark: '',
                    nsId: ''
                },
                formRules: {
                    appName: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请填写程序的名称'
                        }
                    ],
                    orderNum: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请输入程序的排序'
                        }
                    ],
                    appCode: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请输入程序的编码'
                        }
                    ]
                }
            }
        },
        watch: {
            editId: {
                immediate: true,
                handler(val) {
                    if (val != null) {
                        getAppById({ id: val }).then(res => {
                            if (res && res.data.success) {
                                this.formData = Object.assign(
                                    this.formData,
                                    res.data.data
                                )
                                var aa = this.formData
                            }
                        })
                    } else {
                        return false
                    }
                }
            }
        },
        created() {

        },
        methods: {
            // 直接关闭
            simpleClose() {
                this.$emit('closeApp', false)
            },
            submit() {
                this.$refs['form'].validate(valid => {
                    if (valid) {
                        saveOrEditApp(this.formData).then(res => {
                            if (res.data.success && res.data.data > 0) {
                                this.$notify({
                                    title: '成功',
                                    message: '操作成功',
                                    type: 'success',
                                    duration: 2000
                                })
                                this.$emit('closeApp', true)
                            } else {
                                this.$notify({
                                    title: '失败',
                                    message: '添加失败',
                                    type: 'warning',
                                    duration: 2000
                                })
                            }
                        })
                    } else {
                        return false
                    }
                })
            }
        }
    }
</script>

<style lang='scss'>
.Sfix {
  .el-tabs__header {
    margin-bottom: 8px;
  }
  .el-tabs__content {
    height: 400px;
  }
}
</style>
