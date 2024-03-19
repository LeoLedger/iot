﻿import request from '@/utils/request'
import { debounce } from '@/utils'
// 计算时间间隔
const getTimeDiffStr = (secondDiff) => {
    const hour = parseInt(secondDiff / 3600)
    const minute = parseInt(secondDiff / 60 % 60)
    const seconds = parseInt(secondDiff % 60)
    if (hour) {
        return `${hour}时${minute}分${seconds}秒`
    }
    if (minute) {
        return `${minute}分${seconds}秒`
    }
    if (minute) {
        return `${minute}分${seconds}秒`
    }
    return `${seconds}秒`
}
// mapData only test 后期 将会删除
// import { data as mapData } from './testGpsData'
// import { data as mapData } from './testGpsDataOld'
const getRotation = (map, curPos, targetPos) => {
    let deg = 0
    curPos = map.pointToPixel(curPos)
    targetPos = map.pointToPixel(targetPos)
    if (targetPos.x !== curPos.x) {
        const tan = (targetPos.y - curPos.y) / (targetPos.x - curPos.x)
        const atan = Math.atan(tan)
        deg = (atan * 360) / (2 * Math.PI)
        if (targetPos.x < curPos.x) {
            deg = -deg + 90 + 90
        } else {
            deg = -deg
        }

        return -deg
    } else {
        const disy = targetPos.y - curPos.y
        let bias = 0
        if (disy > 0) bias = -1
        else bias = 1
        return -bias * 90
    }

    /* const a = (90 - curPos.lat) * Math.PI / 180;
    const b = (90 - targetPos.lat) * Math.PI / 180;
    const AOC_BOC = (curPos.lng - targetPos.lng) * Math.PI / 180;
    const cosc = Math.cos(a) * Math.cos(b) + Math.sin(a) * Math.sin(b) * Math.cos(AOC_BOC);
    const sinc = Math.sqrt(1 - cosc * cosc);
    const sinA = Math.sin(a) * Math.sin(AOC_BOC) / sinc;
    const A = Math.asin(sinA) * 180 / Math.PI;
    let res = 0;
    if (curPos.lng > targetPos.lng && curPos.lat > targetPos.lat) res = A;
    else if (curPos.lng > targetPos.lng && curPos.lat < targetPos.lat) res = 180 - A;
    else if (curPos.lng < targetPos.lng && curPos.lat < targetPos.lat) res = 180 - A;
    else if (curPos.lng < targetPos.lng && curPos.lat > targetPos.lat) res = 360 + A;
    else if (curPos.lng > targetPos.lng && curPos.lat === targetPos.lat) res = 90;
    else if (curPos.lng < targetPos.lng && curPos.lat === targetPos.lat) res = 270;
    else if (curPos.lng === targetPos.lng && curPos.lat > targetPos.lat) res = 0;
    else if (curPos.lng === targetPos.lng && curPos.lat < targetPos.lat) res = 180;*/
    // return res + 90;
}

/**
 * GPS轨迹回放类
 * @param requestUrl        请求数据的后台URL
 * @param playingHandler    正在播放时的处理函数，由调用者回调；用于处理开始播放后的一些逻辑；
 * @param playPauseHandler  暂停播放时的处理函数，由调用者回调；用于处理暂停播放后的一些逻辑；
 * @param playStopHandler   停止播放时的处理函数，由调用者回调；用于处理结束播放后的一些逻辑；
 *
 */
class GpsTracePlayer {
    constructor(map, options) {
        this.$mapVm = map
        this._requestUrl = options.requestUrl
        this._playingHandler = options.playingHandler
        this._playPauseHandler = options.playPauseHandler
        this._playStopHandler = options.playStopHandler
        this._waittingHandler = options.waitingHandler
        this._errorHandler = options.errorHandler
        this._noPointHandler = options.noPointHandler
        this._requestDataSuccessHandler = options.requestDataSuccessHandler
        this._afterMovePositionHandler = options.afterMovePositionHandler

        this._type = 1
        this._speed = 1000

        this._Bpoints = []
        this._allResPoints = []
        this._originPoint = null
        this._playMarker = null
        this._playMarkerLabel = null
        this._state = 'none' // none playing pause stop;
        this._gpsPlayLines = []
        this.$showOffLine = true // 是否展示中断线条连接线

        this._markPoints = []
    }

