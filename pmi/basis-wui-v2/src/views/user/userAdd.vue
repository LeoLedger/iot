<template>
  <div class="box-container">
    <add-user-item :visible="addDialogVisible" :dialogTitle="dialogTitle" :deptId="deptId"
                   @closeDialog="closeDialog"></add-user-item>
  </div>
</template>

<script>
  import AddUserItem from "./components/addEditUserItem";

  export default {
    name: "userAdd",
    data() {
      return {
        searchParam: {}
      };
    },
    props: {
      addDialogVisible: {
        type: Boolean,
        default: false
      },
      dialogTitle: {
        type: String
      },
      deptId:{
        type: String
      }
    },
    components: {
      AddUserItem: AddUserItem
    },
    methods: {
      closeDialog(isFlush) {
        this.$emit("closeAddDialog",isFlush);
      }
    }
  };
</script>

<style lang='scss'>
</style>
