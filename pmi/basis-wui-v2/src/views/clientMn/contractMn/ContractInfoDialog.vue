<!--
* @description
* @fileName CustomerInfoDialog.vue
* @author 姜庆博
* @date 2019/06/17 17:57:44
* @version V1.0.0
!-->
<template>
  <div>
    <!-- 合同详情 ContractInfoDialog -->
    <el-dialog class="formDialog"
               :title="title"
               :visible="visible"
               :close-on-click-modal="false"
               width="800px"
               v-loading="pageLoading"
               element-loading-text="加载中..."
               @close="closeDialog">
      <el-tabs>
        <el-tab-pane label="基础信息">
          <FormConfig
                  ref="form"
                  :forms="basicForms"
                  :span="12"
                  :formData="detailInfo"
                  :labelWidth="labelWidth"
                  :showFooter="false"
          />
        </el-tab-pane>
        <el-tab-pane label="收款情况">
          <div class="Mentitle">
            <span>应收款项：{{getMoneyStr(detailInfo.amount)}}元</span>
            <span>实收款项：{{getMoneyStr(detailInfo.received)}}元</span>
            <span>未收款项：{{getMoneyStr(detailInfo.amount - detailInfo.received)}}元</span>
            <el-button type="primary" size="mini" icon="el-icon-setting" circle
                    style="float:right;margin-top:5px"
                    @click="addReceiveAmount"
            ></el-button>
          </div>
          <TableComponent :list="detailInfo.payPlan"
                          :options="options"
                          :columns="receivedColumns"/>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <ReceiveAmountDialog
            v-if="receiveAmountVisible"
            v-bind:visible.sync="receiveAmountVisible"
            :formData="receiveData"
            :canSelectedContract="false"
            @amountSubmitCallBack="packageSubmitCallBack"
    />
  </div>
</template>

<script>
  import FormConfig from "@/components/FormConfig";
  import TableComponent from "@/components/TableComponent";
  import ReceiveAmountDialog from "../components/ReceiveAmountDialog"

  import {
    searchServicePackage, // 搜索
    getTenantContractDetail, // 合同详情
  } from "@/api/clientMn";
  import {getDeepValue} from '@/utils/commonUtil'
  import {
    basicForms,
    receivedColumns
  } from "./contractInfoConfig";

  export default {
    name: 'CustomerInfoDialog',
    components: {
      FormConfig,
      TableComponent,
      ReceiveAmountDialog,
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      id: {
        type: Number,
      }
    },
    data() {
      const {formData} = this.$props;
      let params = {}
      const forms = [
        {
          prop: 'id', // servicePackageId
          label: '套餐名称',
          itemType: 'select',
          labelKey: 'name',
          valueKey: 'id', // 参考金额
          options: [],
          change: (res) => {
            let obj = this.servicePackageList.find(({id}) => {
              return id === res
            }) || {}
            // 格式化展示：
            this.referenceAmount = this.getMoneyStr(obj.referenceAmount)
          }
        },
        { // 选人
          prop: 'userCount',
          label: '用户数量（人）',
          itemType: 'inputNumber',
        },
        {
          prop: 'smsCount',
          label: '短信数量（条）',
          itemType: 'inputNumber',
        },
        {
          prop: 'storageSize',
          label: '存储空间（GB）',
          itemType: 'inputNumber',
        },
        {
          prop: 'remarks',
          label: '备注说明',
          itemType: 'textarea',
          autosize: {minRows: 3, maxRows: 6},
        },
      ]
      return {
        params,
        // 配置弹窗
        title: '合同详情',
        labelWidth: 110,
        loading: false,
        forms,
        formOptions: {
          submitBtnText: '提交',
          showCancelBtn: true,
        },
        servicePackageList: [],
        referenceAmount: '',

        packageDialogVisible: false,
        pageLoading: true,

        receiveAmountVisible: false,
        receiveData: {},

        basicForms,
        detailInfo: {payPlan: []},

        receivedColumns,
        // 收款情况 列表 配置
        options: {
          height: 400,
        },
    }
    },
    computed: {
      peopleRate() {
        const {peopleUsedNumber, userCount} = this.detailInfo;
        if(userCount) {
          return +(peopleUsedNumber / userCount).toFixed(2)
        }
        return 0
      },
      smsRate() {
        const {smsUsedNumber, smsCount} = this.detailInfo;
        if(smsCount) {
          return +(smsUsedNumber / smsCount).toFixed(2)
        }
        return 0
      },
      storageSizeRate() {
        const {usedStorageSpace, storageSize} = this.detailInfo;
        if(storageSize) {
          return +(usedStorageSpace / storageSize).toFixed(2)
        }
        return 0
      }
    },
    async created() {
      searchServicePackage().then((res) => {
        const servicePackageList = getDeepValue(res, ['data', 'data', 'rows']) || []
        this.servicePackageList = servicePackageList;
        this.$set(this.forms[0], 'options', servicePackageList)
      })
      this.packageSubmitCallBack()
    },
    methods: {
      closeDialog() {
        this.changeDialog(false)
      },
      changeDialog(bool) {
        this.$emit("update:visible", bool)
      },
      getComputedColor(rate) {
        if(rate > 90) {
          return '#f56c6c'; // 红色警告
        } else if(rate > 70) {
          return '#FFB800'; // 黄色警告
        } else {
          return '#5FB878';
        }
      },
      async packageSubmitCallBack() { // 触发 更新 数据
        const {id} = this;
        const detail = await this.getCurrentTenantContractDetail(id); // 合同详情
        // console.log(detail, 'detail..........')
       /*let gatheringPayed = 0;
       (detail.payPlan || []).map(item => {
            if(item.gatheringAmount) {
              gatheringPayed += item.gatheringAmount
            }
        })*/
        // detail.gatheringPayed = received;
        this.detailInfo = detail;
      },
      // 获取合同详情
      getCurrentTenantContractDetail(id) {
        return getTenantContractDetail(id).then((res) => {
          const {success, data, message} = res.data;
          this.pageLoading = false;
          if(success) {
            return data || {}
          } else {
            this.$message.error(message);
          }
        }).catch(() => {
          this.pageLoading = false;
        })
      },
      getMoneyStr(num) {
        return (+num).toLocaleString('zh', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      },
      addReceiveAmount() {
        // console.log('payPla addReceiveAmountn', this.detailInfo)
        const {id, code} = this.detailInfo;
        this.receiveData = {contractId : id, contractObj: {value: id, label: code}}   // 传递 合同 id
        this.receiveAmountVisible = true;
      }
    }
  }
</script>

<style lang='scss' scoped>
</style>