    /**
     * 加入参数开始播放
     */
    // start(code, startTime, endTime, speed, type, name, uuid) {
    start(params = {}) {
        const { startTime, endTime, name, type, code, uuid, speed, showOffLine } = params
        if (showOffLine !== undefined) {
            this.$showOffLine = showOffLine
        }
        if (startTime === '' || endTime === '') {
            this.onError('开始和结束时间不能为空')
            return // 开始和结束日期都不能为空
        }

        this._name = name
        this._type = type
        if (speed) {
            this._speed = speed
        }
        this.clear()
        const queryParams = {
            code,
            from: startTime,
            to: endTime,
            type,
            uuid
        }
        this.requestData(queryParams)
    }

    clear() {
        // 清空marker活动点
        if (this._playMarker != null) {
            this.$mapVm.removeOverlay(this._playMarker)
            this.$mapVm.removeOverlay(this._playMarkerLabel)
        }
        // 清除起始、结束点
        this._markPoints.map(v => {
            this.$mapVm.removeOverlay(v)
        })
        this._markPoints = []

        // 清空线条集合
        if (this._gpsPlayLines.length > 0) {
            this._gpsPlayLines.forEach((val, index) => {
                this.$mapVm.removeOverlay(val)
            })
            this._gpsPlayLines = []
            this._Bpoints = []
        }

        // 清空海量点
        if (this._pointCollection) {
            this._pointCollection.clear()
            this._pointCollection = null
        }
        // 全局获取覆盖物
        /* const ovs = this.$mapVm.getOverlays()
        ovs.map(v => {
            if (v._isMarker) {
                this.$mapVm.removeOverlay(v)
            }
        })*/
    }

    /**
     * 请求数据接口
     */
    requestData(params = {}) {
        this.onWaitting()
        // 防止接口没有返回 再次请求的问题
        if (this.loading) {
            return
        }
        this.loading = true
        request({
            url: this._requestUrl,
            method: 'get',
            params
        }).then(result => {
            result = result.data
            // result = mapData // onlyTest
            // console.error(result, 'result')
            // 如果是新类型的 直接返回 [[point...]]   否则 外部套一层
            const gpsPoints = Array.isArray(result.gpsPoints[0]) ? result.gpsPoints : [result.gpsPoints]
            // console.error(gpsPoints, 'gpsPoints')
            if (gpsPoints && gpsPoints[0].length) {
                const Bpoints = []
                gpsPoints.map(points => {
                    if (points && points.length) {
                        points.forEach((v, idx) => {
                            const point = new BMap.Point(v.lng, v.lat)
                            // 标记起始点
                            if (idx === 0) {
                                point._flag_start = true
                            }
                            // 标记起结束点
                            if (idx === points.length - 1) {
                                point._flag_end = true
                            }
                            // curLines.push(point)
                            point.detail = v // 点实例添加点数据详情
                            Bpoints.push(point)
                        })
                    }
                })

                // 多线条数组转化后的 拆解后的所有点
                const allResPoints = this._allResPoints = [].concat(...gpsPoints)
                this.$mapVm.setViewport(allResPoints)

                // 绘制起点overlay;
                this._Bpoints = Bpoints
                this._index = 0
                const _originPoint = this._originPoint = Bpoints[this._index]
                // 如果第1个数据即是 起点标记又是重点标记 添加 虚线标记
                if (_originPoint._flag_start && _originPoint._flag_end) {
                    _originPoint._isDashedLine = true
                }
                // 初始化线条首节点
                _originPoint._flag_init = true
                // 默认 人员类型
                const walkSize = new BMap.Size(42, 42)
                const walkIcons = this.walkIcons = {
                    'left': new BMap.Icon('http://shunone.com/static/img/map/left.gif', walkSize),
                    'right': new BMap.Icon('http://shunone.com/static/img/map/right.gif', walkSize),
                    'front': new BMap.Icon('http://shunone.com/static/img/map/front.gif', walkSize),
                    'back': new BMap.Icon('http://shunone.com/static/img/map/back.gif', walkSize)
                    // 'left': new BMap.Icon(require('@/assets/map/walk/left.gif'), walkSize),
                    // 'right': new BMap.Icon(require('@/assets/map/walk/right.gif'), walkSize),
                    // 'front': new BMap.Icon(require('@/assets/map/walk/front.gif'), walkSize),
                    // 'back': new BMap.Icon(require('@/assets/map/walk/back.gif'), walkSize)
                }
                // let markerIcon = new BMap.Icon('http://shunone.com/static/img/map/walk_right.gif', new BMap.Size(42, 42)),
                let markerIcon = walkIcons.right,
                    iconOffset = new BMap.Size(0, -21) // 人员
                // 车辆类型
                if (this._type === 1) {
                    markerIcon = new BMap.Icon('http://shunone.com/static/img/map/car_play.png', new BMap.Size(52, 26))
                    // iconOffset = new BMap.Size(0, -8)
                    iconOffset = new BMap.Size(0, 0)
                }

                const marker = new BMap.Marker(_originPoint, {
                    icon: markerIcon,
                    offset: iconOffset
                })
                marker.setZIndex(10)
                this._playMarker = marker
                const label = new BMap.Label(this.createMarkerLable(allResPoints[0], this._type), { offset: new BMap.Size(43, -50) })
                label.setStyle({
                    cursor: 'pointer',
                    borderColor: 'transparent',
                    backgroundColor: 'transparent',
                    width: '170px'
                })
                this._playMarkerLabel = label

                this._playMarker.setLabel(this._playMarkerLabel)
                this.$mapVm.addOverlay(this._playMarker)
                // 添加起始点
                const startPoint = new BMap.Marker(_originPoint, {
                    offset: new BMap.Size(0, -20),
                    icon: new BMap.Icon('http://shunone.com/static/img/map/start_point.png', new BMap.Size(26, 38))
                })
                startPoint._isMarker = true
                this._markPoints.push(startPoint)
                startPoint.addEventListener('click', () => {
                    this.openDetailInfo(_originPoint)
                })
                this.$mapVm.addOverlay(startPoint)

                this.playTrace()

                this.onPlaying()
                this.requestDataSuccess(result.gpsPoints, result.trajectory)
            } else {
                if (this._noPointHandler) {
                    this._noPointHandler()
                }
            }
        }).catch(res => {
            console.error('err', res)
            this.onError('error', res)
        }).finally(_ => {
            this.loading = false
        })
    }

