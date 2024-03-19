import {companyScaleEnum, companyTypeEnum, contractTypeEnum} from '@/utils/enum'

// 基础信息
export const basicForms = [
    {
        prop: 'name',
        label: '客户名称',
        isEdit: false
    },
    {
        prop: 'companyType',
        label: '客户类型',
        itemType: 'select',
        options: companyTypeEnum,
        isEdit: false
    }, {
        prop: 'contact',
        label: '客户联系人',
        isEdit: false
    }, {
        prop: 'contactPhone',
        label: '联系电话',
        isEdit: false
    }, {
        prop: 'legal',
        label: '企业法人',
        isEdit: false
    }, {
        prop: 'businessRegistrationNo',
        label: '工商注册号',
        isEdit: false
    }, {
        prop: 'companyScale',
        label: '企业规模',
        itemType: 'select',
        options: companyScaleEnum,
        isEdit: false
    }, {
        prop: 'province',
        label: '所在区域',
        isEdit: false,
        itemType: 'onlyshow',
        formatter(params) {
            const {province = '- -', city = '- -'} = params;
            // console.log(params, 'city')
            return province + '/' + city
        }
    }, {
        prop: 'address',
        label: '详细地址',
        span: 24,
        isEdit: false,
    }, {
        prop: 'remarks',
        label: '备注',
        itemType: 'textarea',
        span: 24,
        isEdit: false,
    }, { // [10]
        prop: 'visitUrl',
        label: '访问地址',
        span: 24,
        isEdit: false,
        append: true,
        // appendIcon: 'el-icon-edit',
        appendTxt: '复制',
        /*click(value) {
            let input = document.createElement('input')
            input.value = value
            document.body.append(input)
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input)
        }*/
    }, {
        prop: 'files',
        itemType: 'upload',
        label: '营业执照',
        span: 24,
        isEdit: false,
    }, {
        prop: 'logoFiles',
        itemType: 'upload',
        label: '公司logo',
        span: 24,
        isEdit: false,
    }
]
// 合同列表
export const contractColumns = [
    {
        prop: 'code',
        label: '合同编号',
                minWidth: 100,
        formatter: (row, column) => {
            // console.log(row, column, 'row, column');
            const text = row.code || ''; // @click="_this.showCustomerInfo(row)"
            return `<span class="infotext" title="${text}" >${text || '- -'}</span>`
        }
    },
    {
        prop: 'contractType',
        label: '合同类型',
        formatter: (row, column) => {
            const contractType = row.contractType;
            if(typeof contractType === 'undefined') {
                return '- -'
            }
            return (contractTypeEnum.find(({value}) => {
                return value == contractType
            }) || {}).label || '- -'
        }
    }, {
        prop: 'amount',
        label: '合同总额（元）',
    }, {
        prop: 'received',
        label: '已收款（元）',
    }, {
        prop: 'receivedRatio',
        label: '收款比例',
        formatter: (row, column) => {
            const value = row.receivedRatio;
            return typeof value !== 'undefined' ? value * 100 + '%' : '- -'
        }
    }, {
        prop: 'endDate',
        label: '服务截止日期',
    }
]
// 收款情况
export const receivedColumns = [
    {
        prop: 'gatheringDate',
        label: '收款日期',
    }, {
        prop: 'gatheringName',
        label: '收款人',
    }, {
        prop: 'gatheringAmount',
        label: '实收金额（元）',
    }, {
        prop: 'remarks',
        label: '备注说明',
    }, {
        prop: 'code',
        label: '对应合同',
                minWidth: 100,
        formatter: (row, column) => {
            // console.log(row, column, 'row, column'); //  @click="_this.showCustomerInfo(row)"
            const text = row.code || '';
            return `<span class="infotext" title="${text}">${text || '- -'}</span>`
        }
    },
]
