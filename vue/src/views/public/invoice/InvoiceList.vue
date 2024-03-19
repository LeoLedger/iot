<!--
* @description 发票列表
* @author yc
!-->
<template>
    <div class="invoice-list">
        <div
            v-for="(item, index) in dataList"
            :key="index"
            class="item"
        >
            <div class="item-wrap">
                <div class="head">
                    <span class="title">{{ item.type | getDictLabel('invoiceType') }}</span>
                    <span class="tip" v-if="item.type !== 2 && item.cancellation === 1">已作废</span>
                    <span class="date">{{ item.invoiceDate | dateFormat('YYYY-MM-DD') }}</span>
                </div>
                <div v-if="item.type === 2" class="body type2">
                    <div class="rows">
                        <div class="cell">编号：{{ item.code }}</div>
                    </div>
                    <div class="rows">
                        <div class="cell bold">合计金额：{{ item.amount | moneyFormat }}</div>
                    </div>
                </div>
                <div v-else class="body type1">
                    <div class="rows">
                        <div class="cell">代码：{{ item.code }}</div>
                        <div class="cell">号码：{{ item.number }}</div>
                    </div>
                    <div class="rows">
                        <div class="cell">校验码：{{ item.checkCode }}</div>
                    </div>
                    <div class="rows">
                        <div class="cell">金额合计(不含税)：{{ item.amount | moneyFormat }}</div>
                        <div class="cell">税额合计：{{ item.tax | moneyFormat }}</div>
                    </div>
                    <div class="rows">
                        <div class="cell bold">价税合计(含税)：{{ item.levied | moneyFormat }}</div>
                    </div>
                </div>
                <div class="foot">
                    <!-- <el-link v-if="showReplaceBtn" type="danger" @click="handleUpdateFiles(item)">替换发票</el-link> -->
                    <el-link v-if="showReplaceBtn && item.cancellation === 0" type="danger" @click="handleInvalidate(item)">作废</el-link>
                    <el-link type="primary" @click="handleUpdate(item)">查看</el-link>
                    <el-link v-if="isEdit" type="danger" @click="handleDelete(index)">删除</el-link>
                    <!-- <el-link type="primary" @click="handleUpdateFiles(item)" v-if="item.type !== 2 && isUpdateFiles">更换发票附件</el-link> -->
                </div>
            </div>
        </div>
        <NoData v-if="!dataList.length" text="暂无数据"/>
        <InvoiceDialog
            v-if="invoiceDialog.visible"
            v-bind="invoiceDialog"
            :visible.sync="invoiceDialog.visible"
            @submitFiles="handleSubmitFiles"
        />
    </div>
</template>

<script>
    // API
    // 方法
    // 组件
    import NoData from '@/components/NoData'
    import InvoiceDialog from './InvoiceDialog'

    export default {
        components: {
            NoData,
            InvoiceDialog
        },
        props: {
            isEdit: Boolean,
            dataList: { type: Array, default: () => [] },
            isUpdateFiles: Boolean,
            showReplaceBtn: { // 是否显示替换发票按钮
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                loading: false,
                invoiceDialog: {
                    visible: false
                }
            }
        },
        computed: {
        },
        mounted() {
        },
        methods: {
            // 替换发票
            handleReplace(row) {
                this.$emit('replace', row)
            },
            // 新增or编辑发票信息时触发
            handleUpdate(data) {
                if (this.isEdit) {
                    this.$emit('update', data)
                } else {
                    this.invoiceDialog = {
                        type: data.type,
                        dataId: data.guidId,
                        visible: true
                    }
                }
            },
            // 更换发票附件
            handleUpdateFiles(data) {
                this.invoiceDialog = {
                    type: data.type,
                    dataId: data.guidId,
                    visible: true,
                    isUpdateFiles: true
                }
            },
            // 作废发票
            async handleInvalidate(data) {
                await this.$confirm('确认作废吗？')
                this.$emit('handleInvalidate', data)
            },
            // 点击删除按钮时触发
            async handleDelete(index) {
                await this.$confirm('此操作将删除此发票信息, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                })
                this.$emit('delete', index)
            },
            // 上传附件提交
            handleSubmitFiles(data) {
                this.$emit('submitFiles', data)
            }
        }
    }
</script>

<style lang='scss' scoped>
.invoice-list {
    display: flex;
    flex-wrap: wrap;
    .item {
        width: 50%;
        padding: 5px;
    }
    .item-wrap {
        padding: 0 10px;
        border: solid 1px #e0e0e0;
        .head {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            align-items: center;
            border-bottom: solid 1px #f1f1f1;
            line-height: 1.4em;
            .tip {
              font-weight: bold;
              color: #f56c6c
            }
        }
        .body {
            padding: 6px 0;
            overflow: auto;
            &.type1 {
                height: 116px;
            }
            &.type2 {
                height: 64px;
            }
            .rows {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                line-height: 26px;
                .bold {
                    font-weight: bold;
                }
            }
        }
        .foot {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding: 10px 0;
            border-top: solid 1px #f1f1f1;
            .el-link {
                line-height: 1em;
                & + .el-link {
                    position: relative;
                    margin-left: 16px;
                    &::before {
                        content: '';
                        position: absolute;
                        left: -8px;
                        top: 0;
                        bottom: 0;
                        border-left: solid 1px #e0e0e0;
                    }
                }
            }
        }
    }
}
</style>
