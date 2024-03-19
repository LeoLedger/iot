package hw.topevery.basis.dal.util;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import hw.topevery.basis.dal.dao.SysMapInTreeDao;
import hw.topevery.basis.dal.logic.SysMapInTreeLogic;
import hw.topevery.basis.dal.logic.SysMapLogic;
import hw.topevery.basis.entity.dto.SysMapTree;
import hw.topevery.basis.entity.dto.TreeNodeSimple;
import hw.topevery.basis.entity.fetch.MapTreeFetch;
import hw.topevery.basis.entity.po.SysMap;
import hw.topevery.basis.entity.po.SysMapInTree;
import hw.topevery.framework.SystemConst;
import hw.topevery.framework.TreeNode;

@Component
public class SysMapTreeUtil {
    @Autowired
    private SysMapInTreeLogic sysMapInTreeLogic;
    @Autowired
    private SysMapLogic sysMapLogic;

    @Autowired
    SysMapInTreeDao sysMapInTreeDao;

    @Autowired
    private ThreadUtils threadUtils;

    public List<SysMap> getTree(String mid) {
        if (StringUtils.isEmpty(mid)) {
            mid = "7A33818A-3079-49EE-863B-977F493D18E9";
        }
        return sysMapInTreeDao.getTree(mid);
    }

    /**
     * 获取区域树
     *
     * @return 区域树
     */
    public List<SysMapTree> getMapTree() throws InterruptedException {
        return getMapTree(SystemConst.UUID_EMPTY_STRING);
    }

    public List<TreeNodeSimple> getListSimple(MapTreeFetch input) throws InterruptedException {
        List<SysMap> mapList = sysMapLogic.getAllBy(input);
        return buildMapTreeSimple(mapList, SystemConst.UUID_EMPTY_STRING);
    }

    public List<SysMapTree> getMapTree(String mapId) throws InterruptedException {
        List<SysMap> mapList = sysMapLogic.getListMap();
        return buildMapTree(mapList, mapId);
    }


    public List<SysMapTree> getMapTreeByTreeId(String treeId) throws InterruptedException {
        List<SysMapInTree> sysMapInTreeList = sysMapInTreeLogic.getListByMapTreeId(treeId);

        List<SysMap> mapList = new ArrayList<>();
        for (SysMapInTree m : sysMapInTreeList) {
            SysMap sysMap = new SysMap();
            sysMap.mapId = m.mapId;
            sysMap.mapPid = m.mapPid;
            sysMap.name = m.name;
            sysMap.orderNum = m.orderNum;
            mapList.add(sysMap);
        }
        return buildMapTree(mapList, SystemConst.UUID_EMPTY_STRING);
    }

    public List<SysMapTree> buildMapTree(List<SysMap> mapList, String parentId) throws InterruptedException {
        List<SysMapTree> treeList = new ArrayList<>();
        List<SysMap> roots = mapList.stream().filter(item -> item.mapPid.equalsIgnoreCase(parentId)).collect(Collectors.toList());
        for (SysMap m : roots) {
            List<SysMap> subList = mapList.stream().filter(x -> x.mapPid.equalsIgnoreCase(m.mapId)).collect(Collectors.toList());
            for(SysMap item : subList){
                SysMapTree tmp = buildMapTreeNode(item);
                treeList.add(tmp);
                threadUtils.execute(() -> buildSysMapTreeChildren(mapList, tmp));
            }
            //treeList.add(root);
        }
        return treeList;
    }

    public List<TreeNodeSimple> buildMapTreeSimple(List<SysMap> mapList, String parentId) throws InterruptedException {
        List<TreeNodeSimple> treeList = new ArrayList<>();
        List<SysMap> roots = mapList.stream().filter(item -> item.mapPid.equalsIgnoreCase(parentId)).collect(Collectors.toList());
        for (SysMap m : roots) {
            List<SysMap> subList = mapList.stream().filter(x -> x.mapPid.equalsIgnoreCase(m.mapId)).collect(Collectors.toList());
            for(SysMap item : subList) {
                TreeNodeSimple tmp = TreeNodeSimple.builder().label(item.name).value(item.mapId).build();
                treeList.add(tmp);
                threadUtils.execute(() -> buildTreeNodeSimpleChildren(mapList, tmp, item.mapId));
            }
        }
        return treeList;
    }

