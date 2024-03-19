<template>
    <div class="box-container">
        <edit-dialog
            :visible="editDictVisible"
            :title="title"
            :edit-id="editId"
            @closeDict="closeEdit"
        />
    </div>
</template>

<script>
    import {
        searchNamespace// 查询命名空间
    } from '@/api/systemSet/dict/index'
    import editDialog from './components/addEditDialog'
    export default {
        name: 'EditDictDialog',
        components: {
            editDialog
        },
        props: {
            editDictVisible: {
                type: Boolean,
                default: false
            },
            editId: {
                type: [String, Number]
            }
        },
        data() {
            return {
                searchParam: {},
                title: '编辑字典信息'
            }
        },
        watch: {
        },
        created() {},
        methods: {
            closeEdit() {
                this.$emit('closeEditDict', true)
            }
        }
    }
</script>

<style lang='scss'>
</style>
