<!--
* @description
* @fileName add.vue
* @author 叶金龙
* @date 2019/06/19 13:26:22
* @version V1.0.0
!-->
<template>
  <div class="box-container">
    <add-dialog
      :str="str"
      :treeData="treeData"
      :authVisible="addAuthVisible"
      :editInfoObj="editInfoObj"
      @closeAuth="closeAuth"
    />
  </div>
</template>

<script>
  import addDialog from "./components/addEditDialog";

  export default {
    name: "addAuthBox",
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
      },
      treeData: {
        type: Array
      },
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
