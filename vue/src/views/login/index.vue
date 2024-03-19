<template>
    <div class="login-container">
        <div class="logo-wrap">
            <img class="logo" src="@/assets/image/login/logo.png">
            <img class="name" src="@/assets/image/login/name.png">
        </div>
        <div class="placard">
            <div class="part"><img class="star1" src="@/assets/image/login/star1.png"></div>
            <div class="part"><img class="star2" src="@/assets/image/login/star2.png"></div>
            <div class="part"><img class="earth" src="@/assets/image/login/earth.png"></div>
            <div class="part"><img class="surround" src="@/assets/image/login/surround.png"></div>
        </div>
        <div class="login-form">
            <div class="head-wrap">
                <div class="title">欢迎登录</div>
                <div class="qrcode">
                    <el-popover placement="top" width="auto" trigger="hover">
                        <img style="width:220px;" src="@/assets/image/login/syQrcode.jpg">
                        <img slot="reference" class="icon" src="@/assets/image/login/qrcode.png">
                    </el-popover>
                </div>
            </div>
            <el-form
                ref="loginForm"
                :model="loginForm"
                :rules="loginRules"
                auto-complete="on"
                label-position="left"
            >
                <el-form-item prop="loginName">
                    <el-input
                        v-model="loginForm.loginName"
                        placeholder="请输入账号"
                        name="loginName"
                        type="text"
                        auto-complete="on"
                        size="medium"
                        clearable
                    />
                </el-form-item>
                <el-form-item prop="password">
                    <div class="password">
                        <el-input
                            v-model="loginForm.password"
                            :type="passwordType"
                            placeholder="请输入密码"
                            name="password"
                            auto-complete="on"
                            clearable
                            size="medium"
                        />
                        <span class="show-pwd" @click="showPwd">
                            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
                        </span>
                    </div>
                </el-form-item>
                <el-form-item prop="captcha">
                    <div class="captcha">
                        <el-input
                            v-model="loginForm.captcha"
                            :placeholder="$t('login.verifycode')"
                            style="width:200px"
                            name="captcha"
                            auto-complete="off"
                            size="medium"
                            clearable
                            @change="handleLogin"
                        />
                        <div class="identifybox" title="双击刷新验证码" @dblclick="refreshCode">
                            <img :src="identifyCode" width="80" height="30">
                        </div>
                    </div>
                </el-form-item>
                <el-button
                    :loading="loading"
                    type="primary"
                    class="button"
                    @click.native.prevent="handleLogin"
                ><span class="text">登录</span></el-button>
                <!-- <div class="register">
                    <img class="icon" src="@/assets/image/login/user.png">
                    <span class="text">用户注册</span>
                </div> -->
            </el-form>
        </div>
        <div class="copyright">
            <p>Copyright © 2019 深圳市图元科技有限公司 粤ICP备12053418号-1</p>
        </div>
    </div>
</template>

