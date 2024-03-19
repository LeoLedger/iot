<template>
    <section class="app-main">
        <transition name="fade-transform" mode="out-in">
            <keep-alive>
                <router-view :max="10"/>
            </keep-alive>
        </transition>
    </section>
</template>
<style lang="scss" scoped>
.app-main {
    /*50 = navbar  */
    height: calc(100vh - 87px);
    position: relative;
    overflow: hidden;
    background: #e9eef2;
    /deep/ {
        .layout-container {
            height: calc(100vh - 87px);
        }
    }
}
</style>
