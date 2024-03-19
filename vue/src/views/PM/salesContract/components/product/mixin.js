
import contractApi from '@/api/PM/contract'
import productApi from '@/api/purchase/product'
// 方法
import { previewImgSrc } from '@/utils'
import rigorous from '@/utils/rigorous'
// 组件

export default {
    props: {
        isEdit: { type: Boolean, default: false },
        isCreate: { type: Boolean, default: false },
        formData: { type: Object },
        excludes: Array,
        salesType: { type: Number, default: 0 },
        extendParams: { type: Object, default: () => ({}) }
    },
    data() {
        return {
            dialogData: {
                visible: false
            }
        }
    },
    watch: {
        value: {
            immediate: true,
            handler(value) {
            }
        }
    },
    computed: {
        productImage() {
            return previewImgSrc + (this.model.productPic || {}).fileId
        }
    },
    mounted() {},
    methods: {
        // 获取产品详情
        async queryBaseInfo() {
            let model = this.model
            let { bomList, productId, originCount } = model
            let promises = [productApi.detail(productId)]
            if (this.isEdit) {
                promises.push(productApi.getBOM({ productId }))
            }
            let [info, boms] = await Promise.all(promises)
            if (info) {
                info = info.data
            }
            if (boms) {
                model.bomList = boms.data.map(item => {
                    let data = bomList.find(v => v.productId === item.productId)
                    let { number, productId, productCode, productName } = item
                    return {
                        count: number,
                        number,
                        id: data ? data.id : void 0,
                        guidId: data ? data.guidId : void 0,
                        salesType: 0,
                        productId,
                        productCode,
                        productName,
                        originCount
                    }
                })
                this.updateBomCount()
            }
            return { info }
        },
        // 获取产品原价格
        async queryOriginPrice() {
            var { salesType, sectionId, productId, serviceEndDate } = this.extendParams
            return await contractApi.getOriginPrice({
                salesType,
                sectionId,
                productId,
                serviceEndDate
            })
        },
        // 更新bom数量
        updateBomCount() {
            let model = this.model
            let count = model.count
            if (Array.isArray(model.bomList)) {
                model.bomList.forEach(item => {
                    item.count = count * item.number
                })
            }
        },
        // 更新总价
        updateTotalPrice(type = 'unit') {
            let model = this.model
            let count = model.count
            switch (type) {
            case 'unit':
                model.unitPriceMoveTotal = Number(rigorous.floatMul(model.unitPriceMove || 0, count).toFixed(2))
                model.unitPriceSalesTotal = Number(rigorous.floatMul(model.unitPriceSales || 0, count).toFixed(2))
                model.unitPriceDepositTotal = Number(rigorous.floatMul(model.unitPriceDeposit || 0, count).toFixed(2))
                model.unitPriceInstallTotal = Number(rigorous.floatMul(model.unitPriceInstall || 0, count).toFixed(2))
                model.unitPriceServicesTotal = Number(rigorous.floatMul(model.unitPriceServices || 0, count).toFixed(2))
                break
            case 'total':
                model.unitPriceMove = Number(rigorous.floatDiv(model.unitPriceMoveTotal || 0, count).toFixed(2))
                model.unitPriceSales = Number(rigorous.floatDiv(model.unitPriceSalesTotal || 0, count).toFixed(2))
                model.unitPriceDeposit = Number(rigorous.floatDiv(model.unitPriceDepositTotal || 0, count).toFixed(2))
                model.unitPriceInstall = Number(rigorous.floatDiv(model.unitPriceInstallTotal || 0, count).toFixed(2))
                model.unitPriceServices = Number(rigorous.floatDiv(model.unitPriceServicesTotal || 0, count).toFixed(2))
                break
            case 'rate':
                model.salesRate = Number(model.salesRate)
                model.serviceRate = Number(model.serviceRate)
                model.installRate = Number(model.installRate)
            }
            this.updateBomCount()
        },
        // 点击销售模式按钮时触发
        handleModelClick(data) {
            if (this.isEdit) {
                this.model.salesType = data.value
                this.$refs.ruleForm.validateField('salesType')
                this.salesTypeChange && this.salesTypeChange()
            }
        },
        // 点击产品信息时触发
        handleClickProduct() {
            this.dialogData = {
                visible: true,
                type: 'product',
                dataId: this.formData.productId
            }
        }
    }
}
