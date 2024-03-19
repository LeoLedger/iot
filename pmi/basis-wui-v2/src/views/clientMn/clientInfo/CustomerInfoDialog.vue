<!--
* @description
* @fileName CustomerInfoDialog.vue
* @author 姜庆博
* @date 2019/06/17 17:57:44
* @version V1.0.0
!-->
<template>
  <div>
    <!-- 客户详情 CustomerInfoDialog -->
    <el-dialog class="formDialog"
               title="客户详情"
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
        <el-tab-pane label="服务套餐">
          <div class="Mentitle">
            标准套餐<el-button
                    type="primary"
                    size="mini"
                    icon="el-icon-setting"
                    circle
                    style="float:right;margin-top:5px"
                    @click="packageDialogVisible = true"
            ></el-button>
          </div>
          <div class="box">
            <div class="item">
              <p class="title"><i class="el-icon-info"></i>用户数量</p>
              <div class="content">
                <p class="detail"><span>{{detailInfo.userCount}}</span>人</p>
                <el-progress :percentage="peopleRate" :stroke-width="12" :text-inside="true" :color="getComputedColor(peopleRate)"></el-progress>
                <p>已用{{detailInfo.peopleUsedNumber}}人 ({{peopleRate}}%)</p>
              </div>
            </div>
            <div class="item">
              <p class="title"><i class="el-icon-message"></i>短信数量</p>
              <div class="content">
                <p class="detail"><span>{{detailInfo.smsCount}}</span>条</p>
                <el-progress :percentage="smsRate" :stroke-width="12" :text-inside="true" :color="getComputedColor(smsRate)"></el-progress>
                <p>已用{{detailInfo.smsUsedNumber}}条 ({{smsRate}}%)</p>
              </div>
            </div>
            <div class="item">
              <p class="title"><i class="el-icon-document"></i>存储空间</p>
              <div class="content">
                <p class="detail"><span>{{detailInfo.storageSize}}</span>GB</p>
                <el-progress :percentage="storageSizeRate" :stroke-width="12" :text-inside="true" :color="getComputedColor(storageSizeRate)"></el-progress>
                <p>已用{{detailInfo.usedStorageSpace}}GB ({{storageSizeRate}}%)</p>
              </div>
            </div>
          </div>
          <p class="boxTip">为企业提供道路清扫保洁系统、物业系统的使用权限。</p>
        </el-tab-pane>
        <el-tab-pane label="关联合同">
          <TableComponent :list="detailInfo.tenantContracts"
                          :options="options"
                          :columns="contractColumns"
          />
        </el-tab-pane>
        <el-tab-pane label="收款情况">
          <div class="Mentitle">
            <span>应收款项：{{getMoneyStr(detailInfo.amount)}}元</span>
            <span>实收款项：{{getMoneyStr(detailInfo.gatheringPayed)}}元</span>
            <span>未收款项：{{getMoneyStr(detailInfo.amount - detailInfo.gatheringPayed)}}元</span>
            <el-button type="primary" size="mini" icon="el-icon-setting" circle
                  style="float:right;margin-top:5px"
                  @click="addReceiveAmount"
          ></el-button>
          </div>
          <TableComponent :list="detailInfo.computedPayPlans"
                          :options="options"
                          :columns="receivedColumns"/>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <!-- 配置服务套餐 -->
    <PackageDialog
            v-bind:visible.sync="packageDialogVisible"
            :formData="detailInfo"
            @packageSubmitCallBack="packageSubmitCallBack"
    />
    <!-- 添加收款 -->
    <ReceiveAmountDialog
            v-if="receiveAmountVisible"
            v-bind:visible.sync="receiveAmountVisible"
            :formData="receiveData"
            :name="detailInfo.name"
            @amountSubmitCallBack="packageSubmitCallBack"
    />
  </div>
</template>

