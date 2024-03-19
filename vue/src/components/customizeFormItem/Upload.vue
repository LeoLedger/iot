<template>
    <div class="uploadItem">
        <el-upload
            v-if="!isDisabled"
            :drag="localIsEdit"
            :disabled="isDisabled"
            :placeholder="form.placeholder || '请选择' + form.label"
            :style="(form.itemWidth ? `width: ${form.itemWidth}px;` : '')"
            :action="uploadUrl"
            :headers="headers"
            :on-preview="previewItem"
            :on-remove="removeItem"
            :on-exceed="uploadExceed"
            :on-success="uploadSuc"
            :file-list="params[propKey] || []"
            :before-upload="beforeUpload"
            :before-remove="beforeRemove"
            :accept="acceptType"
            :limit="limit"
            :class="(!isEdit || form.isEdit === false) ? 'unEdit' : 'edit'"
            :show-file-list="false"
            list-type="picture"
        >
            <template v-if="isEdit && !form.disabled && form.isEdit !== false">
                <i class="el-icon-upload" />
                <div class="el-upload__text">
                    将文件拖到此处，或
                    <em>点击上传</em>
                </div>
                <div slot="tip" class="el-upload__tip">
                    <div v-if="form.tip">{{ form.tip }}</div>
                    最多可选{{ limit }}个文件,单个文件不超过30M,
                    <br >
                    仅仅接收（{{ acceptType }}）
                </div>
            </template>
        </el-upload>
        <div class="preview-wrap">
            <!-- 图片集合 -->
            <ul
                v-viewer="{url:'data-original'}"
                v-show="filesCollection.pictures.length"
                class="pictures el-upload-list el-upload-list--picture-card"
            >
                <li
                    v-for="(file,index) in filesCollection.pictures"
                    :key="`${file.fileId}-${index}`"
                    :style="{ width: width, height: height }"
                    class="el-upload-list__item is-success"
                >
                    <div class="el-upload-list__item-wrap">
                        <img
                            :src="getPreviewFileUrl(file)"
                            :data-original="getSourceFileUrl(file)"
                            class="el-upload-list__item-thumbnail"
                        >
                        <template v-if="localIsEdit">
                            <label class="el-upload-list__item-status-label">
                                <i class="el-icon-check" />
                            </label>
                            <i
                                class="el-icon-close"
                                @click="removeItem(file)"
                            />
                        </template>
                    </div>
                </li>
            </ul>
            <!-- video集合 -->
            <ul
                v-show="filesCollection.videos.length"
                class="pictures videos el-upload-list el-upload-list--picture-card"
            >
                <li
                    v-for="(file,index) in filesCollection.videos"
                    :key="`${file.fileId}-${index}`"
                    :style="{ width: width, height: height }"
                    class="el-upload-list__item is-success"
                >
                    <video
                        :src="getDownFileUrl(file)"
                        controls
                        class="el-upload-list__item-thumbnail img"
                        style="background: #000;"
                    />
                    <template v-if="localIsEdit">
                        <i
                            class="el-icon-close"
                            @click="removeItem(file)"
                        />
                    </template>
                </li>
            </ul>
            <!-- 其他文件集合 -->
            <ul v-show="filesCollection.files.length" class="pictures-files files el-upload-list file-list">
                <li
                    v-for="(file,index) in filesCollection.files"
                    :key="`${file.fileId}-${index}`"
                    :style="{ width: '570px'}"
                    class="el-upload-list__item is-success"
                >
                    <a
                        class="el-upload-list__item-name"
                        title="下载"
                        @click="handleDownload(file)"
                    >
                        <i class="el-icon-document" />
                        {{ file.fileName }}&nbsp;&nbsp;
                        <span class="show el-icon-download" />
                    </a>
                    <label v-if="localIsEdit" class="el-upload-list__item-status-label">
                        <!--el-icon-check-->
                        <i class="el-icon-upload-success el-icon-circle-check" />
                    </label>
                    <i
                        v-if="localIsEdit"
                        class="el-icon-close"
                        @click="removeItem(file)"
                    />
                </li>
            </ul>
            <p v-show="(!isEdit || form.isEdit === false || isDisabled) && filesCollection.noMsg" class="none-tips">- -</p>
        </div>
    </div>
