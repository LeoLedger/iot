const getters = {
    sidebar: state => state.app.sidebar,
    language: state => state.app.language,
    size: state => state.app.size,
    device: state => state.app.device,
    visitedViews: state => state.tagsView.visitedViews,
    cachedViews: state => state.tagsView.cachedViews,
    token: state => state.user.token,
    refreshToken: state => state.user.refreshToken,
    isLogin: state => state.user.isLogin,
    userInfo: state => state.user.userInfo,
    routers: state => state.permission.routers,
    flatRouters: state => state.permission.flatRouters,
    feature: state => state.permission.feature
}
export default getters
