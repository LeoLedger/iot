<template>
    <div class="box-container">
        <add-dialog
            :visible="addMapsVisible"
            :str="str"
            :parent-id="parentId"
            :tree-data="treeData"
            @closeMap="closeAdd"
        />
    </div>
</template>

<script>
    import addDialog from './components/addEditDialog'
    export default {
        name: 'AddMapBox',
        components: {
            addDialog
        },
        props: {
            addMapsVisible: {
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
            closeAdd(bool) {
                this.$emit('closeAddMaps', bool)
            }
        }
    }
</script>

<style lang='scss'>
</style>
