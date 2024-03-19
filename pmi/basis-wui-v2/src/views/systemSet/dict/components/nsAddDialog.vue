<template>
    <div class="dialog-container nsSfix">
        <el-dialog
            :visible.sync="visible"
            :title="title"
            :before-close="simpleClose"
            :close-on-click-modal="false"
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
                                    <el-form-item label="标识ID" prop="nsId">
                                        <el-input v-model="formData.nsId" :disabled="true" clearable />
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-col
                                    :xs="24"
                                    :span="12"
                                >
                                    <el-form-item label="名称" prop="nsName">
                                        <el-input v-model="formData.nsName" clearable />
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-col :xs="24" :span="12">
                                    <el-form-item label="命名空间" prop="appId">
                                        <el-select
                                            v-model="formData.appId"
                                            filterable
                                            placeholder="请选择命名空间"
                                            size="mini"
                                            style="width:100%"
                                        >
                                            <el-option
                                                v-for="item in appList"
                                                :key="item.appId"
                                                :label="item.appName"
                                                :value="item.appId"
                                            />
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-col :xs="24" :span="12">
                                    <el-form-item label="排序号" prop="orderNum">
                                        <el-input v-model="formData.orderNum" clearable />
                                    </el-form-item>
                                </el-col>
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
                    @click="submitNS"
                >确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    import {
        submintNS
    } from '@/api/systemSet/dict/index'
    import {
        getAllAppList
    } from '@/api/systemSet/application/index'

    export default {
        name: 'Xxss',
        components: {},
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            nsName: {
                type: String
            },
            editId: {
                type: [String, Number],
                default: null
            },
            title: {
                type: String
            }
        },
        data() {
            return {
                appList: [],
                formData: {
                    id: 0,
                    nsId: '',
                    nsName: '',
                    orderNum: 0,
                    remark: '',
                    appId: ''
                },
                formRules: {
                    nsName: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请填写名称'
                        }
                    ],
                    appId: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请选择命名空间'
                        }
                    ],
                    orderNum: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请输入排序'
                        }
                    ]
                }
            }
        },
        watch: {

        },
        created() {
            this.getAppList()
        },
        methods: {
            getAppList() {
                getAllAppList().then(res => {
                    const { data } = res
                    if (data.success) {
                        for (const appItem in data.data) {
                            const d = data.data[appItem]
                            this.appList.push({
                                appId: d.appId,
                                appName: d.appName
                            })
                        }
                    }
                })
            },
            // 直接关闭
            simpleClose() {
                this.$emit('closeNS', false)
            },
            submitNS() {
                this.$refs['form'].validate(valid => {
                    if (valid) {
                        submintNS(this.formData).then(res => {
                            if (res.data.success) {
                                this.$notify({
                                    title: '成功',
                                    message: '操作成功',
                                    type: 'success',
                                    duration: 2000
                                })
                                this.$emit('closeNS', true)
                            } else {
                                this.$notify({
                                    title: '失败',
                                    message: '数据验证失败',
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
    .nsSfix {
        .el-tabs__header {
            margin-bottom: 8px;
        }
        .el-tabs__content {
            height: 400px;
        }
    }
</style>
