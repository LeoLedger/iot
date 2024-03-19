<template>
    <div>
        <el-dialog
            v-if="visible"
            :visible.sync="visible"
            :before-close="handleCancel"
            :close-on-click-modal="false"
            title="付款记录导入"
            class=""
            width="400px"
            append-to-body>
            <div class="import-step-container">
                <div class="row-one">导入步骤：</div>
                <div class="row-two">
                    1. 请下载
                    <el-button
                        type="text"
                        icon="el-icon-download"
                        style="margin-left: 5px"
                        @click="handleDownloadTemplate">
                        付款记录模板.xlsx
                    </el-button>
                </div>
                <div class="row-three">
                    2. 按模板填写数据后
                    <ImportButton
                        style="margin-left: 5px"
                        action="/bill-pay-record/import"
                        accept=".xlsx,.xls"
                        text="导入 - 付款记录"
                        @success="handleSubmit"
                    />
                </div>
            </div>
            <span slot="footer">
                <el-button size="mini" @click="handleCancel">关 闭</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import ImportButton from '@/components/customizeFormItem/ImportButtonOld'
    import recordApi from '@/api/businessDocuments/billPayRecord'
    export default {
        name: 'ImportDialog',
        components: { ImportButton },
        props: {
            // 窗口可视属性
            visible: {
                type: Boolean,
                default: false
            }
        },
        methods: {
            handleCancel() {
                this.$emit('close', false)
            },
            handleSubmit(data) {
                this.$emit('success', data)
                this.$emit('confirm', true)
            },
            handleDownloadTemplate() {
                recordApi.export({ tem: 1 }).then(res => {
                    this.$message({ type: 'success', message: '已获取导入模板, 请按模板填写数据后导入' })
                })
            }
        }
    }
</script>

<style scoped lang="scss">
.import-step-container {
  .row-one {
    margin-bottom: 10px
  }
  .row-two {
    display: flex;flex-direction: row;align-items: center;margin-bottom: 10px
  }
  .row-three {
    display: flex;flex-direction: row;align-items: center
  }
  .row-four {
    display: flex;flex-direction: row;align-items: center;margin-top: 10px
  }
}
</style>
