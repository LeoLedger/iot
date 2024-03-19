package hw.topevery.basis.framework.base;

import hw.topevery.basis.framework.QueryParameter;
import hw.topevery.basis.framework.UserSession;
import hw.topevery.framework.db.DbExecute;
import hw.topevery.framework.db.base.BaseEntityDao;
import hw.topevery.framework.db.entity.DataPager;

import java.io.Serializable;
import java.util.List;
import java.util.UUID;

public interface BaseCrudDao<TEntity, TGetListOutputDto, TKey extends Serializable, TGetListInput extends QueryParameter> extends BaseEntityDao<TEntity, TKey> {

    DbExecute getDbExecute();

    void beginTransaction(Runnable action);

    /**
     * 获取分页数据
     * @param input
     * @return
     */
    DataPager<TGetListOutputDto> getDataPager(TGetListInput input);

    /**
     * 获取实体集合。
     * @param input
     * @return
     */
    DataPager<TEntity> getList(TGetListInput input);

    void delete(TKey id);

    void deleteByGuid(String guid);

    TEntity getEntityByGuid(UUID id);

    <TDetailDto> TDetailDto getDetailDtoById(TKey id, Class<TDetailDto> clazz);
    <TDetailDto> TDetailDto getDetailDtoByGuid(UUID id, Class<TDetailDto> clazz);

    TEntity updateByGuid(TEntity entity);

    default void insert(TEntity... entities){
        insert(getUserId(), entities);
    }

    default void insert(List<TEntity> entities){
        insert(getUserId(), entities);
    }

    default void update(List<TEntity> entities){
        update(getUserId(), entities);
    }

    default void update(TEntity... entities){
        update(getUserId(), entities);
    }

    default void delete(List<TKey> keys){
        delete(getUserId(), keys);
    }

    default void delete(TKey... keys){
        delete(getUserId(), keys);
    }

    default String getUserId(){
        return UserSession.getInstance().getUserId();
    }

    void insertBatch(String userId, List<TEntity> entities) throws Exception;
    void insertBatch(String userId, List<TEntity> entities, int batchNum) throws Exception;
    void insertBatch(List<TEntity> entities) throws Exception;
    void insertBatch(List<TEntity> entities, int batchNum) throws Exception;

    void updateBatch(String userId, List<TEntity> entities) throws Exception;
    void updateBatch(String userId, List<TEntity> entities, int batchNum) throws Exception;
    void updateBatch(List<TEntity> entities) throws Exception;
    void updateBatch(List<TEntity> entities, int batchNum) throws Exception;

//    void deleteBatch(String userId, List<TKey> keys) throws Exception;
//    void deleteBatch(String userId, List<TKey> keys, int batchNum) throws Exception;
//    void deleteBatch(List<TKey> keys) throws Exception;
//    void deleteBatch(List<TKey> keys, int batchNum) throws Exception;
}
