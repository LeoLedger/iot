<!--
* @description
* @fileName add.vue
* @author 叶金龙
* @date 2019/06/17 11:16:59
* @version V1.0.0
!-->
<template>
    <div class="box-container">
        <add-dialog
            :visible="createRoleVisible"
            :owner-type-enum="ownerTypeEnum"
            :roles-type="rolesType"
            @closeCreate="closeCreate"
        />
    </div>
</template>

<script>

    import addDialog from './components/addDialog'
    export default {
        name: 'Xx',
        components: {
            addDialog
        },
        props: {
            createRoleVisible: {
                type: Boolean,
                default: false
            },
            rolesType: {
                type: Array
            },
            ownerTypeEnum: {
                type: Array
            }
        },
        data() {
            return {
                pagination: {
                    records: 0,
                    pageIndex: 0,
                    ageTotal: 0
                },
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
            closeCreate(bool) {
                this.$emit('closeCreateRole', bool)
            }
        }
    }
</script>

<style lang='scss'>
</style>
