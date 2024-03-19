<!--
* @description 功能权限配置
* @fileName feature.vue
* @author 叶金龙
* @date 2019/07/10 16:05:05
* @version V1.0.0
!-->
<template>
    <div class="app-container">
        <el-dialog
            :title="'('+searchFeatureObj.actionName+')功能权限配置'"
            :visible.sync="featureVisible"
            width="1000px"
            :before-close="beforeClose"
        >
            <el-table
                :data="list"
                border
                stripe
                resizable
                highlight-current-row
                height="400"
                ref="singleTable"
                @select="handleSelectChange"
                @select-all="handleSelectAllChange"
            >
                <el-table-column fixed type="selection" width="55"></el-table-column>
                <el-table-column fixed align="center" width="50" label="序号">
                    <template slot-scope="scope">
                        <span>{{scope.$index+(searchParam.pageIndex-1) *searchParam.pageSize + 1}}</span>
                    </template>
                </el-table-column>
                <!-- sortable="custom" -->
                <el-table-column fixed align="center" label="权限ID" prop="privilegeId" width="260"></el-table-column>
                <el-table-column align="center" label="权限名称" prop="privilegeName" width="200"></el-table-column>
                <el-table-column align="center" label="权限类型" prop="privilegeTypeName"></el-table-column>
                <el-table-column align="center" label="所属模块" prop="parentName" width="200"></el-table-column>
                <el-table-column align="center" label="备注" prop="privilegeRemarks" width="100"></el-table-column>
            </el-table>

            <span slot="footer">
                <el-button @click="simpleClose" v-waves size="mini">取 消</el-button>
                <el-button
                    type="primary"
                    @click="submitFeature"
                    v-waves
                    v-prereclick
                    size="mini"
                >确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import waves from "@/directive/waves"; // Waves directive;
import prereclick from "@/directive/prereclick"; // prereclick directive;
import Pagination from "@/components/Pagination";
import resourceApi from "@/api/resource";
import { getfeatureList } from "@/api/userAuthor/authorityMn/index";
import { truncate } from "fs";
export default {
    name: "featureDialog",
    directives: { waves, prereclick },
    data() {
        return {
            searchParam: {
                appId: null,
                menuId: null,
                privilegeId: null,
                privilegeName: null,
                pageSize: 15,
                pageIndex: 1,
                sortField: "",
                sortDirection: ""
            },
            list: [],
            featureArr: []
        };
    },
    props: {
        featureVisible: {
            type: Boolean,
            default: false
        },
        searchFeatureObj: {
            type: Object,
            default: null
        },
        copyprivilegeArr: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    created() {},
    watch: {
        searchFeatureObj: {
            immediate: true,
            deep: true,
            handler(val) {
                if (val != null) {
                    this.searchParam = Object.assign(this.searchParam, val);
                    this.getList();
                }
            }
        },
        copyprivilegeArr: {
            immediate: true,
            deep: true,
            handler(val) {
                if (val != null) {
                    this.featureArr = val.concat();
                }
            }
        }
    },
    components: {},
    methods: {
        // 确认关闭
        beforeClose() {
            this.$confirm("确认放弃本次操作？")
                .then(_ => {
                    //done();  不能使用done 否则会直接操作模态框
                    this.$nextTick(() => {
                        this.$emit("closeFeature", null);
                    });
                })
                .catch(_ => {
                    return false;
                });
        },
        // 直接关闭
        simpleClose() {
            this.$emit("closeFeature", null);
        },
        // 列表
        getList() {
            getfeatureList(this.searchParam).then(res => {
                this.list = res.data;
                this.list.forEach(i => {
                    this.$set(i, "checked", false);
                });
                this.featureArr.forEach(a => {
                    let row = this.list.find(b => {
                        return a.id == b.id;
                    });
                    if (row != undefined) {
                        (function(row, self) {
                            self.$nextTick(() => {
                                row.checked = true;
                                self.$refs.singleTable.toggleRowSelection(
                                    row,
                                    true
                                );
                            });
                        })(row, this);
                    }
                });
            });
        },
        // 单选
        handleSelectChange(selection, row) {
            row.checked = !row.checked;
            if (row.checked) {
                this.featureArr.push({
                    id: row.id,
                    parentPriId: row.priParentId
                });
            } else {
                let i = this.featureArr.findIndex(val => {
                    return val.id == row.id;
                });
                if (i > -1) {
                    this.featureArr.splice(i, 1);
                }
            }
        },
        // 全选
        handleSelectAllChange(selection) {
            this.list.forEach(x => {
                let index = this.featureArr.findIndex(y => {
                    return y.id == x.id;
                });
                if (index > -1) {
                    x.checked = false;
                    this.featureArr.splice(index, 1);
                }
            });
            selection.forEach(x => {
                this.handleSelectChange(selection, x);
            });
        },
        // 提交功能权限
        submitFeature() {
            this.$emit("closeFeature", { feature: this.featureArr });
        }
    }
};
</script>

<style lang='scss'>
</style>