    /**
     * 创建地图子节点
     *
     * @param mapList    地图数据
     * @param parentNode 父节点
     */
    private void buildSysMapTreeChildren(List<SysMap> mapList, SysMapTree parentNode) {
        List<SysMap> sysMapList = mapList.stream().filter(item -> item.mapPid.equalsIgnoreCase(parentNode.getId())).collect(Collectors.toList());
        if (CollectionUtils.isNotEmpty(sysMapList)) {
            //如果存在子节点，就实例化一个list用来存储子节点
            parentNode.setChildren(new ArrayList<>());
            for (SysMap m : sysMapList) {
                SysMapTree root = buildMapTreeNode(m);
                buildSysMapTreeChildren(mapList, root);
                parentNode.getChildren().add(root);
            }
        }
    }

    private void buildTreeNodeSimpleChildren(List<SysMap> mapList, TreeNodeSimple parentNode, String parentId) {
        List<SysMap> sysMapList = mapList.stream().filter(item -> item.mapPid.equalsIgnoreCase(parentId)).collect(Collectors.toList());
        if (CollectionUtils.isNotEmpty(sysMapList)) {
            //如果存在子节点，就实例化一个list用来存储子节点
            parentNode.setChildren(new ArrayList<>());
            for (SysMap m : sysMapList) {
                TreeNodeSimple root = TreeNodeSimple.builder().label(m.name).value(m.mapId).build();
                buildTreeNodeSimpleChildren(mapList, root, m.mapId);
                parentNode.getChildren().add(root);
            }
        }
    }

    /**
     * 创建区域树节点
     *
     * @param m 地图数据
     * @return 树节点
     */
    private SysMapTree buildMapTreeNode(SysMap m) {
        SysMapTree root = new SysMapTree();
        root.setId(m.mapId);
        root.setParentId(m.mapPid);
        root.setLabel(m.name);
        root.setLevel(m.devCode);
        root.setSortCode(m.orderNum);
        root.setValue(m.mapId);
        root.setMapType(m.mapType);
        return root;
    }

    /**
     * 根据部门列表获取树形数据
     *
     * @param list     源数据
     * @param parentId 父节点ID
     * @return 构造完成的树形数据
     */
    public static List<TreeNode> getTreeData(List<SysMap> list, String parentId) {
        //最终返回的树数据
        List<TreeNode> deptTree = new ArrayList<>();
        //在集合中根据父节点ID，获取所有子节点
        List<SysMap> childNodes = getChildNode(list, parentId);
        for (SysMap childNode : childNodes) {
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
    private static List<SysMap> getChildNode(List<SysMap> list, String parentId) {
        List<SysMap> nodes = new ArrayList<>();
        for (SysMap node : list) {
            if (node.mapPid.equalsIgnoreCase(parentId)) {
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
    private static void buildChildNode(List<SysMap> list, TreeNode parentNode) {
        List<SysMap> childNodes = getChildNode(list, parentNode.getId());
        if (childNodes.size() > 0) {
            //如果存在子节点，就实例化一个list用来存储子节点
            parentNode.setChildren(new ArrayList<>());
            for (SysMap node : childNodes) {
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
     * @param dept 需要转换为树节点的实体
     * @return 树节点数据
     */
    private static TreeNode getNodeItem(SysMap dept) {
        //将实体中的对应属性构造到树节点中
        TreeNode treeNode = new TreeNode();
        treeNode.setId(dept.mapId);
        treeNode.setParentId(dept.mapPid);
        treeNode.setLabel(dept.name);
        treeNode.setLevel(dept.devCode);
        treeNode.setSortCode(dept.orderNum);
        treeNode.setValue(dept.mapId);
        return treeNode;
    }
}