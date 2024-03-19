<!--
* @description 选择弹窗
* @author yc
!-->
<template>
    <el-dialog
        v-if="visible"
        :title="title"
        :visible="visible"
        :close-on-click-modal="false"
        width="1200px"
        append-to-body
        @close="$emit('update:visible', false)"
    >
        <keep-alive v-if="visible" :include="pickTypes">
            <component
                :is="type"
                :value="value"
                :multiple="multiple"
                :excludes="excludes"
                :extend-params="extendParams"
                @change="handlePickChange"
            />
        </keep-alive>
        <span slot="footer">
            <el-button size="mini" @click="$emit('update:visible', false)">取 消</el-button>
            <el-button v-prereclick type="primary" size="mini" @click="handleSubmit">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import User from '@/components/SelectDialog/User'
    import Role from '@/components/SelectDialog/Role'
    import Dept from '@/components/SelectDialog/Dept'

    import types from '@/components/SelectDialog/types'

    const pickTypes = Object.keys(types)

    export default {
        name: 'SelectDialog',
        components: {
            User,
            Role,
            Dept
        },
        props: {
            type: { type: String, default: '' },
            title: { type: String, default: '' },
            value: { type: null, default: '' },
            visible: { type: Boolean, default: false },
            multiple: { type: Boolean, default: false },
            excludes: { type: Array, default: () => [] },
            extendParams: { type: Object, default: () => ({}) }
        },
        data() {
            return {
                pickTypes,
                selectList: []
            }
        },
        computed: {
        },
        methods: {
            handleSubmit() {
                if (this.value || this.selectList.length) {
                    this.$emit('update:visible', false)
                    this.$emit('change', this.selectList)
                } else {
                    this.$message.warning('请至少选中一项')
                }
            },
            handlePickChange(list) {
                this.selectList = list
            }
        }
    }
</script>

<style lang='scss' scoped>

</style>
