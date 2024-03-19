package hw.topevery.basis.dal.util;

import hw.topevery.basis.entity.po.SysClass;
import hw.topevery.framework.TreeNode;

import java.util.ArrayList;
import java.util.List;

/**
 * 描述：类型树构造工具类
 *
 * @author whw
 * @date 2019/12/23 11:26
 */
public class SysClassTreeUtil {

    /**
     * 根据部门列表获取树形数据
     *
     * @param list     源数据
     * @param parentId 父节点ID
     * @return 构造完成的树形数据
     */
    public static List<TreeNode> getTreeData(List<SysClass> list, String parentId) {
        //最终返回的树数据
        List<TreeNode> deptTree = new ArrayList<>();
        //在集合中根据父节点ID，获取所有子节点
        List<SysClass> childNodes = getChildNode(list, parentId);
        for (SysClass childNode : childNodes) {
            TreeNode nodeItem = getNodeItem(childNode);
            buildChildNode(list, nodeItem);
            deptTree.add(nodeItem);
        }
        return deptTree;
    }

    /**
     * 获取父节点下的所有子节点
     *
     * @param list     源数据
     * @param parentId 父节点ID
     * @return 父节点下的所有子节点
     */
    private static List<SysClass> getChildNode(List<SysClass> list, String parentId) {
        List<SysClass> nodes = new ArrayList<>();
        for (SysClass node : list) {
            if (node.classPid.equals(parentId)) {
                nodes.add(node);
            }
        }
        return nodes;
    }

    /**
     * 根据父节点构造子节点
     *
     * @param list       源数据
     * @param parentNode 父节点
     */
    private static void buildChildNode(List<SysClass> list, TreeNode parentNode) {
        List<SysClass> childNodes = getChildNode(list, parentNode.getId());
        if (childNodes.size() > 0) {
            //如果存在子节点，就实例化一个list用来存储子节点
            parentNode.setChildren(new ArrayList<>());
            for (SysClass node : childNodes) {
                //构造树节点
                TreeNode nodeItem = getNodeItem(node);
                //将树节点添加到子节点集合中
                parentNode.getChildren().add(nodeItem);
                buildChildNode(list, nodeItem);
            }
        }
    }

    /**
     * 构造节点数据
     *
     * @param sysClass 需要转换为树节点的实体
     * @return 树节点数据
     */
    private static TreeNode getNodeItem(SysClass sysClass) {
        //将实体中的对应属性构造到树节点中
        TreeNode treeNode = new TreeNode();
        treeNode.setId(sysClass.classId);
        treeNode.setParentId(sysClass.classPid);
        treeNode.setLabel(sysClass.name);
        treeNode.setLevel(sysClass.devCode);
        treeNode.setSortCode(sysClass.orderNum);
        treeNode.setValue(sysClass.classId);
        return treeNode;
    }
}
