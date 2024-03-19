<template>
    <div class="areaItem">
        <el-input type="textarea"
                  :prefix-icon="form.prefixIcon"
                  :suffix-icon="form.suffixIcon"
                  v-model="params[form.prop]"
                  :autosize="form.autosize ? form.autosize : false"
                  :readonly="form.readonly"
                  :disabled="form.disabled || form.isEdit === false"
                  :placeholder="form.placeholder || '请输入' + form.label"
                  :resize="form.resize || 'none'"
                  @input="textAreaInput"
                  :maxlength="form.numLimit || 500"
                  :style="itemStyle + (form.itemWidth ? `width: ${form.itemWidth}px;` : '')">
        </el-input>
        <span v-if="form.numLimit" class="showNum">剩余字数：{{surplusNum}}</span>
    </div>
</template>

<script>
    export default {
        name: 'TextArea',
        props: {
            form: {
                type: Object,
                required: true
            },
            params: {
                type: Object,
                required: true
            }
        },
        data() {
            const {form, params} = this.$props
            // console.log(form, 'form params', params)
            return {}
        },
        computed: {
            itemStyle() {
                const {itemWidth} = this
                if (itemWidth) {
                    return `width: ${itemWidth}px;`
                }
                return ''
            },
            surplusNum() {
                const {
                        params,
                        form
                    } = this,
                    {numLimit = ''} = form;
              /*  console.log(form.prop,
                    params,
                    numLimit, '....form.prop......params........numLimit.....................')*/
                return numLimit - (params[form.prop] && params[form.prop].length || 0)
            }
        },
        methods: {
            textAreaInput(input) {
                const {
                    form,
                    params
                } = this;
                // console.error(input, 'default Input  params', params);
                if (form.textAreaInput && typeof form.textAreaInput === 'function') {
                    // console.log('prop textAreaInput function 执行...');
                    form.textAreaInput(input)
                }
            }
        }
    }

</script>

<style scoped lang="scss">
    .areaItem {
        /*background: #ccc;*/
        /*margin-bottom: 28px;*/
        position: relative;
        .showNum { // 展示textarea 可以输入的文字个数
            float: right;
            position: absolute;
            right: 0;
            bottom: -24px;
            font-size: 12px;
            color: #999;
        }
    }
</style>