</template>

<script>
    import { getToken } from '@/utils/auth' // 导入token
    import { uploadFileUrl, baseImgSrc, previewImgSrc, baseDownSrc } from '@/utils'
    export default {
        name: 'Upload',

        props: {
            form: {
                type: Object,
                required: true
                // { accept: '.jpg, .jpeg, .png', limit: 2}
            },
            params: {
                type: Object,
                required: true
            },
            isEdit: {
                type: Boolean,
                default: true
            }
        },
        data() {
            const { form, params } = this.$props
            // console.log(form, 'form params', params)
            return {
                uploadUrl: uploadFileUrl,
                height: form.height || '80px',
                width: form.width || '80px',
                propKey: form.prop,
                dialogImageUrl: '',
                imgName: '',
                disabled: false,
                headers: {
                    token: getToken()
                }
            }
        },
        computed: {
            localIsEdit() {
                return this.isEdit && this.form.isEdit !== false
            },
            isDisabled() {
                const { disabled, isEdit } = this.form
                return disabled || (isEdit === false)
            },
            acceptType() {
                return (
                    this.form.accept ||
                    '.jpg, .jpeg, .png, .pdf, .docx, .doc, .wps, .xlsx, .xml, .mp4, .ogg, .webm'
                )
            },
            limit() {
                return this.form.limit || 50
            },
            filesCollection() {
                const fileList = this.params[this.propKey] || []
                const pictures = [],
                      files = [],
                      videos = []
                fileList.map(file => {
                    const fileType = this.getFileType(file)
                    if (fileType === 'img') {
                        pictures.push(file)
                    } else if (fileType === 'video') {
                        videos.push(file)
                    } else {
                        files.push(file)
                    }
                })
                return {
                    pictures,
                    videos,
                    files,
                    noMsg: !fileList.length
                }
            }
        },
        methods: {
            getFileType(file) {
                var name = file.fileName || ''
                var fileSuffix = name.substring(name.lastIndexOf('.') + 1)
                var isImg = ['jpg', 'jpeg', 'png', 'gif'].includes(fileSuffix)
                if (isImg) {
                    return 'img'
                }
                const isVideo = ['mp4', 'ogg', 'webm'].includes(fileSuffix)
                if (isVideo) {
                    return 'video'
                } else {
                    return 'other'
                }
            },
            getPreviewFileUrl(file) {
                if (file.fileId) {
                    return previewImgSrc + file.fileId
                }
                return ''
            },
            getDownFileUrl(file) {
                if (file.fileId) {
                    return baseDownSrc + file.fileId
                }
                return ''
            },
            getSourceFileUrl(file) {
                if (file.fileId) {
                    return baseImgSrc + file.fileId
                }
                return ''
            },
            handleDownload(file) {
                var name = file.fileName || ''
                if (name.substring(name.lastIndexOf('.') + 1) === 'pdf') {
                    // PDF文件使用pdf.js预览
                    window.open(process.env.assetsPublicPath + 'static/pdf/web/viewer.html?file=' + this.getDownFileUrl(file) + '&title=' + name)
                } else {
                    // console.log(file) // 下载
                    window.open(this.getDownFileUrl(file))
                }
            },
            handlePreview(file) {
                this.previewItem && this.previewItem(file)
            },
            previewItem(file) {
                // window.open(baseDownSrc + file.fileId)
            },
            removeItem(file) {
                const index = this.params[this.propKey].findIndex((f, i) => {
                    return f.fileId == file.fileId
                })
                // this.temp.contractFiles.splice(index, 1);
                // this.params[this.propKey].splice(index, 1)
                const data = [...this.params[this.propKey] || []]
                data.splice(index, 1)
                this.$emit('remove', index)
                this.$set(this.params, this.propKey, data)
            },
            uploadSuc(res) {
                if (res.success) {
                    const data = this.params[this.propKey] || []
                    this.$set(this.params, this.propKey, [...data, res.data])
                    this.$emit('success', res.data)
                } else {
                    return
                }
            },
            beforeUpload(file) {
                const fileSuffix = file.name.substring(file.name.lastIndexOf('.') + 1)
                const isTrue = this.acceptType.includes(fileSuffix) // '.jpg, .jpeg, .png, .pdf, .docx, .doc, .wps, .xlsx, .xml, .xls'
                const isLt2M = file.size / 1024 / 1024 < 30
                if (!isTrue) {
                    this.$message({
                        message: `上传文件只能是 ${this.acceptType}格式!`,
                        type: 'warning'
                    })
                    this.fileFormal = true // 当前 的 数据的 formal
                    return false
                }
                if (!isLt2M) {
                    this.$message({
                        message: '上传文件大小不能超过 30MB!',
                        type: 'warning'
                    })
                    this.fileFormal = true
                    return false
                }
                return true // isTrue && isLt2M
            },
            beforeRemove(file, fileList) {
                if (this.fileFormal) {
                    const index = fileList.findIndex((f, i) => {
                        return f.fileId == file.fileId
                    })
                    fileList.splice(index, 1)
                    this.fileFormal = false
                    return false
                }
            },
            uploadExceed(files, fileList) {
                this.$message.warning(
                    `当前限制选择 ${this.limit} 个文件，本次选择了 ${
                        files.length
                    } 个文件，共选择了 ${files.length + fileList.length} 个文件`
                )
            }
        }
    }
