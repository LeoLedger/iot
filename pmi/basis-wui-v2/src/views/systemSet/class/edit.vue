<template>
    <div class="box-container">
        <edit-dialog
            :visible="editClassVisible"
            :title="title"
            :edit-id="editId"
            @closeClass="closeEdit"
        />
    </div>
</template>

<script>
    import {
        searchNamespace// 查询命名空间
    } from '@/api/systemSet/class/index'
    import editDialog from './components/addEditDialog'
    export default {
        name: 'EditClassDialog',
        components: {
            editDialog
        },
        props: {
            editClassVisible: {
                type: Boolean,
                default: false
            },
            editId: {
                tyep: [String, Number]
            }
        },
        data() {
            return {
                searchParam: {},
                title: '编辑类型信息'
            }
        },
        watch: {
        },
        created() {},
        methods: {
            closeEdit() {
                this.$emit('closeEditClass', true)
            }
        }
    }
</script>

<style lang='scss'>
</style>
