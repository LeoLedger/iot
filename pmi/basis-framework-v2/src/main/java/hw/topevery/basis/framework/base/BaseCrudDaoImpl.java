package hw.topevery.basis.framework.base;

import com.tencentcloudapi.cms.v20190321.models.User;
import hw.topevery.basis.framework.Database;
import hw.topevery.basis.framework.QueryParameter;
import hw.topevery.basis.framework.UserSession;
import hw.topevery.basis.framework.base.concurrency.ConcurrencyException;
import hw.topevery.basis.framework.base.concurrency.IHasConcurrencyToken;
import hw.topevery.basis.framework.util.UUIDGenerator;
import hw.topevery.cloud.library.configuration.ConnectionSetting;
import hw.topevery.framework.Utility;
import hw.topevery.framework.db.*;
import hw.topevery.framework.db.base.BaseEntityDaoImpl;
import hw.topevery.framework.db.entity.*;
import hw.topevery.framework.db.enums.ScriptConditionEnum;
import hw.topevery.framework.entity.DbCsp;
import hw.topevery.framework.entity.DbTableFieldMapping;
import hw.topevery.framework.entity.DbTableMate;
import hw.topevery.framework.entity.Value;
import hw.topevery.framework.enums.DatabaseTypeEnum;
import lombok.SneakyThrows;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.locationtech.jts.geom.Geometry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.io.Serializable;
import java.lang.reflect.ParameterizedType;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

