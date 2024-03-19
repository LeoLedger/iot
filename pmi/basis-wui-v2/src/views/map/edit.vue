<template>
    <div class="box-container">
        <edit-dialog
            :visible="editMapsVisible"
            :str="str"
            :tree-data="treeData"
            :edit-id="editId"
            :getbutton-obj="getbuttonObj"
            @closeMap="closeEdit"
        />
    </div>
</template>

<script>
    import editDialog from './components/addEditDialog'
    export default {
        name: 'EditMapBox',
        components: { editDialog },
        props: {
            editMapsVisible: {
                type: Boolean,
                default: false
            },
            str: {
                type: String
            },
            parentId: {
                type: [String, Number]
            },
            treeData: {
                type: Array
            },
            editId: {
                type: [String, Number]
            },
            getbuttonObj: {
                type: Object
            }
        },
        data() {
            return {
                searchParam: {}
            }
        },
        watch: {
            xxxxx: {
                immediate: true,
                handler(val) {}
            }
        },
        created() {},
        methods: {
            closeEdit(bool) {
                this.$emit('closeEditMaps', bool)
            }
        }
    }
</script>

<style lang='scss'>
</style>
