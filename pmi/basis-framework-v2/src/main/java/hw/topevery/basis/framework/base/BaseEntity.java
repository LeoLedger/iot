package hw.topevery.basis.framework.base;

import hw.topevery.basis.framework.QueryParameter;
import hw.topevery.framework.annotation.DbTableField;
import hw.topevery.framework.enums.DbTypeEnum;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 基础的实体
 *
 * @author bingxin.xu
 */
public class BaseEntity implements Serializable {
    /**
     * 自增id
     */
    @DbTableField(columnName = "c_id", isKey = true, canInsert = false, dbType = DbTypeEnum.INTEGER)
    public Integer id;

    /**
     * 创建人id
     */
    @DbTableField(columnName = "c_create_id", canUpdate = false, dbType = DbTypeEnum.VARCHAR)
    public String createId;

    /**
     * 创建时间
     */
    @DbTableField(columnName = "c_create_time", canUpdate = false, dbType = DbTypeEnum.VARCHAR)
    public LocalDateTime createTime;

    /**
     * 更新人id
     */
    @DbTableField(columnName = "c_update_id", dbType = DbTypeEnum.VARCHAR)
    public String updateId;

    /**
     * 更新时间
     */
    @DbTableField(columnName = "c_update_time", dbType = DbTypeEnum.TIMESTAMP)
    public LocalDateTime updateTime;

    /**
     * 数据库状态
     */
    @DbTableField(columnName = "c_db_status", dbType = DbTypeEnum.INTEGER)
    public Boolean dbStatus = false;
}
