<template>
  <div class="onlyShow disabled">
    <template v-if="formatter">
      <div class="formatter" v-html="formatter(params, formData)"/>
    </template>
    <span v-else>{{ params[form.prop] || '- -' }}</span>
  </div>
</template>

<script>
export default {
  name: 'OnlyShowItem',
  props: {
    form: {
      type: Object,
      required: true
    },
    params: {
      type: Object,
      required: true
    },
    formData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    const { form, params, formData } = this.$props
    console.log(form, 'form params', params, formData)
    return {}
  },
  computed: {
    formatter() {
      const {
        formatter,
        valueFormat
      } = this.form
      if (typeof formatter === 'function') {
        return formatter
      } else if (typeof valueFormat === 'function') {
        return valueFormat
      }
      return false
    }
  },
  methods: {
  }
}

</script>

<style scoped lang="scss">
    .onlyShow {
      -webkit-appearance: none;
      background-color: #fff;
      background-image: none;
      border-radius: 4px;
      border: 1px solid #dcdfe6;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      color: #606266;
      display: inline-block;
      font-size: inherit;
      outline: 0;
      padding: 0 15px;
      height: 29px;
      width: 100%;
      &.disabled {
        background-color: #f5f7fa;
        border-color: #e4e7ed;
        /*color: #c0c4cc;*/
        color: #606266;
        cursor: not-allowed;
      }
    }
</style>