    // 创建箭头线条
    /* getLine_ARROW() {
        const sy = new BMap.Symbol(BMap_Symbol_SHAPE_BACKWARD_OPEN_ARROW, {
            scale: 0.4, // 图标缩放大小
            strokeColor: '#fff', // 设置矢量图标的线填充颜色
            strokeWeight: '1' // 设置线宽
        })
        return new BMap.IconSequence(sy, '0', '10')
    }*/

    createMarkerLable(gpsPoint, type) {
        let txt = ''
        if (gpsPoint) {
            // 车辆类型
            if (type === 1) {
                txt = `车牌：${this._name}<br>
                        时间：${gpsPoint.gpsTimeStr}<br>
                        速度：${gpsPoint.speed}公里/小时
                        `
            } else {
                // 人员类型
                txt = `姓名：${this._name}<br>
                    时间：${gpsPoint.gpsTimeStr}<br>
                    速度：${gpsPoint.speed}公里/小时`
            }
        }
        return `<div class="global_gps_label">${txt}</div>`
    }

    playTrace() {
        const _this = this
        let index = _this._index
        const Bpoints = _this._Bpoints
        const allGpsPoints = _this._allResPoints

        let originPoint = _this._originPoint
        const playMarker = _this._playMarker
        const label = _this._playMarkerLabel
        const gpsPlayLines = _this._gpsPlayLines
        let gpsLine = null

        // 创建新的线条实例
        const createPolyline = (nextPoint, isDashed) => {
            // 根据上次的点标记当前线是否为虚线
            // const isDashed = !originPoint._isDashedLine // || gpsLine && gpsLine._isDashedLine
            const cur_opacity = isDashed ? 0.5 : 0.8
            const gpsLine_new = new BMap.Polyline([originPoint, nextPoint], {
                // strokeColor: color,
                strokeStyle: isDashed ? 'dashed' : 'solid',
                strokeColor: isDashed ? '#f00' : '#2005ff',
                strokeOpacity: cur_opacity,
                strokeWeight: isDashed ? 2 : 4
            })
            // 初始化第一条线条 标记
            if (originPoint._flag_init) {
                // gpsLine_new._isDashedLine = !!originPoint._flag_end
            }
            if (isDashed) {
                // 配置线条起始点、终止点数据
                gpsLine_new._pathDetail = {
                    start: originPoint,
                    end: nextPoint
                }
                gpsLine_new.addEventListener('mouseover', debounce((e) => {
                    const pathDetail = e.target._pathDetail
                    if (pathDetail) {
                        const startPoint = (pathDetail.start.detail || {})
                        const endPoint = (pathDetail.end.detail || {})
                        if (startPoint.gpsTimeStr && endPoint.gpsTimeStr) {
                            const secondDiff = (new Date(endPoint.gpsTimeStr) - new Date(startPoint.gpsTimeStr)) / 1000
                            const diffStr = getTimeDiffStr(secondDiff)
                            this.openBreakOffWindowInfo({
                                diffStr,
                                startPoint,
                                endPoint
                            })
                        } else {
                            console.error('查不到时间差数据')
                        }
                    }
                }, 100, true))
            }
            // gpsLine_new._isMarker = true
            gpsLine_new._isDashedLine = isDashed
            gpsPlayLines.push(gpsLine_new)
            this.$mapVm.addOverlay(gpsLine_new)
            if (gpsLine_new._isDashedLine && this.$showOffLine === false) {
                gpsLine_new.hide()
            }
            return gpsLine_new
        }
        const play_trace = (pointArray) => {
            if (index < pointArray.length && _this._state === 'playing') {
                index = ++_this._index
                const nextPoint = pointArray[index]
                const curPointData = allGpsPoints[index - 1]
                // nextPoint._isDashedLine = curPointData._flag_start && nextPoint._flag_end || false
                // nextPoint._isDashedLine = nextPoint._flag_start && nextPoint._flag_end || false

                // 如果有gps线条集合 取出最后一条数据 // 这种写法 存在比较大bugger
                if (gpsPlayLines.length > 0) {
                    gpsLine = gpsPlayLines[gpsPlayLines.length - 1]
                }
                if (originPoint._flag_start && !nextPoint._flag_start) {
                    // 创建实线
                    createPolyline(nextPoint, false)
                } else if (originPoint._flag_end && nextPoint._flag_start) {
                    // if (nextPoint._flag_start) {
                    createPolyline(nextPoint, true)
                } else {
                    const points = gpsLine.getPath()
                    points.push(nextPoint)
                    gpsLine.setPath(points)
                    // gpsLine.setPositionAt(index, point) // 仅支持对已有的点进行修改
                }
                // 给车类型marker添加角度旋转
                const nextRotation = getRotation(this.$mapVm, originPoint, nextPoint)
                if (_this._type === 1) {
                    // 设置轨迹播放的图片角度
                    playMarker.setRotation(nextRotation)
                } else {
                    // 给人员类型marker 替换不同方向图片
                    if (nextRotation >= 225 && nextRotation <= -45) {
                        playMarker.setIcon(this.walkIcons.back)
                    } else if (nextRotation > -45 && nextRotation <= 45) {
                        playMarker.setIcon(this.walkIcons.right)
                    } else if (nextRotation > 45 && nextRotation <= 135) {
                        playMarker.setIcon(this.walkIcons.front)
                    } else {
                        playMarker.setIcon(this.walkIcons.left)
                    }
                }
                playMarker.setPosition(nextPoint)

                // 获取当前point 数据做相关内容修改处理
                label.setContent(_this.createMarkerLable(curPointData, _this._type))
                label.setPosition(nextPoint)

                originPoint = _this._originPoint = nextPoint
                _this.afterMovePosition(index, pointArray.length)

                // 终点icon
                if (index === pointArray.length - 1) {
                    // 已播放完毕  标记结束；
                    _this.stop()
                    const endPoint = new BMap.Marker(nextPoint, {
                        offset: new BMap.Size(0, -20),
                        icon: new BMap.Icon(
                            'http://shunone.com/static/img/map/end_point.png',
                            new BMap.Size(26, 38)
                        )
                    })
                    endPoint._isMarker = true
                    this._markPoints.push(endPoint)
                    this.$mapVm.addOverlay(endPoint)
                    // 最后添加海量点及点击事件
                    this.setPointCollection()
                } else {
                    clearTimeout(_this._Timer)
                    _this._Timer = setTimeout(() => {
                        play_trace(Bpoints)
                    }, _this._speed)
                }
            }
        }
        _this._Timer = setTimeout(() => {
            play_trace(Bpoints)
        }, _this._speed)
    }
    setPointCollection() {
        // 添加海量点
        const options = {
            size: BMAP_POINT_SIZE_SMALLER, // BMAP_POINT_SIZE_SMALL,
            shape: BMAP_POINT_SHAPE_CIRCLE, // BMAP_POINT_SHAPE_STAR,
            // color: '#409eff'
            color: '#2005ff'
        }
        // 画海量点(除去初始点、结束点)
        const pointArray = this._Bpoints.slice(1, this._Bpoints.length - 2)
        const pointCollection = new BMap.PointCollection(pointArray, options)
        pointCollection.addEventListener('click', (e) => {
            const point = e.point
            this.openDetailInfo(point)
        })
        this._pointCollection = pointCollection
        this.$mapVm.addOverlay(pointCollection)
    }

