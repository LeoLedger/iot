package hw.topevery.basis.framework.base;

import hw.topevery.basis.framework.QueryParameter;

import java.io.Serializable;

/**
 * 可以指定GetList的查询参数，其余与BaseCrudLogic4一致。
 * @param <TEntity> 实体。
 * @param <TEntityDto> getDetail、getList输出的类型; create、update 的输入dto。
 * @param <TKey> 实体主键类型。
 * @param <TGetListInput> getList的查询类型。
 */
public abstract class BaseCrudLogic3<TEntity, TEntityDto extends Serializable, TKey extends Serializable, TGetListInput extends QueryParameter> extends BaseCrudLogic2<TEntity, TEntityDto, TKey, TGetListInput, TEntityDto> {


}
