<template>
    <div class="dialog-container menusfix">
        <el-dialog
            :before-close="beforeClose"
            :title="str+'区域'"
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
                        <el-row v-if="editId!=null">
                            <el-col
                                :span="24"
                                :xs="24"
                            >
                                <el-form-item
                                    label="区域Id"
                                    prop="mapId"
                                >
                                    <el-input v-model="formData.mapId" :disabled="true" />
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col
                                :span="12"
                                :xs="24"
                            >
                                <el-form-item
                                    label="区域名称"
                                    prop="name"
                                >
                                    <el-input
                                        v-model="formData.name"
                                        clearable
                                    />
                                </el-form-item>
                            </el-col>
                            <el-col
                                :span="12"
                                :xs="24"
                            >
                                <el-form-item
                                    label="父节点"
                                    prop="mapPid"
                                >
                                    <el-cascader
                                        v-model="formData.mapPid"
                                        :options="treeData"
                                        :props="{ checkStrictly: true }"
                                        clearable
                                        filterable
                                        size="mini"
                                        style="width:100%"
                                    />
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col
                                :span="12"
                                :xs="24"
                            >
                                <el-form-item label="编码" prop="code">
                                    <el-input
                                        v-model="formData.code"
                                        clearable
                                    />
                                </el-form-item>
                            </el-col>
                            <el-col
                                :span="12"
                                :xs="24"
                            >
                                <el-form-item label="类型" prop="mapType" style="width:100%">
                                    <el-select
                                        v-model="formData.mapType"
                                        placeholder="类型"
                                        size="mini"
                                        style="width:100%"
                                    >
                                        <el-option
                                            v-for="item in mapTypeData"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                        />
                                    </el-select>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <el-row>
                            <el-col
                                :span="12"
                                :xs="24"
                            >
                                <el-form-item
                                    label="排序"
                                    prop="orderNum"
                                >
                                    <el-input-number
                                        v-model="formData.orderNum"
                                        :min="0"
                                        style="width:100%"
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
        getMapInfo,
        handlerMap
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
            treeData: {
                type: Array
            },
            editId: {
                type: [String, Number],
                default: null
            }
        },
        data() {
            return {
                formData: {
                    mapId: null,
                    mapPid: null,
                    code: null,
                    name: null,
                    mapType: null,
                    remark: null,
                    orderNum: null
                },
                selectedValue: null,
                formRules: {
                    name: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请填写区域名'
                        }
                    ],
                    code: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请输入区域编号'
                        }
                    ],

                    mapType: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请选择区域类型'
                        }
                    ],
                    orderNum: [
                        {
                            required: true,
                            trigger: 'change',
                            message: '请输入排序'
                        }
                    ]

                },
                mapTypeData: this.$store.getters.mapType
            }
        },
        watch: {
            editId: {
                immediate: true,
                handler(val) {
                    if (val != null) {
                        getMapInfo({ id: val }).then(res => {
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
                        // done();  不能使用done 否则会直接操作模态框
                        this.$nextTick(() => {
                            this.$emit('closeMap', false)
                            // this.$refs.form.resetFields();
                        })
                    })
                    .catch(_ => {
                        return false
                    })
            },
            // 直接关闭
            simpleClose() {
                this.$emit('closeMap', false)
            },
            // 提交
            submitMap() {
                this.$refs['form'].validate(valid => {
                    if (valid) {
                        this.formData = Object.assign(this.formData)
                        handlerMap(this.formData).then(res => {
                            if (res.data.success) {
                                this.$notify({
                                    title: '成功',
                                    message: this.str + '成功',
                                    type: 'success',
                                    duration: 2000
                                })
                                this.$emit('closeMap', true)
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
