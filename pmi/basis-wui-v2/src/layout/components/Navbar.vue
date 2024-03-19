<template>
    <div class="navbar">
        <hamburger
            :is-active="sidebar.opened"
            class="hamburger-container"
            @toggleClick="toggleSideBar"
        />

        <breadcrumb class="breadcrumb-container" />

        <div class="right-menu">
            <el-dropdown class="avatar-container" trigger="click">
                <div class="avatar-wrapper">
                    <span class="nameLabel">您好，</span>
                    <span class="nameInfo">{{name}}</span>
                    <img :src="getAddress()" class="user-avatar" />
                    <i class="el-icon-caret-bottom" />
                </div>
                <el-dropdown-menu slot="dropdown" class="user-dropdown">
                    <router-link to="/">
                        <el-dropdown-item>Home</el-dropdown-item>
                    </router-link>
                    <el-dropdown-item divided>
                        <span style="display:block;" @click="logout">Log Out</span>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import Breadcrumb from "@/components/Breadcrumb";
import Hamburger from "@/components/Hamburger";

export default {
    components: {
        Breadcrumb,
        Hamburger
    },
    computed: {
        ...mapGetters(["sidebar", "avatar", "name"])
    },
    methods: {
        toggleSideBar() {
            this.$store.dispatch("app/toggleSideBar");
        },
        async logout() {
            await this.$store.dispatch("user/logout");
            this.$router.push(`/login?redirect=${this.$route.fullPath}`);
        },
        getAddress() {
            if (!this.avatar) {
                return "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1559560556116&di=3b9a0c1ff1a880a82781c8af779432c5&imgtype=0&src=http%3A%2F%2Fpic49.nipic.com%2Ffile%2F20140926%2F19603756_154352934000_2.jpg";
            }
            return (
                process.env.VUE_APP_uploadFileUrl + "/thumbImage/" + this.avatar
            );
        }
    }
};
</script>

<style lang="scss" scoped>
.navbar {
    height: 50px;
    overflow: hidden;
    position: relative;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

    .hamburger-container {
        line-height: 46px;
        height: 100%;
        float: left;
        cursor: pointer;
        transition: background 0.3s;
        -webkit-tap-highlight-color: transparent;

        &:hover {
            background: rgba(0, 0, 0, 0.025);
        }
    }

    .breadcrumb-container {
        float: left;
    }

    .right-menu {
        float: right;
        height: 100%;
        line-height: 50px;

        &:focus {
            outline: none;
        }

        .right-menu-item {
            display: inline-block;
            padding: 0 8px;
            height: 100%;
            font-size: 18px;
            color: #5a5e66;
            vertical-align: text-bottom;

            &.hover-effect {
                cursor: pointer;
                transition: background 0.3s;
                &:hover {
                    background: rgba(0, 0, 0, 0.025);
                }
            }
        }

        .avatar-container {
            margin-right: 30px;

            .avatar-wrapper {
                /*margin-top: 5px;*/
                position: relative;
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
                    cursor: pointer;
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    vertical-align: middle;
                }

                .el-icon-caret-bottom {
                    cursor: pointer;
                    position: absolute;
                    right: -20px;
                    top: 25px;
                    font-size: 12px;
                }
            }
        }
    }
}
</style>
