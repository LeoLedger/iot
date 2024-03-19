<!--
* @description 输入弹窗
* @author yc
!-->
<template>
    <el-dialog
        :visible="visible"
        :close-on-click-modal="false"
        :title="title"
        width="410px"
        append-to-body
        @update="$emit('update:visible', false)"
    >
        <div v-loading="loading" class="input-dialog">
            <el-input
                :rows="3"
                v-model="value"
                :placeholder="placeholder"
                type="textarea"
            />
        </div>
        <div slot="footer">
            <el-button :loading="loading" @click="$emit('update:visible', false)">取 消</el-button>
            <el-button v-prereclick :loading="loading" type="primary" @click="$emit('confirm', value)">{{ buttonText }}</el-button>
        </div>
    </el-dialog>
</template>

<script>
    // API
    // 方法
    // 组件

    export default {
        components: {
        },
        props: {
            title: { type: String, default: '' },
            visible: { type: Boolean, default: false },
            loading: { type: Boolean, default: false },
            buttonText: { type: String, default: '' },
            placeholder: { type: String, default: '' }
        },
        data() {
            return {
                value: ''
            }
        },
        computed: {
        },
        watch: {
            visible: {
                handler(visible) {
                    this.value = visible ? '' : this.value
                }
            }
        },
        mounted() {
        },
        methods: {

        }
    }
</script>

<style lang='scss' scoped>
.input-dialog {
    padding: 20px 0;
}
</style>