    openBreakOffWindowInfo(config) {
        const { diffStr, startPoint, endPoint } = config
        const opts = {
            // width: 140,
            // height: 80,
            title: '<div class="global_gps_winInfo-title">中断线详情：</div>', // 标题
            enableMessage: false
        }
        const txt = `<span style="color: #f06;">中断时间间隔：${diffStr}</span><br>
                   中断点时间：${startPoint.gpsTimeStr}<br>
                   重新登录时间：${endPoint.gpsTimeStr}
                  `
        const content = `<div class="global_gps_label">${txt}</div>`
        const point = {
            lng: (endPoint.lng + startPoint.lng) / 2,
            lat: (endPoint.lat + startPoint.lat) / 2
        }
        const _point = new BMap.Point(point.lng, point.lat)
        const infoWindow = new BMap.InfoWindow(content, opts)
        this.$mapVm.openInfoWindow(infoWindow, _point)
    }
    openDetailInfo(point) {
        const opts = {
            // width: 140,
            // height: 80,
            title: '<div class="global_gps_winInfo-title">当前点详情：</div>', // 标题
            enableMessage: false
        }
        const detail = point.detail
        const txt = `时间：${detail.gpsTimeStr}<br>
                    速度：${detail.speed}公里/小时
                    `
        const content = `<div class="global_gps_label">${txt}</div>`
        const _point = new BMap.Point(point.lng, point.lat)
        const infoWindow = new BMap.InfoWindow(content, opts)
        this.$mapVm.openInfoWindow(infoWindow, _point)
    }

