<template>
    <div class="dialog-container menusfix">
        <el-dialog
            :before-close="beforeClose"
            :title="str+'区域树'"
            :visible.sync="visible"
            width="800px"
        >
            <el-form
                ref="form"
                :model="formData"
                :rules="formRules"
                class="form-container"
                label-width="100px"
                size="mini"
            >
                <el-row
                    justify="center"
                    type="flex"
                >
                    <el-col
                        :lg="24"
                        :xs="24"
                    >
                        <el-row v-if="editTreeId!=null">
                            <el-col
                                :span="24"
                                :xs="24"
                            >
                                <el-form-item
                                    label="区域树Id"
                                    prop="mapTreeId"
                                >
                                    <el-input v-model="formData.mapTreeId" :disabled="true" />
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row>
                            <el-col
                                :span="12"
                                :xs="24"
                            >
                                <el-form-item
                                    label="区域树名称"
                                    prop="name"
                                >
                                    <el-input
                                        v-model="formData.name"
                                        clearable
                                    />
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row>
                            <el-col
                                :span="24"
                                :xs="24"
                            >
                                <el-form-item
                                    label="备注"
                                    prop="remark"
                                >
                                    <el-input
                                        v-model="formData.remark"
                                        clearable
                                        rows="3"
                                        type="textarea"
                                    />
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-col>
                </el-row>
            </el-form>

            <span slot="footer">
                <el-button
                    v-waves
                    size="mini"
                    @click="simpleClose"
                >取 消</el-button>
                <el-button
                    v-prereclick
                    v-waves
                    size="mini"
                    type="primary"
                    @click="submitMap"
                >确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>

    import {
        getMapTreeDefineInfo,
        handlerMapTreeDefine
    } from '@/api/map/index'

    export default {
        name: 'Xx',
        components: {},
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            str: {
                type: String
            },
            editTreeId: {
                type: [String, Number],
                default: null
            }
        },
        data() {
            return {
                formData: {
                    mapTreeId: null,
                    name: null,
                    remark: null
                },
                formRules: {
                    name: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请填写区域树名'
                        }
                    ]
                }
            }
        },
        watch: {
            editTreeId: {
                immediate: true,
                handler(val) {
                    if (val != null) {
                        getMapTreeDefineInfo({ id: val }).then(res => {
                            if (res && res.data.success) {
                                this.formData = Object.assign(
                                    this.formData,
                                    res.data.data
                                )
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
            // 确认关闭
            beforeClose() {
                this.$confirm('确认放弃本次操作？')
                    .then(_ => {
                        this.$nextTick(() => {
                            this.$emit('closeMapTree', false)
                        })
                    })
                    .catch(_ => {
                        return false
                    })
            },
            // 直接关闭
            simpleClose() {
                this.$emit('closeMapTree', false)
            },
            // 提交
            submitMap() {
                this.$refs['form'].validate(valid => {
                    if (valid) {
                        this.formData = Object.assign(this.formData)
                        handlerMapTreeDefine(this.formData).then(res => {
                            if (res.data.success) {
                                this.$notify({
                                    title: '成功',
                                    message: this.str + '成功',
                                    type: 'success',
                                    duration: 2000
                                })
                                this.$emit('closeMapTree', true)
                            } else {
                                this.$notify({
                                    title: '失败',
                                    message: '数据操作失败',
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
    .menusfix {
        .el-tabs__header {
            margin-bottom: 8px;
        }

        .el-tabs__content {
            height: 400px;
            overflow-y: scroll;
        }
    }
</style>
