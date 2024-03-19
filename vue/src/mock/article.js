import Mock from 'mockjs'
import { param2Obj } from '@/utils'

const List = []
const count = 100

const baseContent = '<p>我是测试数据我是测试数据</p><p><img src="https://wpimg.wallstcn.com/4c69009c-0fd4-4153-b112-6cb53d1cf943"></p>'
const image_uri = 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3'

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    timestamp: +Mock.Random.date('T'),
    author: '@first',
    reviewer: '@first',
    title: '@title(5, 10)',
    content_short: '我是测试数据',
    menName:'@first',//人员姓名
    'menType|1':['管理人员','一线工作人员','公厕管理人员','司机'] ,//人员类型
    'onlineStatus|1':['在线','离线'],//在线状态
    'belongPro|1':['宝安中心区清扫保洁项目','龙岗区清扫保洁项目','龙华区清扫保洁项目'],//项目类型
    'dutyTeam|1':['洪浪南路（新安公园至宝安中学段','留仙二路','创业一路'],//班组
    'dutyRange|1':['早班(8:00-10:00)','中班(10:00-12:00)',"晚班(18:00-19:00)"],//班次
    'dutyTime|1':['3小时12分','4小时40分'],//应上班时长
    'factTime|1':['3小时12分','4小时40分'],//实际上班时长
    dutyDate: +Mock.Random.date('T'),//当班日期
    'participation|1':['达标','未达标'],//出勤情况
    'proName|1':["沙井市场清扫保洁项目",'宝安大道清扫保洁项目','西乡步行街清扫环保项目'],//项目名称
    'proNum|1': /^\LJ\d{10}/,//项目编号，合同编号
    'proType|1':['市政','物业','内部项目'],//项目类型
    'proBelongArea|1':['宝安中心区','大学城片区','高新园片区'],//所在区域
    "proMoney|1-200.2-2": 1,//合同金额
    proTerm:'@date("yyyy-MM-dd")'+'至'+'@date("yyyy-MM-dd")',//项目周期
    'proManager|1':['张三','李四','王麻子','李二狗'],//项目经理
    'telNum|1':['12345678901','17620491508','15678342948'],//联系号码
    'relation|1':['张三','奥巴马','普京'],//客户联系人
    'department|1':['西乡街道办','石岩街道办'],//客户单位
    menSet:'200/'+Mock.Random.natural(100, 200),//人员配置
    vehicleSet:'12/'+Mock.Random.natural(6, 12),//车辆配置
    content: baseContent,
    forecast: '@float(0, 100, 2, 2)',
    importance: '@integer(1, 3)',
    'type|1': ['CN', 'US', 'JP', 'EU'],
    'status|1': ['published', 'draft', 'deleted'],
    display_time: '@datetime',
    comment_disabled: true,
    pageviews: '@integer(300, 5000)',
    image_uri,
    platforms: ['a-platform']
  }))
}

export default {
  getList: config => {
    const { importance, type, title, page = 1, limit = 20, sort } = param2Obj(config.url)

    let mockList = List.filter(item => {
      if (importance && item.importance !== +importance) return false
      if (type && item.type !== type) return false
      if (title && item.title.indexOf(title) < 0) return false
      return true
    })

    if (sort === '-id') {
      mockList = mockList.reverse()
    }

    const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))

    return {
      total: mockList.length,
      items: pageList
    }
  },
  getPv: () => ({
    pvData: [{ key: 'PC', pv: 1024 }, { key: 'mobile', pv: 1024 }, { key: 'ios', pv: 1024 }, { key: 'android', pv: 1024 }]
  }),
  getArticle: (config) => {
    const { id } = param2Obj(config.url)
    for (const article of List) {
      if (article.id === +id) {
        return article
      }
    }
  },
  createArticle: () => ({
    data: 'success'
  }),
  updateArticle: () => ({
    data: 'success'
  })
}
