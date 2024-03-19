package hw.topevery.basis.framework.base;

import hw.topevery.basis.framework.UserSession;
import hw.topevery.framework.db.base.BaseEntityDao;
import hw.topevery.framework.db.base.BaseEntityLogic;

import java.util.List;

public abstract class BaseLogic<T> implements BaseEntityLogic<T, Integer> {
    public void saveOrUpdate(String userId, T... entityList){
        BaseEntityDao<T, Integer> dao = getDao();
        if(dao instanceof BaseDao){
            BaseDao<T> baseDao = (BaseDao<T>) dao;
            baseDao.saveOrUpdate(userId, entityList);
        }
    }

    public void update(List<T> vals) {
        BaseEntityDao<T, Integer> dao = this.getDao();
        dao.update(getUserId(), vals);
    }

    public void update(T... vals) {
        BaseEntityDao<T, Integer> dao = this.getDao();
        dao.update(getUserId(), vals);
    }

    public void insert(T... vals) {
        BaseEntityDao<T, Integer> dao = this.getDao();
        dao.insert(getUserId(), vals);
    }

    public void insert(List<T> vals) {
        BaseEntityDao<T, Integer> dao = this.getDao();
        dao.insert(getUserId(), vals);
    }

    public void delete(List<Integer> ids) {
        BaseEntityDao<T, Integer> dao = this.getDao();
        dao.delete(getUserId(), ids);
    }

    public void delete(Integer... ids) {
        BaseEntityDao<T, Integer> dao = this.getDao();
        dao.delete(getUserId(), ids);
    }

    private String getUserId(){
        return UserSession.getInstance().getUserId();
    }
}
