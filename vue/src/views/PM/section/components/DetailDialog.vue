<template>
    <div>
        <el-dialog
            :visible.sync="visible"
            :before-close="handleCancel"
            :close-on-click-modal="false"
            :title="'标段详情查看'"
            width="800px"
            append-to-body
            class="not-padding"
        >
            <collapse-tab-layout
                :show-tab="false"
                :collapse-list="collapseList"
                style="padding: 10px 0 10px 10px;">
                <template slot="BaseForm">
                    <BaseForm
                        v-if="visible"
                        ref="BaseForm"
                        :loading="loading"
                        :is-edit="true"
                        :disabled="true"
                        :form-data="formModel"/>
                </template>
                <template slot="SectionMember">
                    <SectionMember
                        ref="SectionMember"
                        :is-edit="false"
                        :data-list="formModel.list"
                    />
                </template>
                <template slot="SectionContract">
                    <SectionContract
                        ref="SectionContract"
                        :is-edit="false"
                        :data-id="formModel.guidId"
                    />
                </template>
                <template slot="RunningDevice">
                    <RunningDevice
                        ref="RunningDevice"
                        :data-id="formModel.guidId"
                        :cate-list="formModel.map"
                    />
                </template>
            </collapse-tab-layout>
            <span slot="footer">
                <el-button size="mini" @click="handleCancel">关 闭</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import BaseForm from '@/views/PM/section/components/BaseForm'
    import SectionMember from '@/views/PM/section/components/SectionMember'
    import SectionContract from '@/views/PM/section/components/SectionContract'
    import sectionApi from '@/api/PM/section'
    import NoData from '@/components/NoData'
    import CollapseTabLayout from '@/components/CollapseTabLayout'
    import RunningDevice from '@/views/PM/section/components/RunningDevice'
    export default {
        name: 'DetailDialog',
        components: { RunningDevice, CollapseTabLayout, NoData, SectionContract, SectionMember, BaseForm },
        props: {
            dataId: {
                type: String,
                default: null
            },
            visible: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                formModel: {},
                deviceMap: {},
                loading: false,
                collapseList: [
                    { title: '基础信息', disabled: true, slotName: 'BaseForm' },
                    { title: '服务企业标段成员', button: false, slotName: 'SectionMember' },
                    { title: '标段合同', button: false, slotName: 'SectionContract' },
                    { title: '运营设备', button: false, slotName: 'RunningDevice' }
                ]
            }
        },
        watch: {
            dataId() {
                this.getDetail()
            }
        },
        mounted() {
            this.getDetail()
        },
        methods: {
            getDetail() {
                this.formModel = Object.assign({}, this.formModel)
                if (this.dataId) {
                    this.loading = true
                    sectionApi.detail(this.dataId).then(res => {
                        if (res.success) {
                            this.formModel = res.data
                            let _period = []
                            if (res.data.startDate && res.data.endDate) {
                                _period = [res.data.startDate, res.data.endDate]
                            }
                            // 处理坐标字段
                            let point = {}
                            if (res.data.latitude && res.data.longitude) {
                                point = { lat: res.data.latitude, lng: res.data.longitude }
                            }
                            const obj = res.data.map
                            for (let key in obj) {
                                if (obj[key] < 1) {
                                    delete obj[key]
                                }
                            }
                            this.formModel = { ...res.data, _period, point }
                            console.log('aaa', obj)
                            this.memberList = res.data.list
                        }
                        setTimeout(() => {
                            this.loading = false
                        }, 500)
                    })
                }
            },
            handleCancel() {
                this.$emit('close', false)
                this.$emit('update:visible')
            }
        }
    }
</script>

<style scoped lang="scss">
</style>
