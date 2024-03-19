const getters = {
    sidebar: state => state.app.sidebar,
    device: state => state.app.device,
    token: state => state.user.token,
    avatar: state => state.user.avatar,
    name: state => state.user.name,
    appId: status => status.app.appId,
    addRouters: state => state.menu.aside,
    permission_routers: state => state.menu.aside,
    privilege: state => state.privilege.privilegeIds,
    mapType: state => state.system.mapType,
    getAppSettings: (state) => (_key) => {
        const obj = state.user.appSettings.find(({key, value}) => key === _key)
        return obj && obj.value
    },
}
export default getters
