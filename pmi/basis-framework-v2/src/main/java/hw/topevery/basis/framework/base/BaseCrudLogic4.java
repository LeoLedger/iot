package hw.topevery.basis.framework.base;


import hw.topevery.basis.framework.QueryParameter;

import java.io.Serializable;

/**
 * 只需要指定 TEntity, TEntityDto, TKey,查询参数使用 QueryParameter，其余 output、input Dto 使用 TEntityDto
 * @param <TEntity> 实体。
 * @param <TEntityDto> getDetail、getList输出的类型; create、update 的输入dto。
 * @param <TKey> 实体主键类型。
 */
public abstract class BaseCrudLogic4<TEntity, TEntityDto extends Serializable, TKey extends Serializable> extends BaseCrudLogic3<TEntity, TEntityDto, TKey, QueryParameter> {

}
