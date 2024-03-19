package hw.topevery.basis.framework.base;

import hw.topevery.basis.framework.QueryParameter;
import hw.topevery.basis.framework.UserSession;
import hw.topevery.framework.DataFillHelper;
import hw.topevery.framework.db.entity.DataPager;
import org.apache.commons.collections.CollectionUtils;

import java.io.Serializable;
import java.lang.reflect.ParameterizedType;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 基础的 crud logic。
 *
 * @param <TEntity>           实体。
 * @param <TGetDetailDto>     详情DTO。
 * @param <TGetListOutputDto> getList输出的类型。
 * @param <TKey>              实体主键类型。
 * @param <TGetListInput>     getList的查询类型。
 * @param <TCreateInput>      create的输入dto。
 * @param <TUpdateInput>      update的输入dto。
 */
public abstract class BaseCrudLogic<TEntity, TGetDetailDto extends Serializable, TGetListOutputDto extends Serializable, TKey extends Serializable, TGetListInput extends QueryParameter, TCreateInput, TUpdateInput> {

    protected abstract BaseCrudDao<TEntity, TGetListOutputDto, TKey, TGetListInput> getCrudDao();

    protected TEntity createInputMapToEntity(TCreateInput input) throws IllegalAccessException, InstantiationException {
        TEntity entity = getEntityClassType().newInstance();
        //BeanUtils.copyProperties(input, entity);
        DataFillHelper.readToTarget(input, entity);
        return entity;
    }

    protected void updateInputMapToEntity(TUpdateInput input, TEntity entity) {
        DataFillHelper.readToTarget(input, entity);
        //BeanUtils.copyProperties(input, entity);
    }

    protected TGetDetailDto mapToDetailDto(TEntity entity) throws IllegalAccessException, InstantiationException {
        TGetDetailDto detailDto = getGetDetailDtoType().newInstance();
        DataFillHelper.readToTarget(entity, detailDto);
        // BeanUtils.copyProperties(entity, detailDto);
        return detailDto;
    }


    protected Class<TEntity> getEntityClassType() {
        ParameterizedType type = (ParameterizedType) this.getClass()
                .getGenericSuperclass();
        return (Class<TEntity>) type.getActualTypeArguments()[0];
    }

    protected Class<TGetDetailDto> getGetDetailDtoType() {
        ParameterizedType type = (ParameterizedType) this.getClass()
                .getGenericSuperclass();
        return (Class<TGetDetailDto>) type.getActualTypeArguments()[1];
    }

    public TEntity getEntityById(TKey id) {
        return getCrudDao().getEntity(id);
    }

    public TEntity getEntityByGuid(UUID id) {
        return getCrudDao().getEntityByGuid(id);
    }

    public TEntity create(TCreateInput input) throws Exception {
        TEntity entity = createInputMapToEntity(input);
        getCrudDao().insert(UserSession.getInstance().getUserId(), entity);
        return entity;
    }

    public List<TEntity> createList(List<TCreateInput> inputList) throws Exception {
        List<TEntity> entityList = new ArrayList<>();
        if(CollectionUtils.isNotEmpty(inputList)) {
            for(TCreateInput input : inputList) {
                TEntity entity = createInputMapToEntity(input);
                entityList.add(entity);
            }
            getCrudDao().insert(UserSession.getInstance().getUserId(), entityList);
        }
        return entityList;
    }

    public TEntity update(TKey id, TUpdateInput input) {
        TEntity entity = getEntityById(id);
        updateInputMapToEntity(input, entity);
        return update(entity);
    }

    public TEntity update(TEntity entity) {
        getCrudDao().update(UserSession.getInstance().getUserId(), entity);
        return entity;
    }

    public TEntity updateByGuid(TEntity entity){
        return getCrudDao().updateByGuid(entity);
    }

    public void deleteById(TKey id, String userId) {
        getCrudDao().delete(userId, id);
    }

    public void deleteByGuid(String guid){
        getCrudDao().deleteByGuid(guid);
    }

    public void deleteById(TKey id) {
        getCrudDao().delete(id);
    }

    public DataPager<TGetListOutputDto> getList(TGetListInput input) {
        return getCrudDao().getDataPager(input);
    }

    public TGetDetailDto getDetail(TKey id) throws InstantiationException, IllegalAccessException {
        TGetDetailDto dto = getCrudDao().getDetailDtoById(id, getGetDetailDtoType());
        if (dto == null) {
            throw new RuntimeException(String.format("找不到对象，对象id：%s",id));
        }
        return dto;
    }

    public TGetDetailDto getDetailByGuid(UUID id) throws InstantiationException, IllegalAccessException {
        TGetDetailDto dto = getCrudDao().getDetailDtoByGuid(id, getGetDetailDtoType());
        if (dto == null) {
            throw new RuntimeException(String.format("找不到对象，对象id：%s",id));
        }
        return dto;
    }
}
