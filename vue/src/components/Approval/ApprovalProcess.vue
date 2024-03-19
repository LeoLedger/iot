<!--
* @description 审批流程
* @author yc
!-->
<template>
    <div class="approval-process">
        <div class="process-list">
            <div v-for="(item, index) in dataList" :key="index" class="item">
                <div class="head-wrap">
                    <div class="title" @click="item._expand = !item._expand">{{ item.activityName }}</div>
                    <div v-if="!['提交', '结束环节'].includes(item.activityName)" class="right">
                        <div
                            :class="{link: [100603,100602].includes(item.receiveTypeId)}"
                            class="role"
                            @click="handleShowUserList(item)"
                        >【{{ item.receiveObjectName }}】</div>
                        <div v-if="index !== lastIndex" :style="{background: item._statusColor}" class="status">{{ item._statusText }}</div>
                    </div>
                </div>
                <template v-if="item._expand && index !== lastIndex">
                    <div class="body-wrap">
                        <div class="content">{{ item.content || '- -' }}</div>
                        <div v-if="item.files && item.files.length" class="files-wrap">
                            <Upload
                                :is-edit="false"
                                :form="{ prop: 'list',accept:'.jpg, .jpeg, .png' }"
                                :params="{ list: item.files }"
                            />
                        </div>
                    </div>
                    <div class="foot-wrap">
                        <div class="name">{{ item.operatorName }}</div>
                        <div class="date">审批于：{{ item.finishedDate }}</div>
                    </div>
                </template>
            </div>
        </div>
        <NoData v-if="!dataList.length" text="暂无流程数据"/>
        <!-- 角色列表 -->
        <el-dialog
            :visible.sync="userListDialog.visible"
            :title="userListDialog.title"
            width="600px"
            append-to-body
        >
            <div v-loading="userListDialog.loading" class="role-list">
                <div
                    v-for="(item, index) in userListDialog.list"
                    :key="index"
                    class="item"
                >
                    <div class="text">{{ item }}</div>
                </div>
                <NoData v-if="!userListDialog.list.length" text="暂无数据"/>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    // API
    import workFlowApi from '@/api/workFlow'
    import resourceApi from '@/api/resource'
    // 方法
    import moment from 'moment'
    import enums from '@/utils/enum'
    // 组件
    import NoData from '@/components/NoData'
    import Upload from '@/components/customizeFormItem/Upload'

    export default {
        name: 'ApprovalProcess',
        components: {
            NoData,
            Upload
        },
        props: {
            wfInstId: { type: String, default: '' }
        },
        data() {
            return {
                dataList: [],
                userListDialog: {
                    list: [],
                    visible: false
                }
            }
        },
        computed: {
            lastIndex() {
                return this.dataList.length - 1
            }
        },
        watch: {
            wfInstId: {
                immediate: true,
                handler() {
                    this.queryDataList()
                }
            }
        },
        methods: {
            // 获取流程数据
            async queryDataList() {
                if (this.wfInstId) {
                    this.loading = true
                    var res = await workFlowApi.getFlow({
                        wfInstId: this.wfInstId
                    })
                    this.dataList = res.data.map(item => {
                        var config = enums.approvalStatus.find(v => v.value === item.handlerStatus)
                        item._statusText = config.label
                        item._statusColor = config.color
                        item._expand = true
                        item.finishedDate = moment(item.finishedDate).format('yyyy-MM-DD HH:mm:ss')
                        return item
                    })
                    this.$emit('update', this.dataList)
                    this.loading = false
                }
            },
            // 查看审批对象下用户列表
            async handleShowUserList(data) {
                if ([100603, 100602].includes(data.receiveTypeId)) {
                    this.userListDialog = {
                        list: [],
                        title: data.receiveObjectName,
                        loading: true,
                        visible: true
                    }
                    let res
                    try {
                        switch (data.receiveTypeId) {
                        case 100603:
                            // 部门
                            res = await resourceApi.getDeptUser({
                                deptId: data.receiveObjectId,
                                pageIndex: -1
                            })
                            break
                        case 100602:
                            // 角色
                            res = await resourceApi.getRoleUser({
                                roleId: data.receiveObjectId,
                                pageIndex: -1
                            })
                            break
                        }
                    } catch (err) {
                        console.error(err)
                        this.userListDialog.loading = false
                    }
                    this.userListDialog = {
                        list: res.data.records.map(v => v.userName),
                        title: data.receiveObjectName,
                        loading: false,
                        visible: true
                    }
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
.approval-process {
    font-size: 14px;
    padding-left: 30px;
    .item {
        position: relative;
        border: solid 1px #f8f9fa;
        background: #f2f2f2;
        & + .item {
            margin-top: 10px;
        }
        &::after,
        &::before {
            content: '';
            position: absolute;
            left: -20px;
        }
        &::after {
            top: 13px;
            width: 15px;
            height: 15px;
            border: solid 2px #409EFF;
            border-radius: 50%;
            background: #fff;
            transform: translateX(-50%);
        }
        &::before {
            top: -15px;
            bottom: 0;
            width: 1px;
            background: #409EFF;
        }
        &:first-child {
            &::before {
                top: 15px;
            }
        }
        &:last-child {
            &::before {
                height: 30px;
                bottom: initial;
            }
            &:first-child {
                &::before {
                    display: none;
                }
            }
        }
        .head-wrap {
            display: flex;
            align-items: center;
            height: 40px;
            .title {
                flex: 1;
                color: #409EFF;
                padding-left: 8px;
                line-height: 16px;
                border-left: solid 3px #409EFF;
                cursor: pointer;
            }
            .right {
                display: flex;
                align-items: center;
                padding-right: 10px;
                .role {
                    color: #333;
                    &.link {
                        cursor: pointer;
                        &:hover {
                            color: #409EFF;
                            text-decoration: underline;
                        }
                    }
                }
                .status {
                    color: #fff;
                    font-size: 12px;
                    line-height: 24px;
                    padding: 0 10px;
                    min-width: 60px;
                    text-align: center;
                    border-radius: 12px;
                    background: #555;
                    margin-left: 10px;
                }
            }
        }
        .body-wrap {
            border-top: dashed 1px #d7d7d7;
            .content {
                padding: 15px;
            }
        }
        .foot-wrap {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding: 10px 15px;
            .name {
                color: #333;
            }
            .date {
                color: #999;
                margin-left: 15px;
            }
        }
    }
}
.role-list {
    display: flex;
    flex-wrap: wrap;
    padding: 15px;
    flex: 1;
    overflow: auto;
    align-content: flex-start;
    .item {
        padding: 5px;
        .text {
            background: #eeedeb;
            line-height: 20px;
            padding: 6px 10px;
            border-radius: 2px;
            color: #666;
        }
    }
}
</style>
