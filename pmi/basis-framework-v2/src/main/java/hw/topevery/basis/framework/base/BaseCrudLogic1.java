package hw.topevery.basis.framework.base;

import hw.topevery.basis.framework.QueryParameter;

import java.io.Serializable;

/**
 * 可分别指定创建、更新的DTO,但GetList、GetDetail共用TEntityDto作为输出类型。
 * @param <TEntity> 实体。
 * @param <TEntityDto> getDetail、getList输出的类型。
 * @param <TKey> 实体主键类型。
 * @param <TGetListInput> getList的查询类型。
 * @param <TCreateInput> create的输入dto。
 * @param <TUpdateInput> update的输入dto。
 */
public abstract class BaseCrudLogic1<TEntity, TEntityDto extends Serializable, TKey extends Serializable, TGetListInput extends QueryParameter, TCreateInput, TUpdateInput> extends BaseCrudLogic<TEntity, TEntityDto, TEntityDto, TKey, TGetListInput, TCreateInput, TUpdateInput> {

}
