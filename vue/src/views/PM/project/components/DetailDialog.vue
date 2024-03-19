<!--
* @description 项目信息
* @author yc
!-->
<template>
    <div>
        <el-dialog
            :visible="visible"
            title="项目详情"
            width="800px"
            class="not-padding"
            append-to-body
            @close="$emit('update:visible', false)"
        >
            <div v-loading="loading">
                <el-collapse v-model="collapseValue" class="layou-collapse layout-detail-container">
                    <el-collapse-item name="1" disabled>
                        <div slot="title" class="title">
                            <div class="text">基础信息</div>
                        </div>
                        <div class="body-wrap">
                            <BaseForm
                                ref="BaseForm"
                                :form-data="formData"
                            />
                        </div>
                    </el-collapse-item>
                    <el-collapse-item name="2">
                        <div slot="title" class="title">
                            <div class="text">项目成员</div>
                        </div>
                        <div class="body-wrap">
                            <ProjectMember
                                ref="ProjectMember"
                                :data-list="formData.list"
                                :is-edit="false"
                            />
                        </div>
                    </el-collapse-item>
                    <el-collapse-item name="3">
                        <div slot="title" class="title">
                            <div class="text">运营标段</div>
                            <el-button type="primary" @click="handleExportSection">导出</el-button>
                        </div>
                        <div class="body-wrap">
                            <ProjectSection
                                ref="ProjectSection"
                                :form-data="formData"
                            />
                        </div>
                    </el-collapse-item>
                </el-collapse>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    // API
    import projectApi from '@/api/PM/project'
    // 方法
    // 组件
    import BaseForm from './BaseForm'
    import ProjectMember from './ProjectMember'
    import ProjectSection from './ProjectSection'

    export default {
        name: 'DetailDialog',
        components: {
            BaseForm,
            ProjectMember,
            ProjectSection
        },
        props: {
            visible: { type: Boolean, default: false },
            dataId: { type: [Number, String] }
        },
        data() {
            return {
                loading: false,
                formData: {},
                tabActiveName: '1',
                collapseValue: ['1', '2', '3']
            }
        },
        computed: {

        },
        watch: {
            dataId: {
                immediate: true,
                handler() {
                    this.queryBaseInfo()
                }
            }
        },
        mounted() {
        },
        methods: {
            // 获取基础信息
            async queryBaseInfo() {
                if (this.dataId) {
                    this.loading = true
                    var { data } = await projectApi.detail(this.dataId)
                    var _region = []
                    var _period = []
                    if (data.provinceId && data.areaId && data.cityId) {
                        _region = [data.provinceId, data.cityId, data.areaId]
                    }
                    if (data.startDate && data.endDate) {
                        _period = [data.startDate, data.endDate]
                    }
                    data.ipList = data.ipList || []
                    this.formData = {
                        ...data,
                        _region,
                        _period,
                        empowerIpCount: data.ipList.length
                    }
                    this.loading = false
                }
            },
            // 导出运营标段
            handleExportSection() {
                projectApi.exportSection({ id: this.dataId })
            }
        }
    }
</script>

<style lang='scss' scoped>
</style>
