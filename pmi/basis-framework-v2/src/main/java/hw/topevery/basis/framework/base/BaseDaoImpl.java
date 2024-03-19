package hw.topevery.basis.framework.base;

import hw.topevery.basis.framework.Database;
import hw.topevery.basis.framework.UserSession;
import hw.topevery.basis.framework.base.concurrency.ConcurrencyException;
import hw.topevery.basis.framework.base.concurrency.IHasConcurrencyToken;
import hw.topevery.basis.framework.util.UUIDGenerator;
import hw.topevery.cloud.library.configuration.ConnectionSetting;
import hw.topevery.framework.SystemConst;
import hw.topevery.framework.Utility;
import hw.topevery.framework.annotation.DbTableField;
import hw.topevery.framework.db.*;
import hw.topevery.framework.db.base.BaseEntityDaoImpl;
import hw.topevery.framework.db.entity.DataPager;
import hw.topevery.framework.db.entity.KeyValueCondition;
import hw.topevery.framework.db.entity.SqlMate;
import hw.topevery.framework.db.entity.SqlQueryMate;
import hw.topevery.framework.db.enums.ScriptConditionEnum;
import hw.topevery.framework.entity.*;
import hw.topevery.framework.enums.DatabaseTypeEnum;
import hw.topevery.framework.util.LogUtil;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.locationtech.jts.geom.Geometry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.util.Assert;

import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

public abstract class BaseDaoImpl<T> extends BaseEntityDaoImpl<T, Integer> implements BaseDao<T> {

    @Autowired
    private UUIDGenerator uuidGenerator;

    @Override
    public DbExecute getDbExecute() {
        return Database.pmiDbExecute;
    }

    @Override
    public <P extends DbCsp> List<T> getSearch(P p) {
        SqlQueryMate sqlQueryMate = getSelectMate();
        String sql = sqlQueryMate.getSql();
        return getList(sql, CommandType.Text, null, getEntityClass());
    }

    // region 数据库CUD(创建/更新/删除)操作

    @Override
    public void updateBefore(String userId, T val) {
        if (val instanceof BaseEntity) {
            BaseEntity entity = (BaseEntity) val;
            entity.updateTime = LocalDateTime.now();
        }
        super.updateBefore(userId, val);
    }

    @Override
    public void insert(String userId, T... vals) {
        if(vals == null || vals.length == 0) return;
        if (vals.length > 10) {
            try {
                this.insertBatch(userId, Arrays.asList(vals));
            } catch (Exception e) {
                throw new RuntimeException(e.getMessage(), e);
            }
            return;
        }
        super.insert(userId, vals);
    }

    /**
     * 新增自动填充字段
     *
     * @param val 要插入的数据
     */
    @Override
    public void insertBefore(String userId, T val) {
        if (val instanceof BaseEntity) {
            BaseEntity entity = (BaseEntity) val;
            entity.createTime = LocalDateTime.now();
            entity.updateTime = LocalDateTime.now();
            entity.dbStatus = false;
            if (StringUtils.isBlank(entity.createId)) {
                entity.createId = userId;
            }
            if (StringUtils.isBlank(entity.updateId)) {
                entity.updateId = userId;
            }
        }

        if (val instanceof IHaveGuid) {
            IHaveGuid entity = (IHaveGuid) val;
            if (StringUtils.isBlank(entity.getGuidId())) {
                entity.setGuidId(uuidGenerator.generate().toString());
            }
        }

        if (val instanceof IHasCostCenterId) {
            IHasCostCenterId entity = (IHasCostCenterId)val;
            if (StringUtils.isBlank(entity.getCostCenterId())) {
                entity.setCostCenterId(UserSession.getInstance().getCostCenterId());
            }
        }

        setNewConcurrencyToken(val);

        super.insertBefore(userId, val);
    }

