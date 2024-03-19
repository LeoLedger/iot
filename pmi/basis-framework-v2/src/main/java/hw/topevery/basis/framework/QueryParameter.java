package hw.topevery.basis.framework;

import hw.topevery.framework.entity.DbCsp;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;
import java.util.List;

/**
 * 基础查询参数
 *
 * @author whw
 * @date 2020/9/4
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class QueryParameter extends DbCsp {
    public int getPageSize() {
        return pageSize;
    }

    public int getPageIndex() {
        return pageIndex;
    }
}
