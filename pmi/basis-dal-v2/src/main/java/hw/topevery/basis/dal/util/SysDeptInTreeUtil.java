package hw.topevery.basis.dal.util;

import hw.topevery.basis.dal.logic.SysDeptInTreeLogic;
import hw.topevery.basis.dal.logic.SysDeptLogic;
import hw.topevery.basis.entity.dto.DeptInTreeDto;
import hw.topevery.basis.entity.fetch.DeptInTreeFetch;
import hw.topevery.basis.entity.model.DeptTree;
import hw.topevery.basis.entity.po.SysDept;
import hw.topevery.basis.entity.po.SysDeptInTree;
import hw.topevery.framework.SystemConst;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 自定义部门树工具类
 *
 * @Author: whw
 * @Date: 2020/2/20 15:05
 */
@Component
public class SysDeptInTreeUtil {

    @Autowired
    SysDeptLogic sysDeptService;

    @Autowired
    SysDeptInTreeLogic sysDeptInTreeService;

    @Autowired
    SysDeptInTreeLogic sysDeptInTreeLogic;

    /**
     * 保存部门树
     *
     * @param deptInTreeDto
     * @param updateId
     * @return
     */
    public boolean saveObj(DeptInTreeDto deptInTreeDto, String updateId) {
        // 部门ID
        String curDeptId = deptInTreeDto.deptId;
        // 部门树ID
        String curDeptTreeId = deptInTreeDto.deptTreeId;
        // 层级级别
        int curDeptLevel = deptInTreeDto.level;
        // 是否是虚拟部门
        int curIsVirtual = deptInTreeDto.isVirtual;
        String deptPid = deptInTreeDto.deptPid;
        String treeCode = deptInTreeDto.treeCode;

        LocalDateTime xTime = LocalDateTime.now();
        deptInTreeDto.createId = updateId;
        deptInTreeDto.createTime = xTime;
        deptInTreeDto.updateId = updateId;
        deptInTreeDto.updateTime = xTime;

        // 已经调入的部门数据
        List<DeptInTreeDto> hasCallInList = sysDeptInTreeLogic.getList(new DeptInTreeFetch(curDeptTreeId)).records;
        // 检查是否重复调入
        if (isRepeatCallIn(curDeptId, hasCallInList)) {
            throw new RuntimeException(deptInTreeDto.getDeptName() + "已调入，不能重复调入");
        }

        ArrayList<SysDeptInTree> inTreeList = new ArrayList<>();


        //如果树体父节点为空，就设置本身为父节点
        deptInTreeDto.deptPid = (StringUtils.isEmpty(deptPid) ? SystemConst.UUID_EMPTY_STRING : deptPid);
        deptInTreeDto.treeCode = (StringUtils.isEmpty(treeCode) ? curDeptTreeId : treeCode);
        inTreeList.add(deptInTreeDto);

        //如果调入的时候包含子部门，获取当前部门下的所有子部门
        boolean incloudChild = deptInTreeDto.getIncloudChild();
        if (incloudChild) {
            List<SysDept> deptChildList = sysDeptService.getAllDeptChildsByDeptId(curDeptId);
            if (!CollectionUtils.isEmpty(deptChildList)) {
                for (SysDept dept : deptChildList) {
                    // 检查是否重复调入
                    if (isRepeatCallIn(dept.deptId, hasCallInList)) {
                        throw new RuntimeException(deptInTreeDto.getDeptName() + "已调入，不能重复调入");
                    }

                    SysDeptInTree deptInTree = new SysDeptInTree();
                    deptInTree.deptId = dept.deptId;
                    deptInTree.deptPid = dept.deptPid;
                    deptInTree.deptTreeId = curDeptTreeId;
                    deptInTree.treeCode = curDeptTreeId;
                    deptInTree.code = dept.devCode;
                    deptInTree.level = curDeptLevel;
                    deptInTree.isVirtual = (byte) curIsVirtual;

                    deptInTree.dbStatus = false;
                    deptInTree.createId = updateId;
                    deptInTree.createTime = xTime;
                    deptInTree.updateId = updateId;
                    deptInTree.updateTime = xTime;
                    inTreeList.add(deptInTree);
                }
            }
        }
        return sysDeptInTreeService.saveBatch(inTreeList);
    }

    /**
     * 检查是否重复调入
     *
     * @param deptId            需要调入的部门ID
     * @param deptInTreeDtoList 已经调入的部门数据
     * @return
     */
    public boolean isRepeatCallIn(String deptId, List<DeptInTreeDto> deptInTreeDtoList) {
        for (DeptInTreeDto deptInTreeDto : deptInTreeDtoList) {
            if (deptId.equals(deptInTreeDto.deptId)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 根据部门树id获取树形数据
     *
     * @param deptTreeId
     * @return
     */
    public List<DeptTree> getTreeDate(String deptTreeId) {
        List<DeptInTreeDto> list = sysDeptInTreeLogic.getInTreeList(deptTreeId);
        return buildTree(list, SystemConst.UUID_EMPTY_STRING);
    }

    /**
     * 构建树形数据
     *
     * @param list     源数据
     * @param parentId 父节点ID
     * @return 构造完成的树形数据
     */
    private List<DeptTree> buildTree(List<DeptInTreeDto> list, String parentId) {
        List<DeptTree> resultList = new ArrayList<>();
        List<DeptInTreeDto> dataList = list.stream().filter(item -> item.deptPid.equals(parentId)).collect(Collectors.toList());
        for (DeptInTreeDto item : dataList) {
            DeptTree node = buildTreeNode(item);
            buildChildren(list, node);
            resultList.add(node);
        }
        return resultList;
    }

    /**
     * 构造节点数据
     *
     * @param obj
     * @return
     */
    private DeptTree buildTreeNode(DeptInTreeDto obj) {
        //将实体中的对应属性构造到树节点中
        DeptTree node = new DeptTree();
        node.setId(obj.deptId);
        node.setParentId(obj.deptPid);
        node.setLabel(obj.getDeptName());
        node.setSortCode(obj.orderNum);
        node.setValue(obj.deptId);
        return node;
    }

    /**
     * 构建子节点
     *
     * @param list
     * @param parentNode
     */
    private void buildChildren(List<DeptInTreeDto> list, DeptTree parentNode) {
        List<DeptInTreeDto> nodes = list.stream().filter(item -> item.deptPid.equals(parentNode.getId())).collect(Collectors.toList());
        if (nodes.size() > 0) {
            parentNode.setChildren(new ArrayList<>());
            for (DeptInTreeDto item : nodes) {
                DeptTree node = buildTreeNode(item);
                parentNode.getChildren().add(node);
                buildChildren(list, node);
            }
        }
    }
}