<script>
  import FormConfig from "@/components/FormConfig";
  import TableComponent from "@/components/TableComponent";
  import ReceiveAmountDialog from "../components/ReceiveAmountDialog"

  import {
    getTenantDetail, // 客户详情信息
  } from "@/api/clientMn";
  import {getDeepValue} from '@/utils/commonUtil'
  import {
    basicForms,
    contractColumns,
    receivedColumns
  } from "./customerInfoConfig";
  import PackageDialog from "./PackageDialog"

  export default {
    name: 'CustomerInfoDialog',
    components: {
      FormConfig,
      TableComponent,
      PackageDialog,
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
      return {
        // 配置弹窗
        title: '配置服务套餐',
        labelWidth: 110,
        loading: false,
        formOptions: {
          submitBtnText: '提交',
          showCancelBtn: true,
        },
        servicePackageList: [],
        referenceAmount: '',

        packageDialogVisible: false,
        // pageLoading: true,
        pageLoading: false,
        // 添加收款
        receiveAmountVisible: false,
        receiveData: {},

        basicForms,
        detailInfo: {
          computedPayPlans: [], // 叠加后的还款计划
          amount: 0, // 总金额
          gatheringPayed: 0, // 收到的钱
        },
        contractColumns,
        receivedColumns,
        // 关联合同 收款情况的 列表 配置
        options: {
          height: 400,
        },
    }
    },
    computed: {
      peopleRate() {
        const {peopleUsedNumber, userCount} = this.detailInfo;
        if(userCount) {
          return +(peopleUsedNumber / userCount * 100).toFixed(2)
        }
        return 0
      },
      smsRate() {
        const {smsUsedNumber, smsCount} = this.detailInfo;
        if(smsCount) {
          return +(smsUsedNumber / smsCount * 100).toFixed(2)
        }
        return 0
      },
      storageSizeRate() {
        const {usedStorageSpace, storageSize} = this.detailInfo;
        if(storageSize) {
          return +(usedStorageSpace / storageSize * 100).toFixed(2)
        }
        return 0
      },
    },
    created() {
      this.packageSubmitCallBack()
      this.$set(this.basicForms[10], 'click',(value) => {
        let input = document.createElement('input')
        input.value = value
        document.body.append(input)
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input)
        this.$message.success('复制成功');
      })
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
      getMoneyStr(num) {
        return (+num).toLocaleString('zh', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      },
      packageSubmitCallBack() { // 触发 更新 数据
        const {id} = this;
        getTenantDetail(id).then((res) => {
          const {success, data, message} = res.data;
          this.pageLoading = false;
          if(success) {
            const result =  data || {},
                    tenantContracts = data.tenantContracts;
            let gatheringPayed = 0, amount = 0; // 收到的钱 总数
            // console.error(tenantContracts, 'tenantContracts')
            if(Array.isArray(tenantContracts)) {
              // amount = getDeepValue(tenantContracts, ['0', 'amount']); // 总金额
              result.computedPayPlans = tenantContracts.reduce((result, item) => {
                const {payPlans, tenantId, code, } = item;
                amount += item.amount
                const computedPayPlans = (payPlans || []).map(item => {
                  // console.log(item.gatheringAmount, 'gatheringAmount')
                  gatheringPayed += item.gatheringAmount
                  return {...item, tenantId, code}
                })
                result.push(...computedPayPlans)
                return result
              }, []) // 遍历  还款计划 列表
              // console.warn(result.computedPayPlans, 'result.computedPayPlans')
            }
            result.gatheringPayed = gatheringPayed; // 收到的总金额
            result.amount = amount; // 需要收总金额
            // console.warn(gatheringPayed, 'gatheringPayed/..............')
            this.detailInfo = result;
          } else {
            this.$message.error(message);
          }
        })
      },
      addReceiveAmount() {
        const {id, name} = this.detailInfo;
        this.receiveData = {contractId : id}
        // this.selectedContractOption = [{ value: id, label: name}]
        this.receiveAmountVisible = true;
      }
    }
  }
</script>

<style lang='scss' scoped>
  .FormConfig {
    .el-input-number {
      width: 100%;
    }
    .footer {
      padding-top: 10px;
      border-top: 1px solid #dcdfe6;
      text-align: right;
    }
    .el-col {
      border-bottom: 0;
    }
  }
  .tip {
    padding-left: 80px;
    color: #aaa;
  }
  .box {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #eee;
    .item {
      flex: 1;
      text-align: center;
      & + .item {
        border-left: 1px solid #eee;
      }
    }
    .title {
      background: #FAFAFA;
      height: 40px;
      line-height: 40px;
      margin: 0;
      color: #333;
      font-size: 13px;
      border-bottom: 1px solid #eee;
      > i {
        font-size: 16px;
        color: #409EFF;
        margin-right: 4px;
      }
    }
    .content {
      padding: 0 36px;
      color: #7f7f7f;
      .detail {
        color: #333;
        font-weight: 700;
        span {
          font-size: 24px;
        }
      }
    }
  }
  .boxTip {
    margin: 0;
    border: 1px solid #eee;
    border-top: 0;
    height: 40px;
    line-height: 40px;
  }
  .Mentitle {
    span {
      margin-right: 20px;
    }
  }
</style>