    // 设置速度
    setSpeed(speed) {
        if (speed > 0) {
            this._speed = speed
        }
    }

    // 设置是否展示中断连线
    changeShowOffLine(bool) {
        // 针对虚线 展示隐藏
        this._gpsPlayLines.map(line => {
            if (line._isDashedLine) {
                if (bool) {
                    line.show()
                } else {
                    line.hide()
                }
            }
        })
        this.$showOffLine = bool
    }

    /**
     *继续上一次播放；
     */
    playContinue() {
        if (this._state === 'pause') {
            this.onPlaying()
            this.playTrace(this)
        }
    }

    /**
     *暂停播放；
     */
    pause() {
        this.onPlayPause()
    }

    /**
     *结束播放；
     */
    stop() {
        this.onPlayStop()
        // 清空定时器
        clearTimeout(this._Timer)
        this._index = 0
        this._speed = undefined
    }

    onPlaying() {
        this._state = 'playing'
        if (this._playingHandler) {
            this._playingHandler()
        }
    }

    onPlayPause() {
        this._state = 'pause'
        if (this._playPauseHandler) {
            this._playPauseHandler()
        }
    }

    onPlayStop() {
        this._state = 'stop'
        if (this._playStopHandler) {
            this._playStopHandler()
        }
    }

    onWaitting() {
        if (this._waittingHandler) {
            this._waittingHandler()
        }
    }

    onError(error) {
        if (this._errorHandler) {
            this._errorHandler(error)
        }
    }

    requestDataSuccess(data, tracePlayer) {
        if (this._requestDataSuccessHandler) {
            this._requestDataSuccessHandler(data, tracePlayer)
        }
    }

    afterMovePosition(index, total) {
        if (this._afterMovePositionHandler) {
            this._afterMovePositionHandler(index, total)
        }
    }
}

export default GpsTracePlayer
