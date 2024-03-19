<template>
    <div class="dialog-container Sfix">
        <el-dialog
            :title="title"
            :visible.sync="visible"
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
                                    <el-form-item label="日期" prop="date">
                                        <el-input v-model="formData.date" :disabled="true" clearable />
                                    </el-form-item>
                                </el-col>
                                <el-col :xs="24" :span="12">
                                    <el-form-item label="星期" prop="week">
                                        <el-input v-model="formData.week" style="width:100%" :disabled="true" />
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row>
                                <el-col
                                    :xs="24"
                                    :span="12"
                                >
                                    <el-form-item label="类型" prop="type">
                                        <el-select v-model="formData.type" placeholder="请选择日期类型">
                                            <el-option v-for="item in selectOptions" :key="item.value" :value="item.value" :label="item.name" />
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row />
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
        saveOrEditVacation,
        getVacationById
    } from '@/api/systemSet/vacationConfig/index'

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
                    type: '',
                    date: '',
                    week: '',
                    remark: ''
                },
                selectOptions: [
                    {
                        value: 0,
                        name: '工作日'
                    },
                    {
                        value: 1,
                        name: '节假日'
                    }
                ],
                formRules: {
                    type: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请选择日期的类型'
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
                        getVacationById({ id: val }).then(res => {
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
            // 直接关闭
            simpleClose() {
                this.$emit('close', false)
            },
            submit() {
                this.$refs['form'].validate(valid => {
                    if (valid) {
                        saveOrEditVacation(this.formData).then(res => {
                            if (res.data.success) {
                                this.$notify({
                                    title: '成功',
                                    message: '操作成功',
                                    type: 'success',
                                    duration: 2000
                                })
                                this.$emit('close', true)
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
.Sfix {
  .el-tabs__header {
    margin-bottom: 8px;
  }
  .el-tabs__content {
    height: 400px;
  }
}
</style>
