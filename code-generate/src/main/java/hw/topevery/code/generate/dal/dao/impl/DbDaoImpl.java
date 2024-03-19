package hw.topevery.code.generate.dal.dao.impl;

import hw.topevery.code.generate.dal.dao.DbDao;
import hw.topevery.code.generate.entity.po.Column;
import hw.topevery.code.generate.entity.po.Table;
import hw.topevery.framework.db.CommandType;
import hw.topevery.framework.db.DbExecute;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class DbDaoImpl implements DbDao {
    @Override
    public List<Table> getTables(DbExecute db, String schemaName) {
        String sql = "" +
                "SELECT TABLE_SCHEMA AS c_schema_name, TABLE_NAME AS c_name, CREATE_TIME AS c_create_time, TABLE_COMMENT AS c_comment\n" +
                "FROM information_schema.TABLES\n" +
                "WHERE TABLE_TYPE = 'BASE TABLE'\n" +
                "  AND TABLE_SCHEMA = :pi_table_schema;";

        List<Table> res = new ArrayList<>();
        db.run(sql, CommandType.Text, dbCmd->{
            dbCmd.addInParameter("pi_table_schema", schemaName);
            dbCmd.executeToList(res, Table.class);
        });
        return res;
    }

    @Override
    public List<Column> getColumns(DbExecute db, String schemaName, String tableName) {
        String sql = "" +
                "SELECT TABLE_SCHEMA   AS c_schema_name,\n" +
                "       TABLE_NAME     AS c_table_name,\n" +
                "       COLUMN_NAME    AS c_name,\n" +
                "       IS_NULLABLE    AS c_can_null,\n" +
                "       DATA_TYPE      AS c_data_type,\n" +
                "       COLUMN_COMMENT AS c_comment,\n" +
                "       COLUMN_KEY     AS c_key_desc,\n" +
                "       EXTRA          AS extra,\n" +
                "       column_default AS c_column_default\n" +
                "FROM information_schema.COLUMNS\n" +
                "WHERE TABLE_SCHEMA = :pi_table_schema\n" +
                "  AND TABLE_NAME = :pi_table_name\n" +
                "ORDER BY ORDINAL_POSITION ASC;";

        List<Column> res = new ArrayList<>();
        db.run(sql, CommandType.Text, dbCmd->{
            dbCmd.addInParameter("pi_table_schema", schemaName);
            dbCmd.addInParameter("pi_table_name", tableName);
            dbCmd.executeToList(res, Column.class);
        });
        return res;
    }
}