    @Override
    public void setDeleteField(String userId, T val) {
        if (val instanceof BaseEntity) {
            BaseEntity o = (BaseEntity) val;
            o.updateId = userId;
            o.updateTime = LocalDateTime.now();
            o.dbStatus = true;
        }
    }

    /**
     * 新增或更新
     *
     * @param entityList
     */
    public void saveOrUpdate(String userId, T... entityList) {
        if (StringUtils.isEmpty(userId)) {
            userId = SystemConst.UUID_EMPTY_STRING;
        }

        String finalUserId = userId;
        Database.pmiDbExecute.transactionScope(() -> {
            if (ObjectUtils.isNotEmpty(entityList) && entityList.length > 0) {
                List<T> insertList = new ArrayList<>();
                List<T> updateList = new ArrayList<>();

                for (T entity : entityList) {
                    Class<?> entityClass = entity.getClass();
                    Field[] fieldArr = entityClass.getFields();
                    for (Field field : fieldArr) {
                        field.setAccessible(true);

                        // 寻找实体类上的主键ID
                        DbTableField annotation = field.getAnnotation(DbTableField.class);
                        if (ObjectUtils.isNotEmpty(annotation) && annotation.isKey()) {
                            try {
                                Object id = field.get(entity);
                                if (entity instanceof BaseEntity) {
                                    if ((ObjectUtils.isEmpty(id) || id.equals(0)) && !(((BaseEntity) entity).dbStatus)) {
                                        ((BaseEntity) entity).createId = finalUserId;
                                        ((BaseEntity) entity).updateId = finalUserId;
                                        insertList.add(entity);
                                    } else {
                                        ((BaseEntity) entity).updateId = finalUserId;
                                        updateList.add(entity);
                                    }
                                }
                            } catch (IllegalAccessException e) {
                                LogUtil.error("没有找到主键ID:", e);
                                throw new RuntimeException("没有找到主键ID");
                            }
                            break;
                        }
                    }
                }

                if (insertList.size() > 0) {
                    insert(finalUserId, insertList);
                }
                if (updateList.size() > 0) {
                    update(finalUserId, updateList);
                }
            }
        });
    }

    @Override
    public void update(String userId, T... vals) {
        if(ArrayUtils.isEmpty(vals)) return;

        for (T entity : vals) {
            this.updateBefore(userId, entity);
            this.updateInner(entity);
        }

        this.removeCacheData();
    }

    private void updateInner(T entity){
        Assert.notNull(entity,"实体不能为空");
        DbTableMate dbTableMate = Utility.getDbTableMate(entity.getClass());

        Optional<DbTableFieldMapping> concurrencyTokenField = dbTableMate.columnInfos.stream()
                .filter(x -> x.entityField.getName().equalsIgnoreCase(IHasConcurrencyToken.FieldName))
                .findFirst();

        String oldToken = setNewConcurrencyToken(entity); // 设置新token.
        SqlMate sqlMate = DbScriptHelper.getUpdateSqlMateByKey(this.getDatabaseType(),"ty_hw_device" ,null, entity);
        if(concurrencyTokenField.isPresent()){
            applyConcurrencyFilter(sqlMate, concurrencyTokenField.get(), oldToken); // 应用 过滤
        }
        String sqlText = sqlMate.sql.toString();
        this.run(sqlText, CommandType.Text, (dbCmd) -> {
            sqlMate.parameters.forEach(dbCmd::addParameter);
            int affectRow = dbCmd.executeNonResultSet();
            if(affectRow <= 0){
                try {
                    ThrowConcurrencyException();
                } catch (ConcurrencyException e) {
                    throw new RuntimeException(e.getMessage(), e);
                }
            }
        });
    }

    protected String setNewConcurrencyToken(T entity){
        String oldToken = null;
        if(entity instanceof IHasConcurrencyToken){
            IHasConcurrencyToken concurrencyEntity = (IHasConcurrencyToken) entity;
            oldToken = concurrencyEntity.getConcurrencyToken();
            concurrencyEntity.setConcurrencyToken(uuidGenerator.generate().toString().replaceAll("-", ""));
        }

        return oldToken;
    }

