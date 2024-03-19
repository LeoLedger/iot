import Cookies from 'js-cookie'
const AppName = 'ty_hw_admin'
const TokenKey = AppName + process.env.VUE_APP_ENV || ''
const refreshToken = AppName + '_refresh_token' + process.env.VUE_APP_ENV || ''
const hashCode = AppName + '_company_hashCode'
const TimeKey = AppName + '_company_TimeKey'
const LoginTimeKey = AppName + '_LoginTimeKey'

export function getToken() {
    return Cookies.get(TokenKey)
}

export function setToken(token) {
    return Cookies.set(TokenKey, token)
}

export function removeToken() {
    return Cookies.remove(TokenKey)
}

export function getRefreshToken() {
    return Cookies.get(refreshToken)
}

export function setRefreshToken(token) {
    return Cookies.set(refreshToken, token)
}

export function removeRefreshToken() {
    return Cookies.remove(refreshToken)
}

export function setHashCode(code) {
    return Cookies.set(hashCode, code)
}

export function getHashCode() {
    return Cookies.get(hashCode)
}

export function getTime() {
    return Cookies.get(TimeKey)
}

export function setTime(time) {
    return Cookies.set(TimeKey, time)
}

export function getLoginTime() {
    return Cookies.get(LoginTimeKey)
}

export function setLoginTime(time) {
    return Cookies.set(LoginTimeKey, time)
}
