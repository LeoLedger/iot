<!--
* @description 创建用户----盒子
* @fileName add.vue
* @author 叶金龙
* @date 2019/06/14 10:14:56
* @version V1.0.0
!-->
<template>
    <div class="box-container">
        <add-dialog :visible="createUserVisible" @closeCreate="closeCreate" />
    </div>
</template>

<script>
    import addDialog from './components/addDialog'
    export default {
        name: 'CreateUserBox',
        components: {
            addDialog
        },
        props: {
            createUserVisible: {
                type: Boolean,
                default: false
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
            closeCreate(bool) {
                this.$emit('closeCreateUser', bool)
            }
        }
    }
</script>

<style lang='scss'>
</style>
