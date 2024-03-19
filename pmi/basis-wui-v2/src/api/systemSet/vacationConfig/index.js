import request from '@/utils/request'

export function getVacationList(data) {
    return request({
        url:'/vacationConfig/getVacationList',
        method:'post',
        data
    });
}

export function generateVacations(data){
    return request({
        url:'/vacationConfig/generateVacations',
        method:'post',
        data
    });
}

export function getVacationById(params){
   return request({
       url:'/vacationConfig/getVacationById',
       method:'get',
       params
   });
}

export function saveOrEditVacation(data){
    return request({
        url:'/vacationConfig/saveOrEditVacation',
        method:'post',
        data
    });
}


