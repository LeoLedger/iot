package hw.topevery.basis.framework.base;

import hw.topevery.basis.framework.QueryParameter;
import hw.topevery.framework.annotation.DbTableField;
import hw.topevery.framework.util.LogUtil;
import org.apache.commons.lang3.ObjectUtils;

import java.io.Serializable;
import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.Optional;

/**
 * 创建、更新使用同一个DTO,即 TCreateInput
 *
 * @param <TEntity>       实体。
 * @param <TEntityDto>    getDetail、getList输出的类型。
 * @param <TKey>          实体主键类型。
 * @param <TGetListInput> getList的查询类型。
 * @param <TCreateInput>  create 、update 的输入dto。
 */
public abstract class BaseCrudLogic2<TEntity, TEntityDto extends Serializable, TKey extends Serializable, TGetListInput extends QueryParameter, TCreateInput> extends BaseCrudLogic1<TEntity, TEntityDto, TKey, TGetListInput, TCreateInput, TCreateInput> {

    public TEntity createOrUpdate(TCreateInput input) throws Exception {
        Class<?> inputClass = input.getClass();
        Field[] fieldArr = inputClass.getFields();

        Optional<Field> optionalField = Arrays.stream(fieldArr).filter(x -> {
            DbTableField annotation = x.getAnnotation(DbTableField.class);
            return ObjectUtils.isNotEmpty(annotation) && annotation.isKey();
        }).findFirst();

        if (!optionalField.isPresent()) {
            LogUtil.error("没有找到主键ID");
            throw new RuntimeException("没有找到主键ID");
        }

        Field keyField = optionalField.get();
        Object id = keyField.get(input);
        if (ObjectUtils.isEmpty(id) || id.equals(0)) {
            return this.create(input);
        } else {
            return this.update((TKey) id, input);
        }
    }
}
