<template>
  <transition name="fade-transform" mode="out-in">
    <keep-alive include>
      <router-view/>
    </keep-alive>
  </transition>
</template>

<script>
function IsPC() {
  var userAgentInfo = navigator.userAgent
  var Agents = ['Android', 'iPhone',
    'SymbianOS', 'Windows Phone',
    'iPad', 'iPod']
  var flag = true
  for (var v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false
      break
    }
  }
  return flag
}

(function(doc, win) {
  var docEl = doc.documentElement
  var resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize'
  var flag = IsPC()
  var recalc = function() {
    var clientWidth = docEl.clientWidth
    if (!clientWidth || flag) return
    if (clientWidth > 750) {
      docEl.style.fontSize = '100px'
    } else {
      docEl.style.fontSize = 100 * (clientWidth / 750) + 'px'
    }
  }
  if (!doc.addEventListener) return
  win.addEventListener(resizeEvt, recalc, false)
  doc.addEventListener('DOMContentLoaded', recalc, false)
})(document, window)

export default {
  name: 'MobileLayout',
  created() {
  }
}

</script>

<style lang="scss" scoped>
body{
  -webkit-font-smoothing: antialiased;
}
</style>
