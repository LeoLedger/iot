package hw.topevery.code.generate.dal.dao;

import hw.topevery.code.generate.entity.po.Column;
import hw.topevery.code.generate.entity.po.Table;
import hw.topevery.framework.db.DbExecute;

import java.util.List;

public interface DbDao {
    List<Table> getTables(DbExecute db, String schemaName);

    List<Column> getColumns(DbExecute db, String schemaName, String tableName);
}
