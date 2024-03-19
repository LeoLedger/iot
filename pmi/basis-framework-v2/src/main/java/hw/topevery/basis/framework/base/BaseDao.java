package hw.topevery.basis.framework.base;


import hw.topevery.basis.framework.UserSession;
import hw.topevery.framework.db.base.BaseEntityDao;

import java.util.List;

public interface BaseDao<T> extends BaseEntityDao<T, Integer> {
    void saveOrUpdate(String userId, T... entityList);

    default void insert(T... entities){
        insert(getUserId(), entities);
    }

    default void insert(List<T> entities){
        insert(getUserId(), entities);
    }

    default void update(List<T> entities){
        update(getUserId(), entities);
    }

    default void update(T... entities){
        update(getUserId(), entities);
    }

    default void delete(List<Integer> keys){
        delete(getUserId(), keys);
    }

    default void delete(Integer... keys){
        delete(getUserId(), keys);
    }

    default String getUserId(){
        return UserSession.getInstance().getUserId();
    }

    void insertBatch(String userId, List<T> entities) throws Exception;
    void insertBatch(String userId, List<T> entities, int batchNum) throws Exception;
    void insertBatch(List<T> entities) throws Exception;
    void insertBatch(List<T> entities, int batchNum) throws Exception;

}
