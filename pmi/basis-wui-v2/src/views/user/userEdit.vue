<template>
  <div class="box-container">
    <edit-user-item :visible="editDialogVisible" :dialogTitle="dialogTitle" :userId="userId"
                    @closeDialog="closeDialog"></edit-user-item>
  </div>
</template>

<script>
  import EditUserItem from "./components/addEditUserItem";
  export default {
    name: "userEdit",
    data() {
      return {
        searchParam: {}
      };
    },
    props: {
      editDialogVisible: {
        type: Boolean,
        default: false
      },
      dialogTitle: {
        type: String
      },
      userId:{
        type:String
      }
    },
    components: {
      EditUserItem: EditUserItem
    },
    methods: {
      closeDialog(isFlush) {
        this.$emit("closeEditDialog",isFlush);
      }
    }
  };
</script>

<style scoped>

</style>
