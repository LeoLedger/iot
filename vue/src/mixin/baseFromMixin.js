// 基础表单混入

export default {
    props: {
        isEdit: { type: Boolean, default: true },
        isCreate: { type: Boolean, default: false },
        formData: { type: Object },
        lockedProps: { type: Array, default: () => [] },
        extendParams: { type: Object }
    },
    data() {
        return {
            model: {}
        }
    },
    computed: {
        insideFormData() {
            return { ...this.formData, ...this.model }
        }
    },
    methods: {
        // 提交表单
        submit() {
            return new Promise((resolve, reject) => {
                this.$refs.baseForm.submitHandler((data) => {
                    data = {
                        ...this.insideFormData,
                        ...data
                    }
                    resolve(data)
                }, (err, data) => {
                    this.$message.warning(Object.values(err)[0][0].message)
                    reject(err, data)
                })
            })
        },
        // 验证表单
        validate() {
            return new Promise((resolve, reject) => {
                this.$refs.baseForm.validate((valid, err) => {
                    if (valid) {
                        resolve(this.getFormData())
                    } else {
                        this.$message.warning(Object.values(err)[0][0].message)
                        reject(err)
                    }
                })
            })
        },
        // 对部分表单字段进行校验的方法
        validateField(props) {
            return new Promise((resolve, reject) => {
                let passCount = 0
                let errorCount = 0
                props = Array.isArray(props) ? props : [props]
                this.$refs.baseForm.$refs.baseForm.validateField(props, (err) => {
                    if (err) {
                        if (++errorCount === 1) {
                            this.$message.warning(err)
                            reject()
                        }
                    } else {
                        if (++passCount === props.length) {
                            resolve(this.getFormData())
                        }
                    }
                })
            })
        },
        // 获取当前已输入的formdata
        getFormData() {
            return this.$refs.baseForm.params
        },
        // 设置form配置
        setFormConfigProp(key, prop, value) {
            this.$set(this.forms.find(item => item.prop === key), prop, value)
        }
    }
}
