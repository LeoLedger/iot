const MapLoader = function(ak) {
  this.__ak = ak
}

MapLoader.prototype.loadScript = function() {
  if (!window.BMap) {
    const ak = this.__ak
    window.BMap = {}
    window.BMap._preloader = new Promise((resolve, reject) => {
      window._initBaiduMap = function() {
        // DrawingManager
        const $drawingScript = document.createElement('script')
        $drawingScript.src = 'http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js'
        window.document.body.appendChild($drawingScript)
        const $drawingLink = document.createElement('link')
        $drawingLink.type = 'text/css'
        $drawingLink.rel = 'stylesheet'
        $drawingLink.href = 'http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.css'
        window.document.getElementsByTagName('head')[0].appendChild($drawingLink)

        // SearchInfoWindow
        const $seachInfoScript = document.createElement('script')
        $seachInfoScript.src = 'http://api.map.baidu.com/library/SearchInfoWindow/1.4/src/SearchInfoWindow_min.js'
        window.document.body.appendChild($seachInfoScript)
        const $seachInfoLink = document.createElement('link')
        $seachInfoLink.type = 'text/css'
        $seachInfoLink.rel = 'stylesheet'
        $seachInfoLink.href = 'http://api.map.baidu.com/library/SearchInfoWindow/1.4/src/SearchInfoWindow_min.css'
        window.document.getElementsByTagName('head')[0].appendChild($seachInfoLink)

        resolve(window.BMap)
        window.BMap._preloader = null
        window._initBaiduMap = null
      }

      const $script = document.createElement('script')
      window.document.body.appendChild($script)
      $script.src = `https://api.map.baidu.com/api?v=3.0&ak=${ak}&callback=_initBaiduMap`
    })
    return window.BMap._preloader
  } else if (!window.BMap._preloader) {
    return Promise.resolve(window.BMap)
  } else {
    return window.BMap._preloader
  }
}

MapLoader.prototype.initMap = function() {
  return new Promise((resolve, reject) => {
    this.loadScript().then(BMap => {
      resolve(BMap)
    })
  })
}

export default MapLoader
