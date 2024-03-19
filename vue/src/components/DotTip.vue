<template>
    <div v-show="show" :title="text?text:false" style="position: absolute">
        <i
            :class="icon"
            :style="{
                zIndex: 99,
                position: 'absolute',
                fontSize: iconSize,
                left: '2px',
                top: '2px',
                color: iconColor
            }"
        />
    </div>
</template>

<script>
    export default {
        name: 'Dot',
        props: {
            show: {
                type: Boolean,
                default: false
            },
            icon: {
                type: String,
                default: 'el-icon-warning'
            },
            iconColor: {
                type: String,
                default: 'red'
            },
            iconSize: {
                type: String,
                default: '14px'
            },
            text: {
                type: String
            },
            dotList: {
                type: Array,
                default: () => []
            },
            dotKey: {
                type: String,
                default: null
            }
        },
        watch: {
            show: {
                handler() {
                    if (this.show && this.dotKey) {
                        const index = this.dotList.findIndex((item) => {
                            return item === this.dotKey
                        })
                        if (index < 0) {
                            this.dotList.push(this.dotKey)
                            console.log('change', this.dotList)
                            this.$emit('change', this.dotList)
                        }
                    }
                    if (!this.show && this.dotKey) {
                        const index = this.dotList.findIndex((item) => {
                            return item === this.dotKey
                        })
                        if (index > -1) {
                            this.dotList.splice(index, 1)
                            console.log('change', this.dotList)
                            this.$emit('change', this.dotList)
                        }
                    }
                },
                immediate: true
            }
        },
        mounted() {},
        destroyed() {}
    }
</script>

<style scoped>

</style>
