package hw.topevery.code.generate.entity.po;

import hw.topevery.framework.Utility;
import org.apache.commons.lang3.StringUtils;

import java.io.Serializable;
import java.time.LocalDateTime;

public class Table implements Serializable {
    public String schemaName;
    public String name;
    public LocalDateTime createTime;
    private String comment;

    public String getComment() {
        return StringUtils.replace(comment, "\r\n", "\t\t").replace("\r", "\t\t").replace("\n", "\t\t");
    }
}
