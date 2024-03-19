<template>
    <div class="dialog-container dictSfix">
        <el-dialog
            :visible.sync="visible"
            :title="title"
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
                                    <el-form-item label="标识ID" prop="dictId">
                                        <el-input v-model="formData.dictId" clearable />
                                    </el-form-item>
                                </el-col>
                                <el-col :xs="24" :span="12">
                                    <el-form-item label="命名空间" prop="nsId">
                                        <el-select
                                            v-model="formData.nsId"
                                            :disabled="this.editId != null"
                                            filterable
                                            placeholder="请选择命名空间"
                                            size="mini"
                                            style="width:100%"
                                            @change="NsChange"
                                        >
                                            <el-option
                                                v-for="item in nsList"
                                                :key="item.nsId"
                                                :label="item.nsName"
                                                :value="item.nsId"
                                            />
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-col :xs="24" :span="12">
                                    <el-form-item label="编码" prop="dictCode">
                                        <el-input v-model="formData.dictCode" style="width:100%" />
                                    </el-form-item>
                                </el-col>
                                <el-col
                                    :xs="24"
                                    :span="12"
                                >
                                    <el-form-item label="名称" prop="dictName">
                                        <el-input v-model="formData.dictName" clearable />
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
                    @click="submitDict"
                >确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    import {
        getDictInfo,
        submintDict,
        getNSList
    } from '@/api/systemSet/dict/index'

    export default {
        name: 'Xx',
        components: {},
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            dictName: {
                type: String
            },
            editId: {
                type: [String, Number],
                default: null
            },
            title: {
                type: String
            },
            nsId: {
                type: String
            }
        },
        data() {
            return {
                nsList: [],
                formData: {
                    id: '',
                    dictId: '',
                    dictCode: '',
                    dictName: '',
                    orderNum: 0,
                    remark: '',
                    nsId: this.nsId
                },
                formRules: {
                    dictName: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请填写字典名称'
                        }
                    ],
                    nsId: [
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
                            message: '请输入字典排序'
                        }
                    ],
                    dictCode: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请输入菜单的编码'
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
                        getDictInfo({ id: val }).then(res => {
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
            this.getNSList()
        },
        methods: {
            getList() {
            },
            NsChange() {

            },
            // 直接关闭
            simpleClose() {
                this.$emit('closeDict', false)
            },
            submitDict() {
                this.$refs['form'].validate(valid => {
                    if (valid) {
                        submintDict(this.formData).then(res => {
                            if (res.data.success) {
                                this.$notify({
                                    title: '成功',
                                    message: '操作成功',
                                    type: 'success',
                                    duration: 2000
                                })
                                this.$emit('closeDict', true)
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
            },
            getNSList() {
                this.formData.nsId = this.nsId
                getNSList().then(res => {
                    const { data } = res
                    if (data.success) {
                        for (const item in data.data) {
                            const d = data.data[item]
                            this.nsList.push({
                                nsId: d.nsId,
                                nsName: d.nsName
                            })
                        }
                    }
                })
            }
        }
    }
</script>

<style lang='scss'>
    .dictSfix {
        .el-tabs__header {
            margin-bottom: 8px;
        }
        .el-tabs__content {
            height: 400px;
        }
    }
</style>