    protected void applyConcurrencyFilter(SqlMate sqlMate, DbTableFieldMapping field, String oldToken){
        if(IHasConcurrencyToken.class.isAssignableFrom(getEntityClassType())){
            sqlMate.sql.append(String.format(" and %s='%s'", field.dbTableField.columnName(), oldToken));
        }
    }

    protected void ThrowConcurrencyException() throws ConcurrencyException {
        throw new ConcurrencyException("数据库操作预计影响1行，但实际影响0行。自从实体被加载后，数据可能已经被修改或删除。这个异常是在乐观的并发性检查中抛出的。");
    }

    // endregion


    // region 数据R(读取)操作


    // endregion

    /**
     * @param colKeyValue 列值对应
     * @return
     */
    protected T getEntityByColumnEqValue(KeyValue<?> colKeyValue) {
        Value<T> res = new Value<>();
        SqlQueryMate sqlQueryMate = getSelectMate();
        sqlQueryMate.where(true, new KeyValueCondition(colKeyValue.key, ScriptConditionEnum.Eq, colKeyValue.value));
        String sql = sqlQueryMate.getSql();
        run(sql, CommandType.Text, dbCmd -> {
            for (DbParameter i : sqlQueryMate.getParameters()) {
                dbCmd.addParameter(i);
            }
            res.data = dbCmd.executeToEntity(getEntityClass());
        });
        return res.data;
    }

    protected <T> List<T> getList(String sqlText, CommandType commandType, List<KeyValue<?>> parameters, Class<T> entityClass) {
        List<T> res = new ArrayList<>();
        run(sqlText, commandType, dbCmd -> {
            for (KeyValue parameter : parameters) {
                dbCmd.addInParameter(parameter.key, parameter.value);
            }
            dbCmd.executeToList(res, entityClass);
        });
        return res;
    }

    /**
     * 获取目标类的数据
     *
     * @param sql         sql 语句
     * @param commandType 执行类型
     * @param keyValues   参数集合
     * @param target      目标类
     * @param <R>         泛型（目标类型）
     * @return 标类的数据
     */
    public <R> DataPager<R> getDataPagerByCustomize(String sql, CommandType commandType,
                                                    List<KeyValue<Object>> keyValues, Class<R> target) {
        Value<DataPager<R>> result = new Value<>();
        run(sql, commandType, dbCmd -> {
            if (keyValues != null && keyValues.size() != 0) {
                keyValues.forEach(keyValue -> dbCmd.addInParameter(keyValue.key, keyValue.value));
            }
            result.data = dbCmd.executeToDataPager(target);
        });

        return result.data;
    }

    /**
     * 获取目标类的数据
     *
     * @param target 目标类
     * @param <E>    泛型（目标类型）
     * @return 标类的数据
     */
    public <E> DataPager<E> getDataPager(SqlQueryMate sqlQueryMate, int pageSize, int pageIndex, Class<E> target) {
        Value<DataPager<E>> result = new Value<>();
        run(sqlQueryMate.getSqlPage(pageSize, pageIndex), CommandType.Text, dbCmd -> {
            sqlQueryMate.getParameters().forEach(parameter -> {
                dbCmd.addParameter(parameter);
            });
            result.data = dbCmd.executeToDataPager(target);
        });
        return result.data;
    }

    /**
     * 简单封装分批插入。
     *
     * @param entities
     * @param batchNum
     */
    @Override
    public void insertBatch(String userId, List<T> entities, int batchNum) throws Exception {

        if (CollectionUtils.isEmpty(entities)) {
            return;
        }
        jdbcTemplateInsertBatch(userId, entities, batchNum);
    }

