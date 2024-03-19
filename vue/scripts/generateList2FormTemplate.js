// index.js
const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const resolveFile = (...file) => path.resolve(__dirname, ...file)
const log = message => console.log(chalk.cyan(`${message}`))
const successLog = message => console.log(chalk.blue(`${message}`))
const errorLog = error => console.log(chalk.red(`${error}`))
// 导入模板
const {
    vueTemplate,
    vueFormTemplate,
    editDialogTemplate,
    routeEntryTemplate,
    columnConfigTemplate
} = require('./template_list2Form')

const { queryColumns } = require('./queryList')
// 生成文件
const generateFile = (path, data) => {
    if (fs.existsSync(path)) {
        errorLog(`${path}文件已存在`)
        return
    }
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, 'utf8', err => {
            if (err) {
                errorLog(err.message)
                reject(err)
            } else {
                resolve(true)
            }
        })
    })
}
log('请输入即将生成的list页面名称、生成在 views/目录下生成对应模块')
let componentName = ''
process.stdin.on('data', async chunk => {
    /**
     * 模块目录名称 !!! 请使用小写
     */
    const inputName = String(chunk).trim().toString()
    const componentPath = resolveFile('../src/views', inputName)
    // list.vue文件
    const vueFile = resolveFile(componentPath, 'list.vue')

    const componentsPath = resolveFile(componentPath, 'components')
    const FormFile = resolveFile(componentsPath, 'Form.vue')
    const EditDialogFile = resolveFile(componentsPath, 'EditDialog.vue')

    const columnConfig = resolveFile(componentPath, 'config.js')
    // 路由配置对象文件
    const routerConfigFile = resolveFile(componentPath, 'routerConfig.js')
    // 判断组件文件夹是否存在
    const hasComponentExists = fs.existsSync(componentPath)
    if (hasComponentExists) {
        errorLog(`${inputName}页面组件已存在，请重新输入`)
        return
    } else {
        log(`正在生成 模块目录 ${componentPath}`)
        await dotExistDirectoryCreate(componentPath)

        log(`正在生成 模块components目录 ${componentsPath}`)
        await dotExistDirectoryCreate(componentsPath)
    }
    try {
        // 获取输入的文件夹(子模块)名
        if (inputName.includes('/')) {
            const fileArr = inputName.split('/')
            componentName = fileArr[fileArr.length - 1]
        } else {
            componentName = inputName
        }
        log(`正在生成 list.vue 文件 ${vueFile}`)
        await generateFile(vueFile, vueTemplate(componentName))
        try {
            const columns = await queryColumns()
            await generateFile(columnConfig, columnConfigTemplate(columns))
        } catch (e) {
            console.error(e)
            errorLog('尝试创建 columns 失败')
        }
        log(`正在生成 Form.vue 文件 ${FormFile}`)
        await generateFile(FormFile, vueFormTemplate('生成Form'))

        log(`正在生成 EditDialog.vue 文件 ${EditDialogFile}`)
        await generateFile(EditDialogFile, editDialogTemplate('生成EditDialog'))

        log(`正在生成 routerConfig 文件 ${routerConfigFile}`)
        await generateFile(routerConfigFile, routeEntryTemplate(componentName))
        successLog('生成成功')
    } catch (e) {
        errorLog(e.message)
    }

    process.stdin.emit('end')
})
process.stdin.on('end', () => {
    process.exit()
})

function dotExistDirectoryCreate(directory) {
    return new Promise((resolve) => {
        mkDirs(directory, () => resolve())
    })
}
// 递归创建目录
function mkDirs(directory, callback) {
    const exists = fs.existsSync(directory)
    if (exists) {
        callback()
    } else {
        mkDirs(path.dirname(directory), () => {
            fs.mkdirSync(directory)
            callback()
        })
    }
}

