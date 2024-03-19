<!--
* @description 行业管理-新增
* @fileName add.vue
* @author Herux
* @date 2020/09/11
* @version V1.0.0
!-->
<template>
  <div class="box-container">
    <add-dialog
      :str="str"
      :authVisible="addAuthVisible"
      :editInfoObj="editInfoObj"
      @closeAuth="closeAuth"
    />
  </div>
</template>

<script>
  import addDialog from "./components/addEditDialog";

  export default {
    name: "addIndustryBox",
    data() {
      return {
        searchParam: {}
      };
    },
    props: {
      addAuthVisible: {
        type: Boolean,
        default: false
      },
      str: {
        type: String
      },
      editInfoObj: {
        type: Object
      }
    },
    created() {
    },
    components: {
      addDialog
    },
    methods: {
      closeAuth(bool) {
        this.$emit("closeAddAuth", bool);
      }
    }
  };
</script>

<style lang='scss'>
</style>
