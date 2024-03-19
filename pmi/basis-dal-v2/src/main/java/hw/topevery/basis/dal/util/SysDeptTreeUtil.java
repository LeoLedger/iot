package hw.topevery.basis.dal.util;

import hw.topevery.basis.dal.logic.SysDeptLogic;
import hw.topevery.basis.entity.model.DeptTree;
import hw.topevery.basis.entity.po.SysDept;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 部门树工具类
 *
 * @Author: whw
 * @Date: 2020/2/20 15:05
 */
@Component
public class SysDeptTreeUtil {

    @Autowired
    SysDeptLogic sysDeptLogic;

    /**
     * 根据部门树id获取树形数据
     *
     * @param deptPid 父级部门ID
     * @return
     */
    public List<DeptTree> getTreeDate(String deptPid) {
        List<SysDept> list = sysDeptLogic.getListDept(null);
        return buildTree(list, deptPid);
    }

    /**
     * 根据部门树id获取树形数据
     *
     * @param list    源数据
     * @param deptPid 父级部门ID
     * @return
     */
    public List<DeptTree> getTreeDate(List<SysDept> list, String deptPid) {
        return buildTree(list, deptPid);
    }

    /**
     * 构建树形数据
     *
     * @param list     源数据
     * @param parentId 父节点ID
     * @return 构造完成的树形数据
     */
    private List<DeptTree> buildTree(List<SysDept> list, String parentId) {
        List<DeptTree> resultList = new ArrayList<>();
        List<SysDept> dataList = list.stream().filter(item -> item.deptPid.equals(parentId)).collect(Collectors.toList());
        for (SysDept item : dataList) {
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
    private DeptTree buildTreeNode(SysDept obj) {
        //将实体中的对应属性构造到树节点中
        DeptTree node = new DeptTree();
        node.setId(obj.deptId);
        node.setParentId(obj.deptPid);
        node.setLabel(obj.deptName);
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
    private void buildChildren(List<SysDept> list, DeptTree parentNode) {
        List<SysDept> nodes = list.stream().filter(item -> item.deptPid.equals(parentNode.getId())).collect(Collectors.toList());
        if (nodes.size() > 0) {
            parentNode.setChildren(new ArrayList<>());
            for (SysDept item : nodes) {
                DeptTree node = buildTreeNode(item);
                parentNode.getChildren().add(node);
                buildChildren(list, node);
            }
        }
    }
}
