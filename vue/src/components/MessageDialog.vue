<!--
* @description 信息窗口
* @author yc
!-->
<template>
    <el-dialog
        :visible="visible"
        :close-on-click-modal="false"
        :title="title"
        :width="width"
        class="not-padding"
        append-to-body
        @close="$emit('update:visible', false)"
    >
        <div v-loading="loading" class="message-dialog">
            <div v-if="content" class="text" v-html="content"/>
            <slot/>
        </div>
        <div slot="footer">
            <el-button v-if="showCancel" :loading="loading" :text="cancelType" @click="$emit('update:visible', false)">{{ cancelText }}</el-button>
            <el-button v-prereclick :loading="loading" :type="confirmType" @click="$emit('confirm')">{{ confirmText }}</el-button>
        </div>
    </el-dialog>
</template>

<script>
    // API
    // 方法
    // 组件
    export default {
        name: 'MessageDialog',
        props: {
            width: { type: String, default: '450px' },
            title: { type: String, default: '提示' },
            loading: { type: Boolean, default: false },
            visible: { type: Boolean, default: false },
            content: { type: String, default: '' },
            showCancel: { type: Boolean, default: false },
            cancelText: { type: String, default: '取 消' },
            cancelType: { type: String, default: 'text' },
            confirmText: { type: String, default: '确 定' },
            confirmType: { type: String, default: 'primary' }
        }
    }
</script>

<style lang='scss' scoped>
.message-dialog {
    padding: 26px 15px;
    min-height: 130px;
    .text {
        font-size: 15px;
        color: #666;
        line-height: 1.4em;
        /deep/ {
            .high {
                color: #409EFF;
            }
        }
    }
}
</style>
