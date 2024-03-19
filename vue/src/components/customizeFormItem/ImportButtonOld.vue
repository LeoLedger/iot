<template>
    <div :class="{loading: loading}" class="import-button">
        <el-upload
            ref="ElUpload"
            :on-success="handleSuccess"
            :before-upload="handleBeforeUpload"
            :limit="1"
            :action="BASE_API + action"
            :accept="accept"
            :headers="headers"
            :show-file-list="false"
            :data="data"
            :disabled="$attrs.disabled"
        >
            <el-button
                v-waves
                :loading="loading"
                :type="$attrs.type || 'success'"
                size="mini"
            >{{ $attrs.text }}</el-button>
        </el-upload>
    </div>
</template>

<script>
    import { getToken } from '@/utils/auth' // 导入token
    import { BASE_API, isPromise } from '@/utils'

    export default {
        name: 'ImportButton',
        components: {
        },
        props: {
            action: { type: String, default: '' },
            accept: { type: String, default: '.pdf, .docx, .doc, .wps, .xlsx, .xml' },
            beforeUpload: { type: Function },
            data: { type: Object, default: () => {} }
        },
        data() {
            return {
                headers: {
                    token: getToken()
                },
                loading: false,
                BASE_API
            }
        },
        methods: {
            // 上传成功
            handleSuccess(data) {
                if (data.success) {
                    this.$emit('success', data.data)
                } else {
                    this.$message({
                        message: data.msg || '服务器繁忙，请稍后再试！',
                        type: 'error',
                        duration: 0,
                        showClose: true
                    })
                }
                this.$refs.ElUpload.clearFiles()
                this.loading = false
            },
            // 上传文件之前触发
            handleBeforeUpload(file) {
                return new Promise((resolve, reject) => {
                    this.loading = true
                    if (this.beforeUpload) {
                        var pass = this.beforeUpload(file)
                        if (isPromise(pass)) {
                            pass.then(resolve).catch(() => {
                                this.loading = false
                                reject()
                            })
                        } else {
                            if (pass) {
                                resolve()
                            } else {
                                this.loading = false
                                reject()
                            }
                        }
                    } else {
                        resolve()
                    }
                })
            }
        }
    }
</script>

<style scoped lang="scss">
.import-button {
    &.loading {
        pointer-events: none;
    }
}
</style>