</script>

<style scoped lang="scss">
.uploadItem {
    position: relative;
    .unEdit {
        /deep/ .el-upload--picture {
            display: none;
        }
    }
    .none-tips {
        padding: 0 5px;
    }
    .pictures-files {
        margin-top: 10px;
    }
    /deep/ {
        .el-upload{
            vertical-align: top;
        }
        .el-upload--picture-card {
            line-height: inherit;
        }
        .el-upload-dragger {
            height: 80px;
            width: 180px;
            border-style: solid;
            border-radius: 0;
            .el-icon-upload {
                margin: 0;
                font-size: 28px;
                display: block;
                margin-top: 12px;
                line-height: 1em;
            }
            .el-upload__text {
                font-size: 12px;
            }
        }
        /* 新图片集合样式 */
        .el-upload-list--picture-card {
            display: flex;
            flex-wrap: wrap;
            margin-left: -5px;
            // width: calc(100% + 10px);
            /* 视频相关样式 */
            &.videos {
                .el-upload-list__item,
                .el-upload-list__item-thumbnail {
                    width: 110px;
                    height: 110px;
                    video {
                        width: 100%;
                        height: 100%;
                    }
                }
            }
            .el-upload-list__item:hover .el-icon-close {
                display: inline-block;
                top: 0;
                right: 0;
                cursor: pointer;
                opacity: 0.75;
                color: #fff;
                font-size: 20px;
                background: #f00;
            }
            .el-upload-list__item-thumbnail {
                width: 100%;
                height: 100%;
                cursor: pointer;
                border-radius: 6px;
                border: 1px solid #c0ccda;
            }
            .el-upload-list__item {
                background-color: transparent;
                border: none;
                width: 80px;
                height: 80px;
                padding: 5px;
                flex: 0 0 auto;
                margin: 0;
            }
            .el-upload-list__item-wrap {
                position: relative;
                width: 100%;
                height: 100%;
                border-radius: 6px;
                overflow: hidden;
            }
        }
        /* 其他文件列表 样式 */
        .file-list {
        .el-upload-list__item:first-child {
            margin-top: 0;
        }
        }
        .pictures + .files {
            margin-top: 5px;
            border-top: 1px solid #eee;
        }

        .el-upload-list__item-name{
            color: #409eff;
            &:hover {
                text-decoration: underline;
            }
        }
        .el-upload__tip {
            display: inline-block;
            height: 50px;
            min-width: 340px;
            width: calc(100% - 190px);
            margin-left: 10px;
            vertical-align: top;
            line-height: 16px;
        }
    }
}
</style>
