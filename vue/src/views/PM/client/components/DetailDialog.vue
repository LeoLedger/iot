<!--
* @description 客户详情
* @fileName detailDialog.vue
* @author 望浩然
-->
<template>
    <div>
        <el-dialog
            :visible.sync="visible"
            :before-close="handleCancel"
            :close-on-click-modal="true"
            :title="'客户详情查看'"
            class="not-padding"
            width="800px"
            append-to-body
        >
            <div class="">
                <collapse-tab-layout
                    :show-tab="true"
                    :tab-list="tabList"
                    style="padding: 0 0 10px 10px;">
                    <template slot="BaseForm">
                        <BaseForm
                            v-loading="loading"
                            v-if="visible"
                            ref="BaseForm"
                            :is-edit="true"
                            :disabled="true"
                            :form-data="formModel"
                        />
                    </template>
                    <template slot="ClientContacts">
                        <ClientContacts
                            v-if="formModel.guidId"
                            ref="ClientContacts"
                            :is-edit="false"
                            :customer-id="formModel.guidId"
                        />
                        <NoData v-else text="缺少必要参数"/>
                    </template>
                    <template slot="SalesContract">
                        <SalesContract
                            v-if="formModel.guidId"
                            ref="SalesContract"
                            :customer-id="formModel.guidId"
                            style="margin-right: 10px"
                        />
                        <NoData v-else text="缺少必要参数"/>
                    </template>
                    <template slot="PayList">
                        <PayList
                            v-if="formModel.guidId"
                            :data-id="formModel.guidId"
                            :object-type="0"
                            style="margin-right: 10px"
                        />
                    </template>
                </collapse-tab-layout>
            </div>
            <span slot="footer">
                <el-button :loading="loading" size="mini" @click="handleCancel">关 闭</el-button>
            </span>
        </el-dialog>
        <contacts-dialog
            :visible="contactsDialog.visible"
            :data-id="dataId"
            :customer-id="formModel.guidId"
            @close="contactsDialog.visible = false"
            @confirm="getDetail()"
        />
    </div>
</template>

<script>
    import customerApi from '@/api/PM/customer'
    import BaseForm from '@/views/PM/client/components/BaseForm'
    import ClientContacts from '@/views/PM/client/components/ClientContacts'
    import ContactsDialog from '@/views/PM/client/components/ContactsDialog'
    import CollapseTabLayout from '@/components/CollapseTabLayout'
    import NoData from '@/components/NoData'
    import SalesContract from '@/views/PM/client/components/ContractList'
    import PayList from '@/views/PM/client/components/PayList'
    export default {
        name: 'DetailDialog',
        components: { PayList, SalesContract, NoData, CollapseTabLayout, ContactsDialog, ClientContacts, BaseForm },
        props: {
            // 客户GUID
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
                loading: false,
                activeTab: '0',
                contactsDialog: {
                    visible: false
                },
                // { type: 'success', size: 'mini', text: '联系人管理', icon: 'el-icon-setting', click: () => { this.showContacts() } }
                tabList: [
                    { name: '0',
                      label: '基础信息',
                      collapseList: [
                          { title: '基础信息', disabled: true, slotName: 'BaseForm' },
                          { title: '客户联系人',
                            button: false,
                            slotName: 'ClientContacts' }
                      ] },
                    { name: '1', label: '销售合同', slotName: 'SalesContract' },
                    { name: '2', label: '收付款记录', slotName: 'PayList' }
                ]
            }
        },
        watch: {
            visible() {
                this.getDetail()
            },
            dataId() {
                this.getDetail()
            }
        },
        mounted() {
            this.getDetail()
        },
        methods: {
            getDetail() {
                if (this.dataId) {
                    this.loading = true
                    customerApi.detail(this.dataId).then(res => {
                        if (res.success) {
                            const { areaId, cityId, provinceId } = res.data
                            // 处理坐标字段
                            let point = {}
                            if (res.data.latitude && res.data.longitude) {
                                point = { lat: res.data.latitude, lng: res.data.longitude }
                            }
                            this.formModel = Object.assign({}, res.data, point)
                            this.formModel._region = [provinceId, cityId, areaId]
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
            },
            showContacts() {
                this.contactsDialog.visible = true
            }
        }
    }
</script>

<style scoped lang="scss">
.client-dialog {
  /deep/ .el-dialog__body {
    padding: 0 !important;
  }
}
</style>
