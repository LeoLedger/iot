<!--
* @description 发票列表
* @author yc
!-->
<template>
    <div v-loading="loading" class="invoice-list">
        <div v-if="!!dataList.length" class="explain">共开具发票{{ invoice }}张，合计核销金额(含税)：{{ totalMoney1 | moneyFormat }}元；共开具押金条{{ deposit }}张，合计核销金额：{{ totalMoney2 | moneyFormat }}元</div>
        <InvoiceList
            :data-list="dataList"
        />
    </div>
</template>

<script>
    // API
    // 方法
    import rigorous from '@/utils/rigorous'
    // 组件
    import InvoiceList from '@/views/public/invoice/InvoiceList'

    export default {
        components: {
            InvoiceList
        },
        props: {
            isEdit: { type: Boolean, default: true },
            formData: { type: Object }
        },
        data() {
            return {
                loading: false,
                dataList: [],
                invoice: 0,
                deposit: 0,
                totalMoney1: 0,
                totalMoney2: 0
            }
        },
        computed: {

        },
        watch: {
            formData(data) {
                let list = []
                if (data && Array.isArray(data.invoiceList)) {
                    list = data.invoiceList.map(v => v)
                }
                this.updateList(list)
            }
        },
        mounted() {
        },
        methods: {
            updateList(list = []) {
                if (list.length) {
                    this.totalMoney1 = list.reduce((a, b) => {
                        if (b.type === 2) {
                            return a
                        }
                        return rigorous.floatAdd(a, b.levied)
                    }, 0)
                    this.totalMoney2 = list.reduce((a, b) => {
                        if (b.type === 2) {
                            return rigorous.floatAdd(a, b.amount)
                        }
                        return a
                    }, 0)
                    this.invoice = list.filter(v => v.type !== 2).length
                    this.deposit = list.filter(v => v.type === 2).length
                    this.dataList = list
                } else {
                    this.totalMoney1 = 0
                    this.totalMoney2 = 0
                    this.depositCount = 0
                    this.dataList = []
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
.explain {
    padding: 0 15px;
    margin-bottom: 5px;
}
</style>
