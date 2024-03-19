// 添加全局 directive
import prereclick from '@/directive/prereclick' // prereclick directive
import waves from '@/directive/waves' // Waves directive
export default {
    prereclick,
    waves
}

// const path = require('path')
// const files = require.context('./', false, /index\.js$/) // libraryPath, isDeep, fileName的regExp
// const curComponents = {}
// files.keys().forEach(key => {
//     console.error(path, 'path', key)
//     // const name = path.basename(key, '.vue')
//     // console.error(key, 'key   path', path)
//     // curComponents[name] = files(key).default || files(key)
// })
// export default files
