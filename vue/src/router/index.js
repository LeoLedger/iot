import Vue from 'vue'
import Router from 'vue-router'

// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'
const NoFound = () => import(/* webpackChunkName: "404" */ '@/views/404')
const Home = () => import(/* webpackChunkName: "login" */ '@/views/home/index')
const Login = () => import(/* webpackChunkName: "login" */ '@/views/login/index')
const EmptyRouterView = () => import(/* webpackChunkName: "EmptyRouterView" */ '@/views/EmptyRouterView')

/**
 * hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
 *                                if not set alwaysShow, only more than one route under the children
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noredirect           if `redirect:noredirect` will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    title: 'title'               the name show in subMenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if false, the item will hidden in breadcrumb(default is true)
  }
 **/
const isDev = process.env.VUE_APP_ENV === 'development'

// 公共的路由
export const publicRouter = [
    {
        path: '/login/:hashCode?',
        name: 'login',
        component: Login,
        hidden: true
    },
    {
        path: '/404',
        component: NoFound,
        hidden: true
    },
    {
        path: '/',
        component: Layout,
        redirect: '/dashboard',
        name: '物联地图',
        hidden: true,
        children: [
            {
                meta: {
                    title: '物联地图'
                },
                path: 'dashboard',
                component: () => import('@/views/IOTMap/index')
            }
        ]
    }
]
// 开发用路由
export const devRoutes = [
    {
        path: '/mapTest',
        name: 'mapTest',
        redirect: '/mapTest',
        meta: {
            title: '测试用地图',
            icon: 'icon_workset'
        },
        children: [
            {
                meta: {
                    title: '测试用地图'
                },
                path: 'mapTest',
                component: () => import('@/views/mapTest/mapTest')
            }
        ],
        component: Layout
    },
    {
        path: '/businessDocuments',
        name: 'businessDocuments',
        component: Layout,
        redirect: '/businessDocuments',
        meta: {
            title: '业务单据',
            icon: 'icon_workset'
        },
        children: [
            {
                name: 'pending',
                path: 'pending',
                meta: {
                    title: '待处理'
                },
                component: () => import('@/views/businessDocuments/pending/index')
            },
            {
                name: 'documents',
                path: 'documents',
                meta: {
                    title: '业务单据'
                },
                component: () => import('@/views/businessDocuments/documents/index')
            }
        ]
    },
    {
        path: '/PM',
        name: 'PM',
        component: Layout,
        redirect: '/PM',
        meta: {
            title: '项目管理',
            icon: 'icon_workset'
        },
        children: [
            {
                name: 'project',
                path: 'project',
                meta: {
                    title: '项目'
                },
                component: () => import('@/views/PM/project/index')
            },
            {
                name: 'section',
                path: 'section',
                meta: {
                    title: '标段'
                },
                component: () => import('@/views/PM/section/index')
            },
            {
                name: 'client',
                path: 'client',
                meta: {
                    title: '客户'
                },
                component: () => import('@/views/PM/client/index')
            },
            {
                name: 'contacts',
                path: 'contacts',
                meta: {
                    title: '联系人'
                },
                component: () => import('@/views/PM/contacts/index')
            },
            {
                name: 'salesContract',
                path: 'salesContract',
                meta: {
                    title: '销售合同'
                },
                component: () => import('@/views/PM/salesContract/index')
            }
        ]
    },
    {
        path: '/purchaseManagement',
        name: 'purchaseManagement',
        component: Layout,
        redirect: '/purchaseManagement',
        meta: {
            title: '采购管理',
            icon: 'icon_workset'
        },
        children: [
            {
                name: 'contract',
                path: 'contract',
                meta: {
                    title: '采购合同'
                },
                component: () => import('@/views/purchaseManagement/contract/index')
            },
            {
                name: 'supplier',
                path: 'supplier',
                meta: {
                    title: '供应商'
                },
                component: () => import('@/views/purchaseManagement/supplier/index')
            },
            {
                name: 'product',
                path: 'product',
                meta: {
                    title: '产品'
                },
                component: () => import('@/views/purchaseManagement/product/index')
            }
        ]
    },
    {
        path: '/inventoryManagement',
        name: 'inventoryManagement',
        component: Layout,
        redirect: '/inventoryManagement',
        meta: {
            title: '库存管理',
            icon: 'icon_workset'
        },
        children: [
            {
                name: 'intelligentDevice',
                path: 'intelligentDevice',
                meta: {
                    title: '智能设备'
                },
                component: () => import('@/views/inventoryManagement/intelligentDevice/index')
            },
            {
                name: 'otherProducts',
                path: 'otherProducts',
                meta: {
                    title: '其他产品'
                },
                component: () => import('@/views/inventoryManagement/otherProducts/index')
            },
            {
                name: 'SIM',
                path: 'SIM',
                meta: {
                    title: 'SIM卡'
                },
                component: () => import('@/views/inventoryManagement/SIM/index')
            }
        ]
    },
    {
        path: '/operationsManagement',
        name: 'operationsManagement',
        component: Layout,
        redirect: '/operationsManagement',
        meta: {
            title: '运营管理',
            icon: 'icon_workset'
        },
        children: [
            {
                name: 'PEMM',
                path: 'PEMM',
                meta: {
                    title: '人员设备维修'
                },
                component: EmptyRouterView,
                children: [
                    {
                        name: 'troubleTicket',
                        path: 'troubleTicket',
                        meta: {
                            title: '故障单管理'
                        },
                        component: () => import('@/views/operationsManagement/PEMM/troubleTicket/index')
                    },
                    {
                        name: 'sendRevised',
                        path: 'sendRevised',
                        meta: {
                            title: '寄修单管理'
                        },
                        component: () => import('@/views/operationsManagement/PEMM/sendRevised/index')
                    }
                ]
            },
            {
                name: 'VEMM',
                path: 'VEMM',
                meta: {
                    title: '车辆设备维修'
                },
                component: EmptyRouterView,
                children: [
                    {
                        name: 'register',
                        path: 'register',
                        meta: {
                            title: '车辆设备维修'
                        },
                        component: () => import('@/views/operationsManagement/VEMM/register/index')
                    }
                ]
            },
            {
                name: 'maintenanceBill',
                path: 'maintenanceBill',
                meta: {
                    title: '维修费账单'
                },
                component: () => import('@/views/operationsManagement/maintenanceBill/index')
            },
            {
                name: 'materialTesting',
                path: 'materialTesting',
                meta: {
                    title: '来料批次检测'
                },
                component: () => import('@/views/operationsManagement/materialTesting/index')
            },
            {
                name: 'expressWaybill',
                path: 'expressWaybill',
                meta: {
                    title: '快递单管理'
                },
                component: () => import('@/views/operationsManagement/expressWaybill/index')
            },
            {
                name: 'deviceInstall',
                path: 'deviceInstall',
                meta: {
                    title: '设备安装管理'
                },
                component: () => import('@/views/operationsManagement/deviceInstall/index')
            },
            {
                name: 'installChargeBill',
                path: 'installChargeBill',
                meta: {
                    title: '安装费账单'
                },
                component: () => import('@/views/operationsManagement/installChargeBill/index')
            }
        ]
    },
    {
        path: '/businessAccounting',
        name: 'businessAccounting',
        component: Layout,
        redirect: '/businessAccounting',
        meta: {
            title: '经营核算',
            icon: 'icon_workset'
        },
        children: [
            {
                path: 'AR',
                name: 'AR',
                meta: {
                    title: '应收管理'
                },
                component: EmptyRouterView,
                redirect: '/businessAccounting/AR/receivables/index',
                children: [
                    {
                        name: 'receivables',
                        path: 'receivables',
                        meta: {
                            title: '应收账款'
                        },
                        component: () => import('@/views/businessAccounting/AR/receivables/index')
                    },
                    {
                        name: 'collectionRecord',
                        path: 'collectionRecord',
                        meta: {
                            title: '收款记录'
                        },
                        component: () => import('@/views/businessAccounting/AR/collectionRecord/index')
                    }
                ]
            },
            {
                path: 'AP',
                name: 'AP',
                meta: {
                    title: '应付管理'
                },
                component: EmptyRouterView,
                redirect: '/businessAccounting/AP/accountsPayable/index',
                children: [
                    {
                        name: 'accountsPayable',
                        path: 'accountsPayable',
                        meta: {
                            title: '应付账款'
                        },
                        component: () => import('@/views/businessAccounting/AP/accountsPayable/index')
                    },
                    {
                        name: 'paymentRecord',
                        path: 'paymentRecord',
                        meta: {
                            title: '付款记录'
                        },
                        component: () => import('@/views/businessAccounting/AP/paymentRecord/index')
                    }
                ]
            },
            {
                name: 'depositManagement',
                path: 'depositManagement',
                meta: {
                    title: '押金管理'
                },
                component: () => import('@/views/businessAccounting/depositManagement/index')
            },
            {
                name: 'incomeAccounting',
                path: 'incomeAccounting',
                meta: {
                    title: '收入核算'
                },
                component: () => import('@/views/businessAccounting/incomeAccounting/index')
            },
            {
                name: 'costAccounting',
                path: 'costAccounting',
                meta: {
                    title: '成本核算'
                },
                component: () => import('@/views/businessAccounting/costAccounting/index')
            }
        ]
    },
    {
        path: '/statistical',
        component: Layout,
        meta: {
            title: '统计查询',
            icon: 'icon_workset'
        },
        children: [
            {
                name: 'storagePut',
                path: 'storagePut',
                meta: {
                    title: '入库记录查询'
                },
                component: () => import('@/views/statistical/storagePut/index')
            },
            {
                name: 'storageOut',
                path: 'storageOut',
                meta: {
                    title: '出库记录查询'
                },
                component: () => import('@/views/statistical/storageOut/index')
            },
            {
                name: 'invoice',
                path: 'invoice',
                meta: {
                    title: '票据查询'
                },
                component: () => import('@/views/statistical/invoice/index')
            }
        ]
    },
    {
        path: '/systemSetup',
        component: Layout,
        meta: {
            title: '系统设置',
            icon: 'map'
        },
        children: [
            {
                name: 'structure',
                path: 'structure',
                meta: {
                    title: '组织架构'
                },
                component: EmptyRouterView,
                children: [
                    {
                        name: 'createDept',
                        path: 'createDept',
                        meta: {
                            title: '创建部门'
                        },
                        component: () => import('@/views/systemSetup/structure/createDept/index')
                    }
                ]
            },
            {
                name: 'userManagement',
                path: 'userManagement',
                meta: {
                    title: '用户管理'
                },
                component: EmptyRouterView,
                children: [
                    {
                        name: 'userDetail',
                        path: 'userDetail',
                        meta: {
                            title: '用户详情'
                        },
                        component: () => import('@/views/systemSetup/userManagement/userDetail/index')
                    }
                ]
            },
            {
                name: 'roleManagement',
                path: 'roleManagement',
                meta: {
                    title: '角色管理'
                },
                component: EmptyRouterView,
                children: [
                    {
                        name: 'createRole',
                        path: 'createRole',
                        meta: {
                            title: '新增角色'
                        },
                        component: () => import('@/views/systemSetup/roleManagement/createRole/index')
                    },
                    {
                        name: 'accessConfig',
                        path: 'accessConfig',
                        meta: {
                            title: '角色权限配置'
                        },
                        component: () => import('@/views/systemSetup/roleManagement/accessConfig/index')
                    },
                    {
                        name: 'authorize',
                        path: 'authorize',
                        meta: {
                            title: '角色授权'
                        },
                        component: () => import('@/views/systemSetup/roleManagement/authorize/index')
                    }
                ]
            },
            {
                name: 'costCentre',
                path: 'costCentre',
                meta: {
                    title: '成本中心'
                },
                component: () => import('@/views/systemSetup/costCentre/index')
            },
            {
                name: 'dataDict',
                path: 'dataDict',
                meta: {
                    title: '数据字典'
                },
                component: EmptyRouterView,
                children: [
                    {
                        name: 'addClassify',
                        path: 'addClassify',
                        meta: {
                            title: '新增分类'
                        },
                        component: () => import('@/views/systemSetup/dataDict/addClassify/index')
                    }
                ]
            },
            {
                name: 'approval',
                path: 'approval',
                meta: {
                    title: '审批流程'
                },
                component: EmptyRouterView,
                children: [
                    {
                        name: 'process',
                        path: 'process',
                        meta: {
                            title: '审批流程'
                        },
                        component: EmptyRouterView,
                        children: [
                            {
                                name: 'config',
                                path: 'config',
                                meta: {
                                    title: '配置审批流程'
                                },
                                component: () => import('@/views/systemSetup/approval/process/config/index')
                            }
                        ]
                    },
                    {
                        name: 'document',
                        path: 'document',
                        meta: {
                            title: '流程创建及配置步骤'
                        },
                        component: () => import('@/views/systemSetup/approval/document/index')
                    },
                    {
                        name: 'stepConfig',
                        path: 'stepConfig',
                        meta: {
                            title: '审批环节配置'
                        },
                        component: () => import('@/views/systemSetup/approval/stepConfig/index')
                    },
                    {
                        name: 'carbonCopy',
                        path: 'carbonCopy',
                        meta: {
                            title: '抄送事件配置'
                        },
                        component: () => import('@/views/systemSetup/approval/carbonCopy/index')
                    },
                    {
                        name: 'shuntCondition',
                        path: 'shuntCondition',
                        meta: {
                            title: '分流条件配置'
                        },
                        component: () => import('@/views/systemSetup/approval/shuntCondition/index')
                    }
                ]
            }
        ]
    },
    {
        path: '*',
        redirect: '/404',
        hidden: true
    }
]
// 是否请求服务器数据
export const isRequest = true //! isDev
// 当前使用的路由
export const currentRoutes = isRequest ? [] : devRoutes

export default new Router({
    // mode: 'history', //后端支持可开
    scrollBehavior: () => ({
        y: 0
    }),
    routes: publicRouter
})
