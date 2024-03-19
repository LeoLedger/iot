<!--
    仓库仓位选择器（暂不支持多选）
 -->
<template>
    <el-cascader
        :value="value"
        :props="{...$attrs.props, emitPath: false}"
        :disabled="$attrs.disabled"
        :clearable="$attrs.clearable"
        :filterable="$attrs.filterable || true"
        :placeholder="$attrs.placeholder"
        :show-all-levels="$attrs.showAllLevels || true"
        :options="options"
        size="mini"
        class="warehouse-cascader"
        @change="handleChange"
    />
</template>

<script>
    import { isEmpty } from '@/utils'
    import { mapState } from 'vuex'

    export default {
        name: 'WarehouseCascader',
        props: {
            type: { type: String },
            formData: { type: Object, default: () => ({}) },
            stockKey: { type: String, default: '' }, // 仓库id key
            placeKey: { type: String, default: '' }, // 仓位id key
            typeIdKey: { type: String, default: '' }, // 仓位类型id key
            excludes: { type: Array }, // 排除列表
            canSelectStock: { type: Array } // 可以选择的仓位id列表
        },
        data() {
            return {
                leafs: [],
                options: [],
                loading: false
            }
        },
        computed: {
            ...mapState({
                'warehouseTree': state => {
                    var data = state.user.warehouseTree
                    if (data) {
                        return JSON.parse(JSON.stringify(data))
                    }
                    return {}
                }
            }),
            value() {
                return this.formData[this.placeKey]
            }
        },
        watch: {
            type: {
                handler() {
                    this.updateOptions()
                }
            },
            excludes: {
                deep: true,
                handler() {
                    this.updateOptions()
                }
            },
            canSelectStock: {
                deep: true,
                handler() {
                    this.updateOptions()
                }
            },
            warehouseTree: {
                handler() {
                    this.updateOptions()
                }
            }
        },
        mounted() {
            this.updateOptions()
        },
        methods: {
            // 更新仓库数据
            updateStock(data, typeId) {
                let excludes = this.excludes || []
                let canSelectStock = this.canSelectStock || []
                if (this.$attrs.disabled) {
                    return data
                } else {
                    return data.filter(stock => {
                        return excludes.indexOf(stock.value) === -1
                    }).map(stock => {
                        stock = { ...stock }
                        stock.children = stock.children.filter(place => {
                            place.path = [typeId, stock.value, place.value]
                            this.leafs.push(place)
                            if (excludes.indexOf(place.value) === -1) {
                                if (canSelectStock.length) {
                                    return canSelectStock.indexOf(place.value) > -1
                                } else {
                                    return true
                                }
                            }
                            return false
                        })
                        return stock
                    }).filter(stock => {
                        // 如果该仓库下没有可选择的仓位，则同时筛选掉该仓库
                        return stock.children.length && stock.children.findIndex(v => !v.disabled) > -1
                    })
                }
            },
            // 更新选项数据
            updateOptions() {
                this.leafs = []
                let options = this.warehouseTree.find(item => item.value === this.type)
                if (options) {
                    options = this.updateStock(options.children, this.type)
                } else {
                    options = this.warehouseTree.map(item => {
                        item.children = this.updateStock(item.children, item.value)
                        return item
                    })
                }
                this.options = options
            },
            // 选择器选中值改变时触发
            handleChange(value) {
                let data = this.leafs.find(v => v.value === value)
                if (data) {
                    let [type, stock, place] = data.path
                    this.$set(this.formData, this.stockKey, stock)
                    this.$set(this.formData, this.placeKey, place)
                    // 获取每个节点的对象
                    if (this.type) {
                        type = void 0
                        stock = this.options.find(v => v.value === stock)
                    } else {
                        type = this.options.find(v => v.value === type)
                        stock = type.children.find(v => v.value === stock)
                    }
                    place = stock.children.find(v => v.value === place)
                    if (this.typeIdKey) {
                        this.$set(this.formData, this.typeIdKey, place.typeId)
                    }
                    this.$emit('change', { type, stock, place })
                } else {
                    if (this.typeIdKey) {
                        this.$set(this.formData, this.typeIdKey, void 0)
                    }
                    this.$set(this.formData, this.stockKey, void 0)
                    this.$set(this.formData, this.placeKey, void 0)
                    this.$emit('change', {})
                }
            }
        }
    }

</script>

<style lang="scss" scoped>
</style>
