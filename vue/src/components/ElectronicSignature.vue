<template>
    <div class="electronic-signature">
        <div class="view-wrap" :style="{width: width, height: height}" v-if="value">
            <div
                class="signature"
                :style="{backgroundImage: `url(${signatureImage})`}"
                v-if="signatureImage"
                @click="show"
            />
            <div class="placeholder" v-else-if="!readonly" @click="show">
                <i class="el-icon-edit"/>
                <el-link type="primary" class="text">点击进行签名</el-link>
            </div>
        </div>
        <NoData v-else/>
        <el-dialog
            :visible.sync="visible"
            :close-on-click-modal="false"
            title="电子签名"
            class="not-padding"
            width="1000px"
            append-to-body
            :before-close="handleDialogClose"
        >
            <div class="canvas">
                <canvas id="ElectronicSignatureCanvas"/>
            </div>
            <span slot="footer">
                <el-button size="mini" @click="visible = false">取 消</el-button>
                <el-button type="primary" size="mini" plain @click="handleClear" >清 除</el-button>
                <el-button v-prereclick type="primary" size="mini" @click="handleConfirm">保 存</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    // API
    import resourceApi from '@/api/resource'
    // 方法
    import { getToken } from '@/utils/auth' // 导入token
    import { baseDownSrc } from '@/utils'
    // 组件
    import NoData from '@/components/NoData'

    export default {
        name: 'ElectronicSignature',
        components: {
            NoData
        },
        props: {
            // 签名图片地址
            value: null,
            width: { type: String, default: '100%' },
            height: { type: String, default: '300px' },
            required: Boolean,
            // 是否只读
            readonly: Boolean
        },
        data() {
            return {
                visible: false,
                headers: {
                    token: getToken()
                },
                tempSignature: null
            }
        },
        computed: {
            signatureImage() {
                return this.tempSignature || (this.value ? baseDownSrc + this.value.fileId : null)
            }
        },
        mounted() {
        },
        methods: {
            show() {
                if (!this.readonly) {
                    this.visible = true
                    this.loading = false
                    this.$nextTick(this.initCanvas)
                }
            },
            hide() {
                this.canvas.removeEventListener('mousedown', this.handleMouseDown)
                this.canvas.removeEventListener('mousemove', this.handleMouseMove)
                this.canvas.removeEventListener('mouseup', this.handleMouseUp)
            },
            async submit() {
                if (this.tempSignature) {
                    try {
                        let { data } = await resourceApi.uploadFile(this.dataURLToBlob(this.signatureImage), 'signature.png')
                        this.$emit('input', data)
                        return data
                    } catch (err) {
                        return Promise.reject(err)
                    }
                } else {
                    if (!this.value && this.required) {
                        this.$message.warning('请书写您的签名！')
                        return Promise.reject()
                    }
                    return Promise.resolve()
                }
            },
            initCanvas() {
                this.canvas = document.querySelector('#ElectronicSignatureCanvas')
                this.context = this.canvas.getContext('2d')
                let rect = this.canvas.getBoundingClientRect()
                this.canvas.width = rect.width
                this.canvas.height = rect.height
                this.canvas.addEventListener('mousedown', this.handleMouseDown)
                this.canvas.addEventListener('mousemove', this.handleMouseMove)
                this.canvas.addEventListener('mouseup', this.handleMouseUp)
            },
            dataURLToBlob(dataurl) {
                let arr = dataurl.split(',')
                let mime = arr[0].match(/:(.*?);/)[1]
                let bstr = atob(arr[1])
                let n = bstr.length
                let u8arr = new Uint8Array(n)
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n)
                }
                return new Blob([u8arr], { type: mime })
            },
            updateDrawRange(x, y) {
                let padding = 20
                this.rangeRect[0].x = Math.min(this.rangeRect[0].x, x - padding)
                this.rangeRect[0].y = Math.min(this.rangeRect[0].y, y - padding)
                this.rangeRect[1].x = Math.max(this.rangeRect[1].x, x + padding)
                this.rangeRect[1].y = this.rangeRect[0].y
                this.rangeRect[2].x = this.rangeRect[1].x
                this.rangeRect[2].y = Math.max(this.rangeRect[2].y, y + padding)
                this.rangeRect[3].x = this.rangeRect[0].x
                this.rangeRect[3].y = this.rangeRect[2].y
            },
            handleMouseDown(e) {
                let rect = this.canvas.getBoundingClientRect()
                let x = e.clientX - rect.left
                let y = e.clientY - rect.top
                this.point = { x, y }
                if (this.rangeRect) {
                    this.updateDrawRange(x, y)
                } else {
                    this.rangeRect = [
                        { x, y },
                        { x, y },
                        { x, y },
                        { x, y }
                    ]
                }
            },
            handleMouseMove(e) {
                if (this.point) {
                    let rect = this.canvas.getBoundingClientRect()
                    let x = e.clientX - rect.left
                    let y = e.clientY - rect.top
                    let ponit = { x, y }
                    this.updateDrawRange(x, y)
                    this.context.save()
                    this.context.beginPath()
                    this.context.lineCap = 'round'
                    this.context.lineJoin = 'round'
                    this.context.lineWidth = 6
                    this.context.strokeStyle = '#000000'
                    this.context.moveTo(this.point.x, this.point.y)
                    this.context.lineTo(ponit.x, ponit.y)
                    this.context.stroke()
                    this.point = ponit
                    this.context.restore()
                }
            },
            handleMouseUp() {
                this.point = null
            },
            handleClear() {
                let rect = this.canvas.getBoundingClientRect()
                this.point = null
                this.rangeRect = null
                this.context.clearRect(0, 0, rect.width, rect.height)
            },
            handleConfirm() {
                if (this.rangeRect) {
                    let canvas = document.createElement('canvas')
                    let context = canvas.getContext('2d')
                    canvas.width = this.rangeRect[1].x - this.rangeRect[0].x
                    canvas.height = this.rangeRect[2].y - this.rangeRect[0].y
                    context.drawImage(
                        this.canvas,
                        this.rangeRect[0].x,
                        this.rangeRect[0].y,
                        canvas.width,
                        canvas.height,
                        0,
                        0,
                        canvas.width,
                        canvas.height,
                    )
                    this.tempSignature = canvas.toDataURL('image/png', 1)
                    this.point = null
                    this.rangeRect = null
                    this.visible = false
                } else {
                    this.$message.warning('请书写您的签名！')
                }
            },
            // 弹窗关闭时触发
            handleDialogClose() {
                this.$confirm('确认放弃本次操作？').then(_ => {
                    this.visible = false
                }).catch(_ => {
                    return false
                })
            }
        }
    }
</script>

<style scoped lang="scss">
.electronic-signature {
    .signature {
        width: 100%;
        height: 100%;
        background-position: 50% 50%;
        background-repeat: no-repeat;
        background-size: contain;
    }
    .view-wrap {
        border: dashed 2px #aad4ff;
        border-radius: 10px;
        .placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            color: #409EFF;
            cursor: pointer;
            .text {
                margin-left: 6px;
            }
        }
    }
}
.canvas {
    position: relative;
    height: 500px;
    &::before {
        content: '签名区';
        position: absolute;
        top: 50%;
        left: 50%;
        margin-left: 30px;
        transform: translate3d(-50%, -50%, 0);
        font-size: 100px;
        color: #409EFF;
        font-weight: bold;
        letter-spacing: 60px;
        opacity: .1;
        white-space: nowrap;
        font-family: '楷体';
        pointer-events: none;
    }
    canvas {
        width: 100%;
        height: 100%;
    }
}
</style>
