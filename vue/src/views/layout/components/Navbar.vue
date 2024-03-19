<template>
    <div class="navbar">
        <hamburger
            :toggle-click="toggleSideBar"
            :is-active="sidebar.opened"
            class="hamburger-container"
        />
        <breadcrumb />
        <el-dropdown class="avatar-container fr" trigger="click">
            <div class="avatar-wrapper">
                <span class="nameLabel">您好，</span>
                <span class="nameInfo">{{ userInfo.name }}</span>
                <img :src="getAddress()" class="user-avatar" >
                <i class="el-icon-caret-bottom" />
            </div>
            <el-dropdown-menu slot="dropdown" class="user-dropdown">
                <router-link class="inlineBlock" to="/">
                    <el-dropdown-item>Home</el-dropdown-item>
                </router-link>
                <el-dropdown-item divided>
                    <span style="display:block;" @click="updatePasswordDialog.visible = true">修改密码</span>
                </el-dropdown-item>
                <el-dropdown-item divided>
                    <span style="display:block;" @click="fedLogOut">退出</span>
                </el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>
        <!-- <div class="header-btn-list fr">
            <a class="link" @click="handleFeedbackClick">意见反馈</a>&nbsp;&nbsp;
            <a class="link" @click="handleQuestionnaireClick">问卷调查</a>
        </div> -->
        <Feedback :feedback-visible="feedbackVisible" @closeFeedbackDialog="handleFeedbackClick" />
        <Questionnaire
            :questionnaire-visible="questionnaireVisible"
            @closeQuestionnaireDialog="handleQuestionnaireClick"
        />
        <UpdatePasswordDialog
            :visible.sync="updatePasswordDialog.visible"
        />
    </div>
</template>

<script>
    import { uploadFileUrl } from '@/utils'
    import { mapGetters } from 'vuex'
    import Breadcrumb from '@/components/Breadcrumb'
    import Hamburger from '@/components/Hamburger'
    import Feedback from './Feedback'
    import Questionnaire from './Questionnaire'
    import UpdatePasswordDialog from './UpdatePasswordDialog'
    import { getHashCode } from '@/utils/auth'

    export default {
        components: {
            Breadcrumb,
            Hamburger,
            Feedback,
            Questionnaire,
            UpdatePasswordDialog
        },
        data() {
            return {
                feedbackVisible: false,
                questionnaireVisible: false,
                updatePasswordDialog: {
                    visible: false
                }
            }
        },
        computed: {
            ...mapGetters(['sidebar', 'userInfo'])
        },
        mounted() {},
        methods: {
            toggleSideBar() {
                this.$store.dispatch('toggleSideBar')
            },
            getAddress() {
                if (!this.userInfo.avatar) {
                    return 'http://hw-iot.shunone.com/api/fmp/thumbImage/eb333424-35f0-442e-934f-6dcb107d8d6d'
                }
                return uploadFileUrl + '/thumbImage/' + this.userInfo.avatar
            },
            fedLogOut() {
                this.$store.dispatch('fedLogOut').then(() => {
                    // location.reload(); // 为了重新实例化vue-router对象 避免bug
                    // this.$router.push("/login");
                    const code = getHashCode()
                    let path = '/login'
                    if (code) {
                        path += '/' + code
                    }
                    this.$router.push(path)
                    location.reload()
                })
            },
            // 意见反馈点击事件
            handleFeedbackClick() {
                this.feedbackVisible = !this.feedbackVisible
            },
            // 问卷调查点击事件
            handleQuestionnaireClick(type) {
                this.questionnaireVisible = !this.questionnaireVisible
            }
        }
    }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.navbar {
    height: 50px;
    line-height: 50px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
    .link {
        color: #409eff;
        display: inline-flex;
        -webkit-box-orient: horizontal;
        flex-direction: row;
        -webkit-box-align: center;
        align-items: center;
        -webkit-box-pack: center;
        justify-content: center;
        vertical-align: middle;
        position: relative;
        text-decoration: none;
        outline: 0;
        padding: 0;
        font-weight: 500;
        font-size: 14px;
        cursor: pointer;
        -webkit-box-direction: normal;
        background-color: transparent;
    }
    .hamburger-container {
        line-height: 58px;
        height: 50px;
        float: left;
        padding: 0 10px;
    }
    .screenfull {
        position: absolute;
        right: 90px;
        top: 16px;
        color: red;
    }
    .avatar-container {
        height: 50px;
        margin: 0 35px 0 10px;
        .avatar-wrapper {
            cursor: pointer;
            margin-top: 5px;
            position: relative;
            line-height: initial;
            .nameLabel {
                line-height: 44px;
                display: inline-block;
                height: 44px;
                vertical-align: middle;
            }
            .nameInfo {
                color: #409eff;
                display: inline-block;
                height: 44px;
                font-weight: 600;
                vertical-align: middle;
                line-height: 44px;
            }
            .user-avatar {
                width: 40px;
                height: 40px;
                vertical-align: middle;
                border-radius: 10px;
            }
            .el-icon-caret-bottom {
                position: absolute;
                right: -20px;
                top: 25px;
                font-size: 12px;
            }
        }
    }
}
</style>

