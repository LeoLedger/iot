import store from '@/store'

export function checkFeature(value) {
    // if (1 || process.env.NODE_ENV === 'development') {
    //     return true
    // }
    if (Array.isArray(value) && value.length > 0) {
        const featureArr = store.getters && store.getters.feature || []
        const someFeature = value
        const hasfeature = featureArr.some(feature => {
            return someFeature.includes(feature)
        })
        return hasfeature
    } else {
        return true
        // throw new Error('need feature! Like v-if="checkFeature([\'65A3D109-4F3D-410A-B0FA-8F01E3DA09BB\'])"')
    }
}
// 是否包含权限，
export function includeFeature(value) {
    if (Array.isArray(value) && value.length > 0) {
        const featureArr = store.getters && store.getters.feature || []
        const someFeature = value
        const hasfeature = featureArr.findIndex(feature => {
            return someFeature.indexOf(feature) > -1
        }) > -1
        return hasfeature
    } else {
        throw new Error('need feature! Like v-if="checkFeature([\'65A3D109-4F3D-410A-B0FA-8F01E3DA09BB\'])"')
    }
}
