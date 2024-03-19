<template>
    <bm-overlay ref="customOverlay" class="label" pane="labelPane" @draw="draw">
        <span :title="title" class="BMapLabel" @click="click">{{ content }}</span>
    </bm-overlay>
</template>

<script>
    export default {
        name: 'MapLabel',
        props: ['position', 'content', 'title'],
        watch: {
            position: {
                handler() {
                    this.$refs.customOverlay.reload()
                },
                deep: true
            }
        },
        methods: {
            draw({ el, BMap, map }) {
                const { lng, lat } = this.position
                const pixel = map.pointToOverlayPixel(new BMap.Point(lng, lat))
                el.style.left = pixel.x - 40 + 'px'
                el.style.top = pixel.y - 10 + 'px'
            },
            click() {
                this.$emit('click')
            }
        }
    }
</script>

<style lang="scss" scoped>
.label {
  position: absolute;
  display: inline;
  background-color: rgb(255, 255, 255);
  border: 1px solid rgb(255, 0, 0);
  padding: 1px;
  white-space: nowrap;
  font: 12px arial, sans-serif;
  cursor: pointer;
  span {
    display: block;
  }
}
</style>
