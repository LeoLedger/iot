
// API
import resourctApi from '@/api/resource'
import projectIp from '@/api/PM/project'

import enums from '@/utils/enum'
import dictEnum from '@/components/customizeFormItem/dictEnum'
import Vue from 'vue'

const dict = {
    state: {
        data: {}
    },
    getters: {
        getDict: (state) => (type) => {
            if (type in enums) {
                return enums[type]
            } else {
                return state.data[dictEnum[type]] || []
            }
        }
    },
    actions: {
        // 请求字典数据
        queryDictData({ state }) {
            return new Promise((resolve, reject) => {
                Promise.all([
                    resourctApi.getAllDict()
                ]).then(([res1]) => {
                    var data = {}
                    res1.data.forEach(item => {
                        data[item.nsId] = item.dictList.map(v => {
                            return {
                                value: v.dictId,
                                label: v.dictName
                            }
                        })
                    })
                    state.data = data
                    // 获取授权ip
                    projectIp.getEmpowerIp().then(res => {
                        state.data = {
                            ...state.data,
                            empowerIp: res.data.map(v => {
                                return {
                                    ...v,
                                    value: v.c_auth_ip_id,
                                    label: v.c_name
                                }
                            })
                        }
                    })
                    // 获取成本中心
                    resourctApi.getCostCenter().then(res => {
                        state.data = {
                            ...state.data,
                            costCenter: res.data.map(v => {
                                return {
                                    ...v,
                                    value: v.guidId,
                                    label: v.name
                                }
                            })
                        }
                    })
                    resolve()
                }).catch(reject)
            })
        }
    }
}

export default dict
