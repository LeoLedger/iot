<template>
    <div class="dialog-container classSfix">
        <el-dialog
            :visible.sync="visible"
            :title="title"
            :before-close="simpleClose"
            width="900px"
        >
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
                                <el-form-item label="名称" prop="name">
                                    <el-input v-model="formData.name" clearable />
                                </el-form-item>
                            </el-col>
                            <el-col :xs="24" :span="12">
                                <el-form-item label="上级节点" prop="classPid">
                                    <el-cascader
                                        v-model="formData.classPid"
                                        :options="classTree"
                                        :props="{checkStrictly: true,emitPath:false,expandTrigger:'hover'}"
                                        clearable
                                        filterable
                                        style="width: 100%"
                                    />
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :xs="24" :span="12">
                                <el-form-item label="编码" prop="code">
                                    <el-input v-model="formData.code" style="width:100%" />
                                </el-form-item>
                            </el-col>
                            <el-col :xs="24" :span="12">
                                <el-form-item label="类别" prop="type">
                                    <el-select v-model="formData.type" placeholder="请选择类别" style="width:100%">
                                        <el-option
                                            v-for="item in typeData"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :xs="24" :span="12">
                                <el-form-item label="单位" prop="unit">
                                    <el-input v-model="formData.unit" style="width:100%" />
                                </el-form-item>
                            </el-col>
                            <el-col
                                :xs="24"
                                :span="12"
                            >
                                <el-form-item label="时限（秒）" prop="handleLimit">
                                    <el-input v-model="formData.handleLimit" clearable />
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :xs="24" :span="12">
                                <el-form-item label="扣分" prop="deductScore">
                                    <el-input v-model="formData.deductScore" style="width:100%" />
                                </el-form-item>
                            </el-col>
                            <el-col
                                :xs="24"
                                :span="12"
                            >
                                <el-form-item label="扣款" prop="deductMoney">
                                    <el-input v-model="formData.deductMoney" clearable />
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
                <el-button size="mini" @click="simpleClose">取 消</el-button>
                <el-button type="primary" size="mini" @click="submitClass">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    import {
        getClassInfo,
        addOrEditClass,
        getClassTree
    } from '@/api/systemSet/class/index'

    export default {
        name: 'Xx',
        components: {},
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            name: {
                type: String
            },
            editId: {
                type: String,
                default: null
            },
            title: {
                type: String
            },
            cpId: {
                type: String
            }
        },
        data() {
            return {
                classTree: [],
                typeData: [{
                    value: 14001,
                    label: '类别'
                }, {
                    value: 14002,
                    label: '大类'
                }, {
                    value: 14003,
                    label: '小类'
                }],
                nsList: [],
                formData: {
                    id: 0,
                    classId: '',
                    code: '',
                    type: '',
                    name: '',
                    classPid: '',
                    handleLimit: 0,
                    unit: '',
                    deductScore: 0,
                    deductMoney: 0,
                    orderNum: 0,
                    remark: ''
                },
                formRules: {
                    name: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请填写类型名称'
                        }
                    ],
                    type: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请选择类型'
                        }
                    ],
                    orderNum: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请输入类型排序'
                        }
                    ],
                    code: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请输入编码'
                        }
                    ]
                }
            }
        },
        watch: {
            cpId: {
                immediate: true,
                handler(val) {
                    this.formData.classPid = val
                }
            },
            editId: {
                immediate: true,
                handler(val) {
                    if (val != null) {
                        const slef = this
                        getClassInfo({ classId: val }).then(res => {
                            if (res && res.data.success) {
                                slef.formData = Object.assign(
                                    this.formData,
                                    res.data.data
                                )
                                var aa = slef.formData
                            }
                        })
                    } else {
                        return false
                    }
                }
            }
        },
        created() {
            this.getClassTree()
        },
        methods: {
            // 获取类型数据
            getClassTree() {
                getClassTree().then(res => {
                    if (res && res.data.success) {
                        this.classTree = res.data.data
                    }
                })
            },
            // 直接关闭
            simpleClose() {
                this.$emit('closeClass', false)
            },
            submitClass() {
                this.$refs['form'].validate(valid => {
                    if (valid) {
                        addOrEditClass(this.formData).then(res => {
                            if (res.data.success) {
                                this.$notify({
                                    title: '成功',
                                    message: '操作成功',
                                    type: 'success',
                                    duration: 2000
                                })
                                this.$emit('closeClass', true)
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
    .classSfix {
        .el-tabs__header {
            margin-bottom: 8px;
        }
        .el-tabs__content {
            height: 400px;
        }
    }
</style>
