<template>
    <viewer
        :options="{url: 'data-original'}"
        class="image-upload"
        @inited="handleViewerInited"
    >
        <div
            v-for="name in config.props"
            :style="{width: config.itemWidth, height: config.itemHeight}"
            :key="name"
            class="item"
        >
            <el-form-item
                :prop="name"
                class="form-item"
            >
                <div v-if="!params[name] && (!isEdit || config.disabled || disabled)" class="placeholder">
                    <img v-if="placeholderImage" :src="placeholderImage" class="image">
                    <div v-else class="text">暂无图片</div>
                </div>
                <el-upload
                    v-else
                    :limit="1"
                    :accept="config.accept"
                    :headers="headers"
                    :disabled="config.disabled || disabled"
                    :file-list="getFileList(name)"
                    :action="uploadUrl"
                    :on-success="res => handleSuccess(name, res)"
                    :before-upload="handleBeforeUpload"
                    :multiple="false"
                    list-type="picture-card"
                    style="width: 100%; height: 100%; overflow: hidden;"
                >
                    <i class="el-icon-plus"/>
                    <div slot="file" slot-scope="{file}" class="preview-wrap" @click="handlePreview(name)">
                        <el-image
                            :src="getPreviewFileUrl(params[name]) || file.url"
                            :data-original="getSourceFileUrl(params[name]) || file.url"
                            fit="cover"
                            class="preview-image"
                        />
                        <div v-if="isEdit && !config.disabled && !disabled" class="delete-button" @click.stop="handleRemove(name)">
                            <i class="el-icon-delete"/>
                        </div>
                    </div>
                </el-upload>
            </el-form-item>
        </div>
    </viewer>
</template>

<script>
    import { getToken } from '@/utils/auth' // 导入token
    import { uploadFileUrl, baseImgSrc, previewImgSrc, baseDownSrc } from '@/utils'
    export default {
        name: 'ImageUpload',
        components: {
        },
        props: {
            form: {
                type: Object,
                required: true
            },
            params: {
                type: Object,
                required: true
            },
            isEdit: {
                type: Boolean,
                default: true
            },
            disabled: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                headers: {
                    token: getToken()
                },
                uploadUrl: uploadFileUrl
            }
        },
        computed: {
            config() {
                return Object.assign({
                    drag: true,
                    disabled: false,
                    itemWidth: '100px',
                    itemHeight: '100px',
                    accept: '.jpg, .jpeg, .png'
                }, this.form)
            },
            placeholderImage() {
                var placeholderImage = this.config.placeholderImage
                switch (typeof placeholderImage) {
                case 'string':
                    return placeholderImage
                case 'function':
                    return placeholderImage(this.params, this.form)
                default:
                    return false
                }
            }
        },
        methods: {
            getFileList(name) {
                if (this.params[name]) {
                    return [this.params[name]]
                }
                return []
            },
            getPreviewFileUrl(file) {
                if (file && file.fileId) {
                    return previewImgSrc + file.fileId
                }
                return ''
            },
            getDownFileUrl(file) {
                if (file && file.fileId) {
                    return baseDownSrc + file.fileId
                }
                return ''
            },
            getSourceFileUrl(file) {
                if (file && file.fileId) {
                    return baseImgSrc + file.fileId
                }
                return ''
            },
            handleViewerInited(viewer) {
                this.$viewer = viewer
            },
            handlePreview(name) {
                this.$viewer.update()
                this.$viewer.show()
            },
            handleRemove(name) {
                this.$set(this.params, name, null)
            },
            handleSuccess(name, res) {
                var value = res.data
                this.$set(this.params, name, value)
                this.config.success && this.config.success(value, name, this.config)
            },
            handleBeforeUpload(file) {
                const fileSuffix = file.name.substring(file.name.lastIndexOf('.') + 1)
                const isTrue = this.config.accept.includes(fileSuffix) // '.jpg, .jpeg, .png, .pdf, .docx, .doc, .wps, .xlsx, .xml, .xls'
                const isLt2M = file.size / 1024 / 1024 < 30
                if (!isTrue) {
                    this.$message({
                        message: `上传文件只能是 ${this.config.accept}格式!`,
                        type: 'warning'
                    })
                    return false
                }
                if (!isLt2M) {
                    this.$message({
                        message: '上传文件大小不能超过 30MB!',
                        type: 'warning'
                    })
                    return false
                }
                return true
            }
        }
    }
</script>

<style scoped lang="scss">
.image-upload{
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin: -8px 0 -8px -5px;
    width: calc(100% + 10px);
    .item {
        padding: 8px 5px;
        .form-item{
            width: 100%;
            height: 100%;
            margin: 0!important;
        }
        .preview-wrap {
            position: relative;
            width: 100%;
            height: 100%;
            cursor: pointer;
            .preview-image {
                width: 100%;
                height: 100%;
            }
            .delete-button{
                position: absolute;
                display: flex;
                align-items: center;
                justify-content: center;
                top:0;
                right: 0;
                width: 26px;
                height: 26px;
                opacity: 0;
                color: #fff;
                background: #F56C6C;
                border-radius: 0 0 0 4px;
                transition: .05s ease-in-out;
                .el-icon-delete{
                    font-size: 14px;
                }
            }
            &:hover {
                .delete-button {
                    opacity: 1;
                }
            }
        }
        .placeholder{
            width: 100%;
            height: 100%;
            background: #F5F7FA;
            display: flex;
            align-items: center;
            justify-content: center;
            border:solid 1px #e4e7ed;
            color: #999;
            .image {
                width: 100%;
                height: 100%;
            }
        }
    }
    /deep/ {
        .el-upload,
        .el-upload-dragger,
        .el-upload-list,
        .el-upload-list__item {
            width: 100%;
            height: 100%;
            line-height: 0;
        }
        .el-upload {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .el-progress {
            width: 80px;
            height: 80px;
            .el-progress-circle{
                width: inherit!important;
                width: inherit!important;
            }
            .el-progress__text{
                font-size: 14px!important;
            }
        }
        .el-form-item__content{
            width: 100%;
            height: 100%;
            .el-upload-list__item {
                border-radius: 0;
                border-color: #e4e7ed;
                .el-image__error{
                    color: #999;
                }
            }
        }
    }
}
</style>