    protected Class<T> getEntityClassType() {
        ParameterizedType type = (ParameterizedType) this.getClass()
                .getGenericSuperclass();
        return (Class<T>) type.getActualTypeArguments()[0];
    }

    private static List<DbTableFieldMapping> getDbTableFieldMappings(DbTableMate dbTableMate) {
        List<DbTableFieldMapping> fieldMappingList = new ArrayList();
        if (dbTableMate.columnKeyInfo != null && dbTableMate.columnKeyInfo.dbTableField.canInsert()) {
            fieldMappingList.add(dbTableMate.columnKeyInfo);
        }

        for (DbTableFieldMapping item : dbTableMate.columnInfos) {
            if (item.dbTableField.canInsert()) {
                fieldMappingList.add(item);
            }
        }
        return fieldMappingList;
    }

    private static StringBuilder buildInsertSql(DbTableMate dbTableMate, List<DbTableFieldMapping> fieldMappingList) {
        StringBuilder sql = new StringBuilder(256);
        sql.append("INSERT INTO ").append(dbTableMate.tableInfo.tableName()).append("(");
        sql.append(String.join(",", fieldMappingList.stream().map(x -> x.dbTableField.columnName()).collect(Collectors.toList())));
        sql.append(") VALUES ( ");
        sql.append(String.join(",", fieldMappingList.stream().map(x -> "?").collect(Collectors.toList())));
        sql.append(")");
        return sql;
    }

    private Object[] getInsertBatchArg(List<DbTableFieldMapping> fieldMappingList, T entity) throws IllegalAccessException {
        Object[] arr = new Object[fieldMappingList.size()];
        for (int i = 0; i < fieldMappingList.size(); i++) {
            DbTableFieldMapping field = fieldMappingList.get(i);
            Object fieldVal = field.entityField.get(entity);
            switch (field.dbTableField.dbType()) {
                case OTHER:
                    if (fieldVal instanceof Geometry) {
                        arr[i] = DbUtility.getGeometryDbValueText((Geometry) fieldVal);
                        break;
                    }
                default:
                    arr[i] = fieldVal;
            }
        }
        return arr;
    }

    /**
     * 使用 jdbcTemplate.batchUpdate
     *
     * @param entities
     * @param batchNum
     * @throws Exception
     */
    private void jdbcTemplateInsertBatch(String userId, List<T> entities, int batchNum) throws Exception {

        DbTableMate dbTableMate = Utility.getDbTableMate(getEntityClassType());
        DbUtility.checkDbTableMate(dbTableMate, 1);
        List<DbTableFieldMapping> fieldMappingList = getDbTableFieldMappings(dbTableMate);
        String sql = buildInsertSql(dbTableMate, fieldMappingList).toString();
        JdbcTemplate jdbcTemplate = DbExecute.getSqlTemplate(this.getDbExecute().getConnectionSetting());
        List<Object[]> batchArgs = new ArrayList<>();

        int len = entities.size();
        int count = (int) Math.ceil(1.0 * len / batchNum);
        for (int i = 0; i < count; i++) {
            int startIndex = batchNum * i;
            int endIndex = (i + 1) * batchNum;
            if (i == (count - 1)) {
                endIndex = len;
            }

            batchArgs.clear();
            for (T entity : entities.subList(startIndex, endIndex)) {
                insertBefore(userId, entity);
                batchArgs.add(getInsertBatchArg(fieldMappingList, entity));
            }

            jdbcTemplate.batchUpdate(sql, batchArgs);
        }
    }


    @Override
    public void insertBatch(String userId, List<T> entities) throws Exception {
        insertBatch(userId, entities, 1000);
    }

    @Override
    public void insertBatch(List<T> entities) throws Exception {
        insertBatch(getUserId(), entities);
    }

    @Override
    public void insertBatch(List<T> entities, int batchNum) throws Exception {
        insertBatch(getUserId(), entities, batchNum);
    }


}
