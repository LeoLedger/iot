<template>
    <div>
        <el-dialog
            v-if="visible"
            :visible.sync="visible"
            :before-close="handleCancel"
            :close-on-click-modal="false"
            title="故障设备导入"
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
                        故障设备导入模板.xlsx
                    </el-button>
                </div>
                <div class="row-three">
                    2. 按模板填写数据后点击
                    <ImportButton
                        :data="params"
                        style="margin-left: 5px"
                        action="/fault-repair-car/import-fault-car"
                        accept=".xlsx,.xls"
                        text="导入 - 故障设备数据"
                        @success="handleSubmit"
                    />
                </div>
                <div class="row-four">
                    3. 导入成功后，请您对故障数据进行确认和提交。
                </div>
            </div>
            <span slot="footer">
                <el-button size="mini" @click="handleCancel">关 闭</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import ImportButton from '@/components/customizeFormItem/ImportButton'
    import carApi from '@/api/operationsManagement/carTroubleTicket'
    export default {
        name: 'ImportDialog',
        components: { ImportButton },
        props: {
            // 窗口可视属性
            visible: {
                type: Boolean,
                default: false
            },
            // 参数
            params: {
                type: Object,
                default: () => {}
            }
        },
        methods: {
            handleCancel() {
                this.$emit('close', false)
            },
            handleSubmit(data) {
                // 将后端返回的完整设备列表数据传递出去
                this.$emit('success', data)
                this.$emit('close', false)
            },
            handleDownloadTemplate() {
                carApi.downloadFault({ tem: 1 })
                this.$message({ type: 'success', message: '已获取导入模板, 请按模板填写数据后导入' })
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
