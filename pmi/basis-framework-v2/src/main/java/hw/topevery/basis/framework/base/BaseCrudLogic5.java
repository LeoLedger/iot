package hw.topevery.basis.framework.base;

import hw.topevery.basis.framework.QueryParameter;

import java.io.Serializable;

public abstract class BaseCrudLogic5<TEntity, TGetDetailDto extends Serializable, TGetListOutputDto extends Serializable, TKey extends Serializable, TGetListInput extends QueryParameter, TCreateInput>
        extends BaseCrudLogic<TEntity, TGetDetailDto, TGetListOutputDto, TKey, TGetListInput, TCreateInput, TCreateInput> {
}
