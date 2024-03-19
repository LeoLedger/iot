<template>
    <div class="import-button">
        <el-button
            v-waves
            v-bind="$attrs"
            :size="$attrs.icon || 'mini'"
            :type="$attrs.type || 'success'"
            :icon="$attrs.icon || 'el-icon-upload2'"
            @click="handleActive"
        >{{ $attrs.text || '导入' }}</el-button>
        <el-dialog
            :visible.sync="visible"
            :close-on-click-modal="false"
            :title="title"
            class="not-padding"
            width="400px"
            append-to-body
        >
            <div class="import-step">
                <div class="title">导入步骤：</div>
                <div class="rows-wrap">
                    1. 请下载
                    <el-button
                        type="text"
                        class="download"
                        icon="el-icon-download"
                        @click="handleDownloadTemplate"
                    >
                        {{ templateName }}
                    </el-button>
                </div>
                <div :class="{loading: loading}" class="rows-wrap">
                    2. 按模板填写数据后
                    <el-upload
                        ref="ElUpload"
                        :data="paramData"
                        :limit="1"
                        :action="BASE_API + action"
                        :accept="accept"
                        :headers="headers"
                        :show-file-list="false"
                        :on-success="handleSuccess"
                        :before-upload="handleBeforeUpload"
                    >
                        <el-button
                            v-waves
                            :loading="loading"
                            :icon="$attrs.icon || 'el-icon-upload2'"
                            type="success"
                            size="mini"
                        >{{ $attrs.text || '导入' }}</el-button>
                    </el-upload>
                </div>
            </div>
            <span slot="footer">
                <el-button size="mini" @click="visible = false">关 闭</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import { getToken } from '@/utils/auth' // 导入token
    import { BASE_API, isEmpty, isPromise } from '@/utils'

    export default {
        name: 'ImportButton',
        components: {
        },
        props: {
            title: { type: String, default: '导入' },
            action: { type: String, default: '' },
            accept: { type: String, default: '.pdf, .docx, .doc, .wps, .xlsx, .xls, .xml' },
            uploadData: { type: Object, default: () => {} },
            templateName: { type: String, default: '模板名称' },
            beforeUpload: { type: Function },
            downloadMethod: { type: Function }
        },
        data() {
            return {
                headers: {
                    token: getToken()
                },
                visible: false,
                loading: false,
                BASE_API
            }
        },
        computed: {
            paramData() {
                let data = {}
                let uploadData = this.uploadData || {}
                Object.keys(uploadData).forEach(key => {
                    if (!isEmpty(uploadData[key])) {
                        data[key] = uploadData[key]
                    }
                })
                return data
            }
        },
        methods: {
            // 点击按钮时触发
            handleActive() {
                if (this.beforeUpload) {
                    var pass = this.beforeUpload()
                    if (isPromise(pass)) {
                        pass.then(() => {
                            this.visible = true
                        })
                    } else if (pass) {
                        this.visible = true
                    }
                } else {
                    this.visible = true
                }
            },
            // 上传成功
            handleSuccess(data) {
                if (data.success && !data.data.message) {
                    this.$emit('success', data.data)
                    this.visible = false
                } else {
                    let msg
                    if (data.success) {
                        msg = data.data.message
                    } else {
                        msg = data.msg || '服务器繁忙，请稍后再试！'
                    }
                    this.$message({
                        message: msg,
                        type: 'error',
                        duration: 0,
                        showClose: true
                    })
                }
                this.$refs.ElUpload.clearFiles()
                this.loading = false
            },
            // 上传文件之前触发
            handleBeforeUpload() {
                this.loading = true
                return true
            },
            // 点击下载模板按钮时触发
            handleDownloadTemplate() {
                if (typeof this.downloadMethod === 'function') {
                    this.downloadMethod()
                } else {
                    this.$message.warning('暂无导入模板！')
                }
            }
        }
    }
</script>

<style scoped lang="scss">
.import-button {
    display: inline-block;
}
.import-step {
    padding: 15px 20px;
    .title {
        font-size: 14px;
        font-weight: bold;
    }
    .download {
        &:hover {
            text-decoration: underline;
        }
    }
    .rows-wrap {
        display: flex;
        align-items: center;
        margin-top: 10px;
        &.loading {
            pointer-events: none;
        }
        .el-button,
        .el-upload{
            margin-left: 10px;
        }
    }
}
</style>
