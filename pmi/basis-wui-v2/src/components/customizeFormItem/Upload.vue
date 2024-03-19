<template>
    <div class="uploadItem">
        <!--<template v-if="form.disabled || form.isEdit === false">
            testestset
        </template>
        <template v-else>-->
        <el-upload
                    :disabled="form.disabled || form.isEdit === false"
                    :placeholder="form.placeholder || '请选择' + form.label"
                    :style="itemStyle + (form.itemWidth ? `width: ${form.itemWidth}px;` : '')"
                    :action="uploadUrl"
                    :on-preview="uploadHandlePreview"
                    :on-remove="uploadHhandleRemove"
                    :on-exceed="uploadHandleExceed"
                    :on-success="uploadUploadSuc"
                    :file-list="params[propKey]"
                    :before-upload="uploadBeforeUpload"
                    :before-remove="uploadBeforeRemove"
                    :accept="acceptType"
                    :limit="limit"
                    list-type="picture"
            >
            <div slot="file" slot-scope="{file}">
              <!-- 判断是否是图片 -->
              <!-- 展示图片的时候  加上loading 更佳 -->
              <img
                v-if="isImg(file)"
                :src="uploadUrl + '/thumbImage/' + file.fileId"
                class="el-upload-list__item-thumbnail"
                @click="handlePictureCardPreview(file)"
              >
              <div
                v-else
                class="el-upload-list__item-thumbnail"
                style="border: 1px solid #c0ccda; cursor: default;">
                {{ file.name.split('.')[1] || '- -' }}
              </div>
              <a class="el-upload-list__item-name" title="下载" @click="handleDownload(file)">
                {{ file.name }}&nbsp;&nbsp;
                <span class="show el-icon-download"></span>
              </a>
              <label v-if="isEdit && form.isEdit !== false" class="el-upload-list__item-status-label">
                <!-- //['picture-card', 'picture'].indexOf(listType) > -1 -->
                <i class="el-icon-check"/>
              </label>
              <i v-if="isEdit && form.isEdit !== false" class="el-icon-close" @click="uploadHhandleRemove(file)"/>
            </div>
            <template v-if="!form.disabled && form.isEdit !== false">
                <el-button slot="trigger" size="mini" type="primary" >附件上传</el-button>
                <div slot="tip"
                     class="el-upload__tip">
                    <div v-if="form.tip">{{form.tip}}</div>
                    最多可选{{limit}}个文件,单个文件不超过30M,仅仅接收（{{acceptType}}）</div>
            </template>
            </el-upload>
        <!--</template>-->
    <el-dialog
      :visible.sync="dialogVisible"
      :title="imgName"
      append-to-body>
      <img :src="dialogImageUrl" width="100%" alt="">
    </el-dialog>
    </div>
</template>

