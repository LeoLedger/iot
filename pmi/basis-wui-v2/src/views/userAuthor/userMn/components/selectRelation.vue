<!--
* @description 选择关联的客户
* @fileName selectRelation.vue
* @author 叶金龙
* @date 2019/06/14 09:52:28
* @version V1.0.0
!-->
<template>
    <div class="dialog-container">
        <el-dialog
            title="选择关联客户"
            :visible.sync="selectVisible"
            width="1000px"
            :before-close="beforeClose"
        >
            <el-table
                ref="dataTable"
                :data="list"
                border
                fit
                highlight-current-row
                style="width: 100%;"
                height="40vh"
                @row-click="handleCurrentChange"
                @sort-change="tableSortChange"
            >
                <!-- sortable="custom" -->
                <el-table-column fixed align="center" width="50" label="序号">
                    <template slot-scope="scope">
                        <span>{{scope.$index+(searchParam.pageIndex-1) *searchParam.pageSize + 1}}</span>
                    </template>
                </el-table-column>
                <el-table-column fixed="left" align="center" width="230" label="客户名称" prop="name"></el-table-column>
                <el-table-column
                    fixed="left"
                    align="center"
                    width="130"
                    label="类型"
                    prop="companyType"
                ></el-table-column>
                <el-table-column
                    fixed="left"
                    align="center"
                    width="130"
                    label="企业规模"
                    prop="companyScale"
                ></el-table-column>
                <el-table-column fixed="left" align="center" label="客户联系人" prop="contact"></el-table-column>
                <el-table-column fixed="left" align="center" label="联系方式" prop="contactPhone"></el-table-column>
            </el-table>
            <pagination
                v-show="pagination.records>0"
                :total="pagination.records"
                :page.sync="searchParam.pageIndex"
                :limit.sync="searchParam.pageSize"
                @pagination="getList"
            />
            <div>
                <el-row type="flex" justify="space-between">
                    <el-col>
                        <span>已选择</span>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col>
                        <div class="company-container">
                            <div class="company-item" v-if="company.name">{{company.name}}</div>
                        </div>
                    </el-col>
                </el-row>
            </div>
            <span slot="footer">
                <el-button @click="simpleClose" v-waves size="mini">取 消</el-button>
                <el-button
                    type="primary"
                    @click="submitRelation"
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
import { getRelatiion } from "@/api/userAuthor/userMn/index";
export default {
    name: "xx",
    directives: { waves, prereclick },
    data() {
        return {
            pagination: {
                records: 0,
                pageIndex: 0,
                ageTotal: 0
            },
            searchParam: {
                pageSize: 15,
                pageIndex: 1,
                sortField: null,
                sortDirection: null
            },
            list: [],
            company: {}
        };
    },
    props: {
        selectVisible: {
            type: Boolean,
            default: false
        }
    },
    created() {
        this.getList();
    },
    watch: {
        xxxxx: {
            immediate: true,
            handler(val) {}
        }
    },
    components: {
        Pagination
    },
    methods: {
        //   排序
        tableSortChange() {},
        //  获取列表
        getList() {
            getRelatiion(this.searchParam).then(res => {
                if (res.data.success) {
                    this.list = res.data.data.rows;
                    this.pagination.records = res.data.data.records;
                }
            });
        },
        //   直接关闭
        simpleClose() {
            this.$emit("closeSelect", false);
        },
        //确认关闭
        beforeClose() {
            this.$confirm("确认放弃本次操作？")
                .then(_ => {
                    //done();  不能使用done 否则会直接操作模态框
                    this.$nextTick(() => {
                        this.$emit("closeSelect", false);
                    });
                })
                .catch(_ => {
                    return false;
                });
        },
        // 选择客户
        handleCurrentChange(val) {
            this.company = Object.assign({}, val);
        },
        // 提交租户
        submitRelation() {
            this.$emit("closeSelect", false);
            this.$emit("getRelationObject", this.company);
        }
    }
};
</script>

<style lang='scss'>
.company-item {
    display: inline-block;
    padding: 0 5px;
    border: 1px solid #bbbbbb;
    min-width: 100px;
    text-align: center;
    height: 30px;
    background-color: #409eff;
    color: #fff;
    line-height: 30px;
    margin: 10px 0 0 10px;
}
</style>
