// 更新treeId
export function updateTreeId(data) {
    data._treeId = `${data.productId}-${data.salesType}`
    if (Array.isArray(data.bomList)) {
        data.bomList.forEach(item => {
            item.salesType = 0
            item._isBom = true
            item._treeId = `${data._treeId}-${item.productId}`
        })
    }
}
