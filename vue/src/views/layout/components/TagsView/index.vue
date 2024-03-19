<template>
    <div class="tags-view-container">
        <router-link
            :to="{ path: '/' }"
            tag="span"
            class="home"
        >
            <i class="el-icon-s-home"/>
        </router-link>
        <scroll-pane ref="scrollPane" class="tags-view-wrapper">
            <router-link
                v-for="tag in visitedViews"
                ref="tag"
                :class="isActive(tag)?'active':''"
                :to="{
                    path: tag.path,
                    query: tag.query,
                }"
                :key="tag.path"
                tag="span"
                class="tags-view-item"
                @click.middle.native="closeSelectedTag(tag)"
                @contextmenu.prevent.native="openMenu(tag,$event)">
                <div class="text">{{ generateTitle(tag.title) }}</div>
                <div
                    v-if="!tag.meta.affix"
                    class="close el-icon-close"
                    @click.prevent.stop="closeSelectedTag(tag)"
                />
            </router-link>
        </scroll-pane>
        <ul v-show="visible" :style="{left:left+'px',top:top+'px'}" class="contextmenu">
            <li @click="refreshSelectedTag(selectedTag)">{{ $t('tagsView.refresh') }}</li>
            <li v-if="!(selectedTag.meta&&selectedTag.meta.affix)" @click="closeSelectedTag(selectedTag)">{{
            $t('tagsView.close') }}</li>
            <li @click="closeOthersTags">{{ $t('tagsView.closeOthers') }}</li>
            <li @click="closeAllTags(selectedTag)">{{ $t('tagsView.closeAll') }}</li>
        </ul>
    </div>
</template>

<script>
    import ScrollPane from './ScrollPane'
    import { generateTitle } from '@/utils/i18n'
    import path from 'path'

    export default {
        components: { ScrollPane },
        data() {
            return {
                visible: false,
                top: 0,
                left: 0,
                selectedTag: {},
                affixTags: []
            }
        },
        computed: {
            visitedViews() {
                return this.$store.state.tagsView.visitedViews
            },
            routers() {
                return this.$store.state.permission.routers
            }
        },
        watch: {
            $route() {
                this.addTags()
                this.moveToCurrentTag()
            },
            visible(value) {
                if (value) {
                    document.body.addEventListener('click', this.closeMenu)
                } else {
                    document.body.removeEventListener('click', this.closeMenu)
                }
            }
        },
        mounted() {
            this.initTags()
            this.addTags()
        },
        methods: {
            generateTitle, // generateTitle by vue-i18n
            isActive(route) {
                return route.path === this.$route.path
            },
            filterAffixTags(routes, basePath = '/') {
                let tags = []
                routes.forEach(route => {
                    if (route.meta && route.meta.affix) {
                        const tagPath = path.resolve(basePath, route.path)
                        tags.push({
                            fullPath: tagPath,
                            path: tagPath,
                            name: route.name,
                            meta: { ...route.meta }
                        })
                    }
                    if (route.children) {
                        const tempTags = this.filterAffixTags(route.children, route.path)
                        if (tempTags.length >= 1) {
                            tags = [...tags, ...tempTags]
                        }
                    }
                })
                return tags
            },
            initTags() {
                const affixTags = this.affixTags = this.filterAffixTags(this.routers)
                for (const tag of affixTags) {
                    // Must have tag name
                    if (tag.name) {
                        this.$store.dispatch('addVisitedView', tag)
                    }
                }
            },
            addTags() {
                const { name } = this.$route
                if (name) {
                    this.$store.dispatch('addView', this.$route)
                }
                return false
            },
            moveToCurrentTag() {
                const tags = this.$refs.tag
                this.$nextTick(() => {
                    for (const tag of tags) {
                        if (tag.to.path === this.$route.path) {
                            this.$refs.scrollPane.moveToTarget(tag)
                            // when query is different then update
                            if (tag.to.fullPath !== this.$route.fullPath) {
                                this.$store.dispatch('updateVisitedView', this.$route)
                            }
                            break
                        }
                    }
                })
            },
            refreshSelectedTag(view) {
                this.$store.dispatch('delCachedView', view).then(() => {
                    const { fullPath, query } = view
                    let path = fullPath
                    if (Object.keys(query).length) {
                        path = query.time ? path.replace(/time=\d+/g, `time=${+new Date()}`) : (path + `&time=${+new Date()}`)
                    } else {
                        path += `?time=${+new Date()}`
                    }
                    this.$nextTick(() => {
                        this.$router.replace({
                            path: path
                            // path: '/redirect' + fullPath
                        })
                    })
                })
            },
            closeSelectedTag(view) {
                this.$store.dispatch('delView', view).then(({ visitedViews }) => {
                    if (this.isActive(view)) {
                        this.toLastView(visitedViews)
                    }
                })
                this.$globalEvent.$emit('tagClose')
            },
            closeOthersTags() {
                this.$router.push(this.selectedTag)
                this.$store.dispatch('delOthersViews', this.selectedTag).then(() => {
                    this.moveToCurrentTag()
                })
            },
            closeAllTags(view) {
                this.$store.dispatch('delAllViews').then(({ visitedViews }) => {
                    if (this.affixTags.some(tag => tag.path === view.path)) {
                        return
                    }
                    this.toLastView(visitedViews)
                })
            },
            toLastView(visitedViews) {
                const latestView = visitedViews.slice(-1)[0]
                if (latestView) {
                    this.$router.push(latestView)
                } else {
                    // You can set another route
                    this.$router.push('/')
                }
            },
            openMenu(tag, e) {
                const menuMinWidth = 105
                const offsetLeft = this.$el.getBoundingClientRect().left // container margin left
                const offsetWidth = this.$el.offsetWidth // container width
                const maxLeft = offsetWidth - menuMinWidth // left boundary
                const left = e.clientX - offsetLeft + 15 // 15: margin right

                if (left > maxLeft) {
                    this.left = maxLeft
                } else {
                    this.left = left
                }

                this.top = e.clientY
                this.visible = true
                this.selectedTag = tag
            },
            closeMenu() {
                this.visible = false
            }
        }
    }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.tags-view-container {
    display: flex;
    align-items: flex-start;
    background: #fff;
    border-top: 1px solid #f1f1f1;
    .home {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 36px;
        color: #666;
        font-size: 18px;
        border-right: 1px solid #f1f1f1;
        vertical-align: top;
        cursor: pointer;
        &:hover {
            color: #42b983;
        }
    }
    .tags-view-wrapper {
        .tags-view-item {
            display: inline-flex;
            align-items: center;
            position: relative;
            cursor: pointer;
            height: 36px;
            border-right: 1px solid #f1f1f1;
            color: #495060;
            background: #fff;
            padding: 0 8px 0 12px;
            font-size: 12px;
            vertical-align: top;
            &.active {
                background-color: #42b983;
                color: #fff;
                border-color: #42b983;
                .close {
                    color: #fff;
                }
            }
            .close {
                width: 15px;
                height: 15px;
                line-height: 15px;
                font-size: 12px;
                border-radius: 50%;
                margin-left: 14px;
                color: #999;
                text-align: center;
                &:hover {
                    color: #fff;
                    background: #F56C6C;
                }
            }
        }
    }
    .contextmenu {
        margin: 0;
        background: #fff;
        z-index: 100;
        position: absolute;
        list-style-type: none;
        padding: 5px 0;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 400;
        color: #333;
        box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);
        li {
            margin: 0;
            padding: 7px 16px;
            cursor: pointer;
            &:hover {
                background: #eee;
            }
        }
    }
}
</style>
