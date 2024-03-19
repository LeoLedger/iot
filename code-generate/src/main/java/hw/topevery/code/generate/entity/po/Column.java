package hw.topevery.code.generate.entity.po;

import hw.topevery.framework.enums.DbTypeEnum;
import org.apache.commons.lang3.StringUtils;

import java.io.Serializable;

/**
 * 列
 */
public class Column implements Serializable {
    /**
     * 表所有者
     */
    public String schemaName;
    /**
     * 表名
     */
    public String tableName;
    /**
     * 列名
     */
    public String name;
    public String dataType;
    /**
     * 列的为空性。如果列允许 null，那么该列返回 yes。否则，返回 no
     */
    public String canNull;
    public String extra;

    /**
     * 列默认值
     */
    public String columnDefault;

    public String getComment() {
        return StringUtils.replace(comment, "\r\n", "\t\t").replace("\r", "\t\t").replace("\n", "\t\t");
    }

    private String comment;
    public String keyDesc;

    public DbTypeEnum getTypeEnum() {
        return DbTypeEnum.parseOf(dataType);
    }

    public boolean getIsKey() {
        return StringUtils.equalsIgnoreCase(keyDesc, "PRI");
    }

    public boolean getIsUni() {
        return StringUtils.equalsIgnoreCase(keyDesc, "UNI");
    }

    public boolean canUpdate() {
        return !StringUtils.equalsIgnoreCase(keyDesc, "PRI")
                && !StringUtils.equalsIgnoreCase(keyDesc, "UNI")
                && !StringUtils.equalsIgnoreCase(extra, "auto_increment");
    }

    public boolean canInsert() {
        return !StringUtils.equalsIgnoreCase(extra, "auto_increment");
    }
}