public abstract class BaseCrudDaoImpl<TEntity, TGetListOutputDto extends Serializable, TKey extends Serializable, TGetListInput extends QueryParameter>
        extends BaseEntityDaoImpl<TEntity, TKey>
        implements BaseCrudDao<TEntity, TGetListOutputDto, TKey, TGetListInput> {

    @Autowired
    private UUIDGenerator uuidGenerator;

    // region insertBatch

    /**
     * 简单封装分批插入。
     *
     * @param entities
     * @param batchNum
     */
    @Override
    public void insertBatch(String userId, List<TEntity> entities, int batchNum) throws Exception {

        if (CollectionUtils.isEmpty(entities)) {
            return;
        }
        jdbcTemplateInsertBatch(userId, entities, batchNum);
    }

    /**
     * 使用 jdbcTemplate.batchUpdate
     *
     * @param entities
     * @param batchNum
     * @throws Exception
     */
    private void jdbcTemplateInsertBatch(String userId, List<TEntity> entities, int batchNum) throws Exception {

        DbTableMate dbTableMate = Utility.getDbTableMate(getEntityClassType());
        DbUtility.checkDbTableMate(dbTableMate, 1);
        List<DbTableFieldMapping> fieldMappingList = getDbTableFieldMappings(dbTableMate, true);
        String sql = buildInsertSql(dbTableMate, fieldMappingList);
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
            for (TEntity entity : entities.subList(startIndex, endIndex)) {
                insertBefore(userId, entity);
                batchArgs.add(getBatchArgs(fieldMappingList, entity));
            }

            jdbcTemplate.batchUpdate(sql, batchArgs);
        }
    }

    /**
     * 简单按 数量分批插入
     *
     * @param entities
     * @param batchNum
     */
    private void simpleInsertBatch(List<TEntity> entities, int batchNum) {
        int len = entities.size();
        int count = (int) Math.ceil(1.0 * len / batchNum);
        for (int i = 0; i < count; i++) {
            int startIndex = batchNum * i;
            int endIndex = (i + 1) * batchNum;
            if (i == (count - 1)) {
                endIndex = len;
            }
            insert(entities.subList(startIndex, endIndex));
        }
    }

    @Override
    public void insertBatch(String userId, List<TEntity> entities) throws Exception {
        insertBatch(userId, entities, entities.size());
    }

    @Override
    public void insertBatch(List<TEntity> entities) throws Exception {
        insertBatch(getUserId(), entities);
    }

    @Override
    public void insertBatch(List<TEntity> entities, int batchNum) throws Exception {
        insertBatch(getUserId(), entities, batchNum);
    }


    // endregion

    // region updateBatch

    @Override
    public void updateBatch(List<TEntity> entities) throws Exception {
        updateBatch(getUserId(), entities);
    }

    @Override
    public void updateBatch(List<TEntity> entities, int batchNum) throws Exception {
        updateBatch(getUserId(), entities, batchNum);
    }

    @Override
    public void updateBatch(String userId, List<TEntity> entities) throws Exception {
        updateBatch(userId, entities, entities.size());
    }

    @Override
    public void updateBatch(String userId, List<TEntity> entities, int batchNum) throws Exception {
        DbTableMate dbTableMate = Utility.getDbTableMate(getEntityClassType());
        DbUtility.checkDbTableMate(dbTableMate, 2);
        List<DbTableFieldMapping> fieldMappingList = getDbTableFieldMappings(dbTableMate, false);
        String sql = buildUpdateSql(dbTableMate, fieldMappingList);

        Optional<DbTableFieldMapping> concurrencyTokenField = dbTableMate.columnInfos.stream()
                .filter(x -> x.entityField.getName().equalsIgnoreCase(IHasConcurrencyToken.FieldName))
                .findFirst();

        if(concurrencyTokenField.isPresent())
        {
            sql = applyConcurrencyFilter(sql, concurrencyTokenField.get()); // 应用 过滤
        }

        fieldMappingList.add(dbTableMate.columnKeyInfo);

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
            List<TEntity> subList = entities.subList(startIndex, endIndex);
            for (TEntity entity : subList) {
                updateBefore(userId, entity);

                String oldToken = setNewConcurrencyToken(entity); // 设置新token.
                List<Object> args = new ArrayList<>(Arrays.asList(getBatchArgs(fieldMappingList, entity)));
                if(concurrencyTokenField.isPresent()){
                    args.add(oldToken);
                }
                batchArgs.add(args.toArray());
            }

            int[] affectRow = jdbcTemplate.batchUpdate(sql, batchArgs);
            if(Arrays.stream(affectRow).sum() < subList.size()){
                ThrowConcurrencyException();
            }
        }
    }

    // endregion

    @Override
    public void beginTransaction(Runnable action) {
        getDbExecute().transactionScope(action);
    }

    @Override
    public DataPager<TGetListOutputDto> getDataPager(TGetListInput input) {
        // SqlQueryMate queryMate = DbScriptHelper.getSelectSqlMate(getEntityClassType());
        SqlQueryMate queryMate = createDataPagerQueryMate(input);
        Value<DataPager<TGetListOutputDto>> res = new Value<>();
        SqlQueryMate finalQueryMate = queryMate;
        queryMate.getSqlPage(input.pageSize, input.pageIndex - 1);
        run(queryMate.getSqlPage(input.pageSize, input.pageIndex - 1), CommandType.Text, cmd -> {
            finalQueryMate.getParameters().forEach(cmd::addParameter);
            res.data = cmd.executeToDataPager(getGetListOutputDtoType());
        });
        return res.data;
    }

    @Override
    public DataPager<TEntity> getList(TGetListInput input) {
        SqlQueryMate queryMate = createGetListQueryMate(input);
        Value<DataPager<TEntity>> res = new Value<>();
        SqlQueryMate finalQueryMate = queryMate;
        run(queryMate.getSqlPage(input.pageSize, input.pageIndex - 1), CommandType.Text, cmd -> {
            finalQueryMate.getParameters().forEach(cmd::addParameter);
            res.data = cmd.executeToDataPager(getEntityClassType());
        });
        return res.data;
    }

    protected SqlQueryMate createGetListQueryMate(TGetListInput input) {
        return createQueryMate(input);
    }

    protected SqlQueryMate createDataPagerQueryMate(TGetListInput input) {
        return createQueryMate(input);
    }

    protected SqlQueryMate createQueryMate(TGetListInput input) {
        SqlQueryMate queryMate = DbScriptHelper.getSelectSqlMate(getEntityClassType());
        Class<?> entityClazz = getEntityClassType();
        if (BaseEntity.class.isAssignableFrom(entityClazz)) {
            queryMate.where(true, "c_db_status", ScriptConditionEnum.Eq, 0);
        }

        UserSession session = UserSession.getInstance();
        if (IHasCostCenterId.class.isAssignableFrom(entityClazz) && !session.isAdmin()
            && session.isEnableDataFilter()) {
            queryMate.where(true, IHasCostCenterId.DEFAULT_COLUMN_NAME, ScriptConditionEnum.Eq,
                session.getCostCenterId());
        }

        return queryMate;
    }

    protected Class<TEntity> getEntityClassType() {
        ParameterizedType type = (ParameterizedType) this.getClass()
                .getGenericSuperclass();
        return (Class<TEntity>) type.getActualTypeArguments()[0];
    }

    protected Class<TGetListOutputDto> getGetListOutputDtoType() {
        ParameterizedType type = (ParameterizedType) this.getClass()
                .getGenericSuperclass();
        return (Class<TGetListOutputDto>) type.getActualTypeArguments()[1];
    }

    @Override
    public DbExecute getDbExecute() {
        return Database.pmiDbExecute;
    }

    @SneakyThrows
    @Override
    public <P extends DbCsp> List<TEntity> getSearch(P p) {
        throw new Exception("未实现的方法");
    }

    @Override
    public void delete(TKey id) {
        UserSession userSession = UserSession.getInstance();
        super.delete(userSession.getUserId(), id);
    }

    @Override
    public void deleteByGuid(String guid) {
        Class<?> entityClazz = getEntityClassType();
        if (!IHaveGuid.class.isAssignableFrom(entityClazz)) {
            throw new RuntimeException("类型未实现IHaveGuid接口：" + entityClazz.getSimpleName());
        }

        TEntity entity = getEntityByGuid(UUID.fromString(guid));
        if (entity == null) {
            return;
        }
        UserSession session = UserSession.getInstance();
        this.setDeleteField(session.getUserId(), entity);
        this.update(session.getUserId(), entity);
//        // 物理删除。
//        DbTableMate dbTableMate = Utility.getDbTableMate(entityClazz);
//        SqlDeleteMate deleteMate = DbScriptHelper.getDeleteSqlMate(dbTableMate.tableInfo.tableName());
//        deleteMate.where(true, "c_guid_id", ScriptConditionEnum.Eq, guid);
//        run(deleteMate.getSql(), CommandType.Text, cmd -> {
//            cmd.executeNonQuery();
//        });
    }

    @Transactional(isolation = Isolation.READ_UNCOMMITTED)
    @Override
    public TEntity getEntityByGuid(UUID id) {
        Class<TEntity> entityClazz = getEntityClassType();
        if (!IHaveGuid.class.isAssignableFrom(entityClazz)) {
            throw new RuntimeException("类型未实现IHaveGuid接口：" + entityClazz.getSimpleName());
        }

        SqlQueryMate queryMate = DbScriptHelper.getSelectSqlMate(entityClazz);
        queryMate.where(true, "c_guid_id", ScriptConditionEnum.Eq, id.toString())
                .where(true, "c_db_status", ScriptConditionEnum.Eq, 0);

        Value<TEntity> res = new Value<>();
        run(queryMate.getSql(), CommandType.Text, cmd -> {
            queryMate.getParameters().forEach(cmd::addParameter);
            res.data = cmd.executeToEntity(entityClazz);
        });

        return res.data;
    }

    @Override
    public TEntity updateByGuid(TEntity entity) {
        if (!IHaveGuid.class.isAssignableFrom(getEntityClassType())) {
            throw new RuntimeException("类型未实现IHaveGuid接口：" + getEntityClassType().getSimpleName());
        }

        IHaveGuid haveGuidEntity = (IHaveGuid) entity;
        SqlUpdateMate updateMate = DbScriptHelper.getUpdateSqlMate(entity, false);
        updateMate.where(true, "c_guid_id", ScriptConditionEnum.Eq, haveGuidEntity.getGuidId());

        run(updateMate.getSql(), CommandType.Text, cmd -> {
            updateMate.getParameters().forEach(cmd::addParameter);
            cmd.executeNonQuery();
        });

        return entity;
    }

    protected SqlQueryMate createDetailDtoQueryMate(String keyColumnName, Object keyVal) {
        SqlQueryMate queryMate = DbScriptHelper.getSelectSqlMate(getEntityClassType());
        queryMate.where(true, keyColumnName, ScriptConditionEnum.Eq, keyVal)
                .where(true, "c_db_status", ScriptConditionEnum.Eq, 0);

        Class<?> entityClazz = getEntityClassType();
        UserSession session = UserSession.getInstance();
        if (IHasCostCenterId.class.isAssignableFrom(entityClazz) && !session.isAdmin()
            && session.isEnableDataFilter()) {
            queryMate.where(true, IHasCostCenterId.DEFAULT_COLUMN_NAME, ScriptConditionEnum.Eq,
                session.getCostCenterId());
        }

        return queryMate;
    }

    @Override
    public <TDetailDto> TDetailDto getDetailDtoById(TKey id, Class<TDetailDto> clazz) {
        return executeQueryDetailDto("c_id", id, clazz);
    }

    @Override
    public <TDetailDto> TDetailDto getDetailDtoByGuid(UUID id, Class<TDetailDto> clazz) {
        return executeQueryDetailDto("c_guid_id", id.toString(), clazz);
    }

    protected <TDetailDto> TDetailDto executeQueryDetailDto(String keyColumnName, Object keyVal, Class<TDetailDto> clazz) {
        SqlQueryMate queryMate = createDetailDtoQueryMate(keyColumnName, keyVal);
        Value<TDetailDto> res = new Value<>();
        run(queryMate.getSql(), CommandType.Text, cmd -> {
            queryMate.getParameters().forEach(cmd::addParameter);
            res.data = cmd.executeToEntity(clazz);
        });

        return res.data;
    }

    @Override
    public void insert(String userId, TEntity... vals) {
        if (vals == null || vals.length == 0) return;
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

    @Override
    public void update(String userId, TEntity... vals) {
        if (vals == null || vals.length == 0) return;
        if (vals.length > 10) {
            try {
                this.updateBatch(userId, Arrays.asList(vals));
            } catch (Exception e) {
                throw new RuntimeException(e.getMessage(), e);
            }
            return;
        }

        for (TEntity entity : vals) {
            this.updateBefore(userId, entity);
            this.updateInner(entity);
        }

        this.removeCacheData();
    }

    private void updateInner(TEntity entity){
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

    protected String setNewConcurrencyToken(TEntity entity){
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

    protected String applyConcurrencyFilter(String sql, DbTableFieldMapping field){
        if(IHasConcurrencyToken.class.isAssignableFrom(getEntityClassType())){
            sql += String.format(" and %s=?", field.dbTableField.columnName());
        }
        return sql;
    }

    protected void ThrowConcurrencyException() throws ConcurrencyException {
        throw new ConcurrencyException("数据库操作预计影响1行，但实际影响0行。自从实体被加载后，数据可能已经被修改或删除。这个异常是在乐观的并发性检查中抛出的。");
    }

    @Override
    public void setDeleteField(String s, TEntity entity) {
        if (entity instanceof BaseEntity) {
            BaseEntity o = (BaseEntity) entity;
            o.updateId = s;
            o.updateTime = LocalDateTime.now();
            o.dbStatus = true;
        }
    }

    @Override
    public void updateBefore(String userId, TEntity val) {
        if (val instanceof BaseEntity) {
            BaseEntity entity = (BaseEntity) val;
            entity.updateTime = LocalDateTime.now();
            entity.updateId = userId;
        }
        super.updateBefore(userId, val);
    }

    /**
     * 新增自动填充字段
     *
     * @param val 要插入的数据
     */
    @Override
    public void insertBefore(String userId, TEntity val) {
        if (val instanceof BaseEntity) {
            BaseEntity entity = (BaseEntity) val;
            entity.createTime = LocalDateTime.now();
            entity.updateTime = LocalDateTime.now();
            if (StringUtils.isBlank(entity.createId)) {
                entity.createId = userId;
            }
            if (StringUtils.isBlank(entity.updateId)) {
                entity.updateId = userId;
            }
            entity.dbStatus = false;
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

    /**
     * 包装外层查询
     *
     * @param innerQuery 内层查询对象
     * @param aliaName   外层查询别名
     * @return
     */
    public static SqlQueryMate packingOuterLayerQuery(SqlQueryMate innerQuery, String aliaName) {
        String innerQuerySql = innerQuery.getSql();
        innerQuerySql = innerQuerySql.substring(0, innerQuerySql.length() - 1);
        SqlQueryMate outerQuerySql = new SqlQueryMate(String.format("(%s) as %s", innerQuerySql, aliaName));
        outerQuerySql.getParameters().addAll(innerQuery.getParameters());
        return outerQuerySql;
    }

    /**
     * 包装外层查询
     *
     * @param innerQuery 内层查询对象
     * @return
     */
    public static SqlQueryMate packingOuterLayerQuery(SqlQueryMate innerQuery) {
        return packingOuterLayerQuery(innerQuery, "p");
    }

    // region helper

    private static List<DbTableFieldMapping> getDbTableFieldMappings(DbTableMate dbTableMate, boolean isInsert) {
        List<DbTableFieldMapping> fieldMappingList = new ArrayList();
        if (isInsert && dbTableMate.columnKeyInfo != null && dbTableMate.columnKeyInfo.dbTableField.canInsert()) {
            fieldMappingList.add(dbTableMate.columnKeyInfo);
        }

        for (DbTableFieldMapping item : dbTableMate.columnInfos) {
            if (isInsert && item.dbTableField.canInsert()) {
                fieldMappingList.add(item);
            } else if(item.dbTableField.canUpdate()){
                fieldMappingList.add(item);
            }
        }
        return fieldMappingList;
    }

    private Object[] getBatchArgs(List<DbTableFieldMapping> fieldMappingList, TEntity entity) throws IllegalAccessException {
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

    private static String buildInsertSql(DbTableMate dbTableMate, List<DbTableFieldMapping> fieldMappingList) {
        StringBuilder sql = new StringBuilder(256);
        sql.append("INSERT INTO ").append(dbTableMate.tableInfo.tableName()).append("(");
        sql.append(String.join(",", fieldMappingList.stream().map(x -> x.dbTableField.columnName()).collect(Collectors.toList())));
        sql.append(") VALUES ( ");
        sql.append(String.join(",", fieldMappingList.stream().map(x -> "?").collect(Collectors.toList())));
        sql.append(")");
        return sql.toString();
    }

    private static String buildUpdateSql(DbTableMate dbTableMate, List<DbTableFieldMapping> fieldMappingList) {
        StringBuilder sql = new StringBuilder(256);
        sql.append("UPDATE ").append(dbTableMate.tableInfo.tableName()).append(" SET ");
        for (int i = 0; i < fieldMappingList.size(); i++) {
            DbTableFieldMapping item = fieldMappingList.get(i);
            sql.append(item.dbTableField.columnName() + "=?");
            if(i < fieldMappingList.size() - 1){
                sql.append(",");
            }
        }

        sql.append(String.format(" WHERE %s=?", dbTableMate.columnKeyInfo.dbTableField.columnName()));
        return sql.toString();
    }

    // endregion
}