<script>
    export default {
        name: 'Upload',
        props: {
            form: {
                type: Object,
                required: true,
                // { accept: '.jpg, .jpeg, .png', limit: 2}
            },
            params: {
                type: Object,
                required: true
            }
        },
        data() {
            const {form, params} = this.$props
            // console.log(form, 'form params', params)
            return {
                uploadUrl: process.env.VUE_APP_uploadFileUrl,
                propKey: form.prop,
                dialogImageUrl: '',
                imgName: '',
                isEdit: false,
                dialogVisible: false,
            }
        },
        computed: {
            acceptType() {
                return this.form.accept || '.jpg, .jpeg, .png, .pdf, .docx, .doc, .wps, .xlsx, .xml, .xls'
            },
            limit() {
                return this.form.limit || 50
            },
            itemStyle() {
                const {itemWidth} = this
                if (itemWidth) {
                    return `width: ${itemWidth}px;`
                }
                return ''
            },
        },
        methods: {
            isImg(file) {
              const { name } = file,
                testmsg = name.substring(name.lastIndexOf('.') + 1)
              const isTrue = ['jpg', 'jpeg', 'png', 'gif'].includes(testmsg)
              // console.error(isTrue, 'isImg')
              return isTrue
            },
            getFileUrl(file) {
              const url = process.env.VUE_APP_uploadFileUrl + '/thumbImage/' + file.fileId
              return url
            },
            uploadHandlePreview(file) {
              console.log(file)
                window.open(process.env.VUE_APP_uploadFileUrl + "/download/" + file.fileId);
            },
            uploadHhandleRemove(file, fileList) {
                const index = this.params[this.propKey].findIndex((f, i) => {
                    return f.fileId == file.fileId
                })
                // this.temp.contractFiles.splice(index, 1);
                // this.params[this.propKey].splice(index, 1)
                const data = this.params[this.propKey] || []
                data.splice(index, 1)
                this.$set(this.params, this.propKey, data)
            },
            uploadUploadSuc(res, file, fileList) {
                if (res.success) {
                    // this.params['contractFiles'].push(res.data[0]);
                    // this.params[this.propKey].push(...res.data)
                    const data = this.params[this.propKey] || []
                    this.$set(this.params, this.propKey, [...data, ...res.data])
                } else {
                    return
                }
            },
            uploadBeforeUpload(file, test) {
                let testmsg = file.name.substring(file.name.lastIndexOf(".") + 1);
                // let arr = ["jpg", "jpeg", "png", "pdf", "docx", "doc", "wps", "xlsx", "xml", "xls"];
                // let isTrue = arr.indexOf(testmsg) > -1;
                let isTrue = this.acceptType.includes(testmsg); // '.jpg, .jpeg, .png, .pdf, .docx, .doc, .wps, .xlsx, .xml, .xls'
                const isLt2M = file.size / 1024 / 1024 < 30;
                if (!isTrue) {
                    this.$message({
                        message: `上传文件只能是 ${this.acceptType}格式!`,
                        type: "warning"
                    });
                    this.fileFormal = true; // 当前 的 数据的 formal
                }
                if (!isLt2M) {
                    this.$message({
                        message: "上传文件大小不能超过 30MB!",
                        type: "warning"
                    });
                    this.fileFormal = true;
                }
                return isTrue && isLt2M;
            },
            uploadBeforeRemove(file, fileList) {
                // return this.$confirm(`确定移除 ${file.name}？`);
                if (this.fileFormal) {
                    let index = fileList.findIndex((f, i) => {
                        return f.fileId == file.fileId;
                    });
                    fileList.splice(index, 1);
                    this.fileFormal = false;
                    return false;
                }
            },
            uploadHandleExceed(files, fileList) {
                this.$message.warning(
                    `当前限制选择 ${this.limit} 个文件，本次选择了 ${
                        files.length
                        } 个文件，共选择了 ${files.length + fileList.length} 个文件`
                );
            },
            handlePictureCardPreview(file) {
                console.log(file)
                // const url = process.env.VUE_APP_uploadFileUrl + '/download/' + file.fileId // 下载 链接
                // const url = process.env.VUE_APP_uploadFileUrl + '/thumbImage/' + file.fileId // 缩略图
                const url = process.env.VUE_APP_uploadFileUrl + '/image/' + file.fileId // 完整图
                this.dialogImageUrl = url
                this.imgName = file.name
                this.dialogVisible = true
            },
            handleDownload(file) {
                // console.log(file) // 下载
                window.open(process.env.VUE_APP_uploadFileUrl + '/download/' + file.fileId)
            },
        }
    }

</script>

<style scoped lang="scss">
  .uploadItem {
    position: relative;
    .unEdit {
      /deep/ .el-upload--picture{
        display: none;
      }
    }
    .edit{
      /deep/ .el-upload__tip{
        display: inline-block;
        margin-left: 10px;
      }
    }
    /deep/ {
      .el-upload--picture-card {
        line-height: inherit;
      }

      .el-upload-dragger {
        height: 80px;
        width: 180px;

        .el-icon-upload {
          margin: 0;
          font-size: 28px;
        }

        .el-upload__text {
          font-size: 12px;
        }
      }

      // picture Start
      .el-upload-list--picture {
        .el-upload-list__item {
          padding: 5px 5px 5px 55px;
          height: 50px;

          &.is-success .el-upload-list__item-name {
            line-height: 38px;
          }
        }

        .el-upload-list__item-thumbnail {
          width: 38px;
          height: 38px;
          margin-left: -50px;
          cursor: pointer;
          text-align: center;
          line-height: 38px;
        }
      }

      .el-upload-list__item-name:hover {
        span {
          color: #409eff;
        }
      }
      .el-upload__tip {
        display: inline-block;
        height: 50px;
        max-width: 300px;
        margin-left: 20px;
        vertical-align: top;
        line-height: 16px;
      }
    }
  }
</style>
