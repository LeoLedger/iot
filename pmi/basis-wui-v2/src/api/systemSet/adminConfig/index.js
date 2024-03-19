import request from '@/utils/request'

export function getConfigList(params) {
    return request({
        url:'/adminConfig/getConfigList',
        method:'get',
        params
    });
}

export function exportConfigs(data){
    return request({
        url:'/adminConfig/exportConfigs',
        method:'post',
        data
    });
}

export function importConfigs(data){
   return request({
       url:'/adminConfig/importConfigs',
       method:'post',
       data
   });
}


