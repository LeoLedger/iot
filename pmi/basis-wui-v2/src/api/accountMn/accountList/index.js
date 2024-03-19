import request from "@/utils/request"
import {
    buildUrl
} from "@/utils";
import {
    getToken
} from "@/utils/auth"; //导入token
// 用户身份证校验
export function getAccoutInfoByidCard(params) {
    return request({
        url: '/api/people/GetPeopleDetailByIdCard',
        method: 'get',
        params
    })
}

export function exportUserCenterRecord(params) {
    const tmp = JSON.parse(JSON.stringify(params));
    tmp["access_token"] = getToken();
    const url = buildUrl(
        process.env.VUE_APP_BASE_API + "/api/UserAuthorization/ExportUserCenterRecord",
        tmp
    );
    window.open(url);
}

// 没有身份证查询用户信息
export function getUserInfoNoIdCard(params) {
    return request({
        url: '/api/UserAuthorization/GetUserDetailNoIdCard',
        method: 'get',
        params
    })
}