<script>
    import { uploadFileUrl } from '@/utils'
    import { getCaptcha } from '@/api/user'

    const isTest = ['development', 'staging'].includes(process.env.VUE_APP_ENV)

    export default {
        name: 'Login',
        data() {
            const validateUsername = (rule, value, callback) => {
                if (value.toString().trim() == '' || value == null) {
                    callback(new Error('请输入正确的用户名'))
                    this.refreshCode()
                } else {
                    callback()
                }
                callback()
            }
            const validatePassword = (rule, value, callback) => {
                if (value.length < 6) {
                    callback(new Error('请输入不小于6位的数字'))
                    this.refreshCode()
                } else {
                    callback()
                }
                callback()
            }
            return {
                companyLogoFileId: null,
                loginForm: {
                    loginName: isTest ? 'admin' : '',
                    password: isTest ? 'HWadmin123@#' : '',
                    captcha: '',
                    uuid: ''
                },
                loginRules: {
                    loginName: [
                        {
                            required: true,
                            trigger: 'blur',
                            validator: validateUsername
                        }
                    ],
                    password: [
                        {
                            required: true,
                            trigger: 'blur',
                            validator: validatePassword
                        }
                    ]
                },
                passwordType: 'password',
                loading: false,
                identifyCode: ''
            }
        },
        computed: {
            tenantLogo() {
                return (
                    uploadFileUrl + '/thumbImage/' + this.companyLogoFileId
                )
            }
        },
        watch: {
            $route: {
                handler: function(route) {
                    this.redirect = route.query && route.query.redirect
                },
                immediate: true
            }
        },
        mounted() {
            if (this.$route.query.token) {
                this.handleLoginByToken()
            } else {
                // 验证码初始化
                this.identifyCode = ''
                this.verifycode()
            }
        },
        methods: {
            showPwd() {
                if (this.passwordType === 'password') {
                    this.passwordType = ''
                } else {
                    this.passwordType = 'password'
                }
            },
            handleLoginByToken() {
                if (this.loading) return // 请求中不允许继续请求
                this.$store.dispatch('loginByToken', { token: this.$route.query.token }).then(() => {
                    this.loading = false
                    this.$router.push({
                        path: this.redirect || '/'
                    })
                }).catch(() => {
                    this.loading = false
                    this.refreshCode()
                })
            },
            handleLogin() {
                if (this.loading) return // 请求中不允许继续请求
                this.$refs.loginForm.validate(valid => {
                    if (valid) {
                        this.loading = true
                        this.$store.dispatch('login', this.loginForm).then(() => {
                            this.loading = false
                            this.$router.push({
                                path: this.redirect || '/'
                            })
                        }).catch(() => {
                            this.loading = false
                            this.refreshCode()
                        })
                    } else {
                        return false
                    }
                })
            },
            // 切换验证码
            refreshCode() {
                this.identifyCode = ''
                this.loginForm.uuid = ''
                this.verifycode()
            },
            //  获取验证码
            verifycode() {
                getCaptcha({ t: Date.now() }).then(res => {
                    if (res.success) {
                        this.identifyCode = res.data.base64
                        this.loginForm.uuid = res.data.uuid
                        if (isTest) {
                            this.loginForm.captcha = res.data.code
                        }
                    } else {
                        this.$message.error(res.msg)
                    }
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
.login-container{
    width: 100%;
    height: 100%;
    background-image: url(~@/assets/image/login/back.png);
    background-size: 100% 100%;
    .logo-wrap {
        position: absolute;
        top: 8vh;
        left: 10vw;
        z-index: 100;
        display: flex;
        align-items: center;
        user-select: none;
        .logo {
            height: 50px;
            margin-right: 30px;
        }
        .name {
            height: 40px;
            margin-right: 30px;
        }
    }
    .placard {
        position: absolute;
        left: 35%;
        top: 50%;
        transform: translate3d(0,-50%,0);
        user-select: none;
        .part {
            position: absolute;
            transform: translate3d(-50%,-50%,0);
        }
        .earth {
            animation: earth 10s linear infinite alternate;
        }
        .star1 {
            animation: star1 2.5s linear infinite alternate;
        }
        .star2 {
            opacity: 0;
            animation: star2 2.5s linear infinite alternate;
        }
    }
    .login-form {
        position: absolute;
        right: 11vw;
        top: 50%;
        width: 330px;
        height: 420px;
        transform: translate3d(0,-50%,0);
        background: #334772;
        border-radius: 28px;
        filter: blur(0px);
        padding: 30px;
        .head-wrap {
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 24px;
            .title {
                font-size: 24px;
            }
            .qrcode {
                cursor: pointer;
                .icon {
                    vertical-align: top;
                }
            }
        }
        .el-input {
            /deep/ {
                input{
                    font-size: 14px;
                    color: #9CBEF0;
                    border: none;
                    padding: 0;
                    background: transparent;
                    &::-webkit-input-placeholder {color: #9CBEF0;}
                    &:-webkit-autofill{
                        font-size: 14px;
                        -webkit-text-fill-color: #ededed !important;
                        background-color:transparent;
                        background-image: none;
                        transition: background-color 50000s ease-in-out 0s;
                    }
                }
            }
        }
        .el-form-item {
            border-bottom: solid 1px #647EA5;
            /deep/ {
                .el-form-item__error {
                    margin-top: 5px;
                }
            }
        }
        .password {
            display: flex;
            align-items: center;
            .show-pwd {
                color: #fff;
                cursor: pointer;
                margin-right: 5px;
            }
        }
        .captcha {
            display: flex;
            align-items: center;
        }
        .button {
            display: block;
            width: 100%;
            height: 44px;
            line-height: 44px;
            border-radius: 22px !important;
            background: #1F83FF;
            padding: 0;
            border: none;
            margin-top: 40px;
            &:hover {
                background: #1379f7;
            }
            .text {
                font-size: 14px;
            }
        }
        .register {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            margin-top: 20px;
            cursor: pointer;
            .text {
                color: #fff;
                font-size: 14px;
                margin-left: 5px;
            }
        }
    }
    .copyright {
        position: absolute;
        width: 100%;
        bottom: 15px;
        color: #9CBEF0;
        text-align: center;
        font-size: 12px;
    }
}
@keyframes earth {
  0% {transform: translateY(-20px);}
  100% {transform: translateY(20px)}
}
@keyframes star1 {
  0% {opacity: 1;}
  100% {opacity: 0;}
}
@keyframes star2 {
  0% {opacity: 0;}
  100% {opacity: 1;}
}

</style>
