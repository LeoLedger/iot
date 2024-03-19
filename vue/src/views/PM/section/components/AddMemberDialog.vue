<template>
    <!-- 添加人员 -->
    <el-dialog
        v-if="visible"
        :visible="visible"
        :close-on-click-modal="false"
        title="添加人员"
        width="420px"
        append-to-body
        class=""
        @close="handleClose"
    >
        <div class="add-people">
            <AddMemberForm
                v-loading="loading"
                v-if="visible"
                ref="BaseForm"
                :is-edit="true"
                :extend-params="extendParams"
                :excludes="excludesId"
            />
        </div>
        <span slot="footer">
            <el-button size="mini" @click="handleClose">取 消</el-button>
            <el-button v-prereclick type="primary" size="mini" @click="handleConfirm">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import AddMemberForm from '@/views/PM/section/components/AddMemberForm'
    export default {
        name: 'AddMemberDialog',
        components: { AddMemberForm },
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            extendParams: {
                type: Object,
                default: () => {}
            },
            excludes: {
                type: Array,
                default: () => []
            }
        },
        data() {
            return {
                formModel: {},
                loading: false,
                excludesId: []
            }
        },
        watch: {
            excludes: {
                handler(val) {
                    this.excludesId = []
                    if (val && val.length) {
                        this.excludesId = this.excludes.filter(v => !v.dbStatus).map(item => item.memberUserId)
                    } else {
                        this.excludesId = []
                    }
                },
                deep: true,
                immediate: true
            }
        },
        methods: {
            handleClose() {
                this.$emit('close', false)
            },
            handleConfirm() {
                this.$refs.BaseForm.submit((people) => {
                    this.$emit('confirm', people)
                    this.$emit('close', false)
                })
            }
        }
    }
</script>

<style scoped>

</style>
