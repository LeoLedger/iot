package hw.topevery.code.generate.dal.logic;

import com.sun.org.apache.xpath.internal.operations.Bool;
import hw.topevery.cloud.library.configuration.ConnectionSetting;
import hw.topevery.code.generate.dal.dao.DbDao;
import hw.topevery.code.generate.entity.bo.Template;
import hw.topevery.code.generate.entity.po.Column;
import hw.topevery.code.generate.entity.po.Table;
import hw.topevery.code.generate.framework.Cfg;
import hw.topevery.code.generate.framework.TemplateHelper;
import hw.topevery.framework.Utility;
import hw.topevery.framework.db.DbExecute;
import hw.topevery.framework.db.DbUtility;
import hw.topevery.framework.enums.DatabaseTypeEnum;
import hw.topevery.framework.enums.DbTypeEnum;
import lombok.SneakyThrows;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.locationtech.jts.geom.Geometry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class DbLogic {
    @Autowired
    DbDao dbDao;

    String author = "zhk"; //code-generate

    public List<Table> getTables(DbExecute db) {
        ConnectionSetting connectionSetting = db.getConnectionSetting();
        String schemaName = DbUtility.getDbSchemaName(DatabaseTypeEnum.Mysql, connectionSetting.url);

        return dbDao.getTables(db, schemaName);
    }

    @SneakyThrows
    public String codeBuild(DbExecute db, List<String> tableNames, String author) {

        if(StringUtils.isBlank(author)){
            author = "code-generate";
        }

        this.author = author;

        ConnectionSetting connectionSetting = db.getConnectionSetting();

        String schemaName = DbUtility.getDbSchemaName(DatabaseTypeEnum.Mysql, connectionSetting.url);

        List<Table> tables = dbDao.getTables(db, schemaName);
        if (tableNames != null && 0 < tableNames.size()) {
            for (int i = tables.size() - 1; 0 <= i; i--) {
                boolean isExists = false;
                Table iVal = tables.get(i);
                for (String j : tableNames) {
                    if (StringUtils.equalsIgnoreCase(iVal.name, j)) {
                        isExists = true;
                        break;
                    }
                }

                if (!isExists) {
                    tables.remove(i);
                }
            }
        }

//        Template template = TemplateHelper.getTemplate(connectionSetting.key);
        // 模板太多复制文件过多,直接自定义包名,读取一个模板岂可
        Template template = TemplateHelper.getTemplate("hwDatabase");
        String packageName = Cfg.getPackageName(connectionSetting.key);

        for (Table table : tables) {
            String className = Utility.getHumpNameStartUpper(table.name, "t_", "_");
            List<Column> columns = dbDao.getColumns(db, schemaName, table.name);

            StringBuilder fieldBodyBuilder = new StringBuilder();
            String iVal = buildEntity(template, table, className, fieldBodyBuilder, columns, packageName);
            saveCodeInPath(connectionSetting.key, className, iVal, "entity");

            fieldBodyBuilder = new StringBuilder();
            String iVal2 = buildDao(template, table, className, fieldBodyBuilder, columns, packageName);
            saveCodeInPath(connectionSetting.key, String.format("I%sDao", className), iVal2, "dao");

            fieldBodyBuilder = new StringBuilder();
            String iVal3 = buildDaoImpl(template, table, className, fieldBodyBuilder, columns, packageName);
            saveCodeInPath(connectionSetting.key, String.format("%sDao", className), iVal3, "dao.impl");

            fieldBodyBuilder = new StringBuilder();
            String iVal4 = buildLogic(template, table, className, fieldBodyBuilder, columns, packageName);
            saveCodeInPath(connectionSetting.key, String.format("%sLogic", className), iVal4, "logic");

            fieldBodyBuilder = new StringBuilder();
            String iVal5 = buildFetch(template, table, className, fieldBodyBuilder, columns, packageName);
            saveCodeInPath(connectionSetting.key, String.format("%sFetch", className), iVal5, "fetch");

//            fieldBodyBuilder = new StringBuilder();
//            String iVal6 = buildVO(template, table, className, fieldBodyBuilder, columns, packageName);
//            saveCodeInPath(connectionSetting.key, String.format("%sVO", className), iVal6, "vo");

            fieldBodyBuilder = new StringBuilder();
            String iVal6 = buildDetailDTO(template, table, className, fieldBodyBuilder, columns, packageName);
            saveCodeInPath(connectionSetting.key, String.format("%sDetailDto", className), iVal6, "dto");

            fieldBodyBuilder = new StringBuilder();
            String iVal7 = buildCreateOrUploadDTO(template, table, className, fieldBodyBuilder, columns, packageName);
            saveCodeInPath(connectionSetting.key, String.format("%sCreateOrUpdateDto", className), iVal7, "dto");

            fieldBodyBuilder = new StringBuilder();
            String iVal8 = buildController(template, table, className, fieldBodyBuilder, columns, packageName);
            saveCodeInPath(connectionSetting.key, String.format("%sController", className), iVal8, "controller");
        }

        // 打开目录
        Runtime.getRuntime().exec(String.format("cmd /c start %s", String.format("%s/generate/%s/", Cfg.getGeneratePath(), connectionSetting.key)));

        return String.format("%s%s", Cfg.getGeneratePath(), connectionSetting.key);
    }

    private String buildController(Template template, Table table, String className, StringBuilder fieldBodyBuilder, List<Column> columns, String packageName) {
        return template.controllerString
                .replace("{@:author}", author)
                .replace("{@:className}", className)
                .replace("{@:tableName}", table.name)
                .replace("{@:tableComment}", table.getComment())
                .replace("{@:date}", LocalDate.now().toString())
                .replace("{@:classContent}", fieldBodyBuilder.toString())
                .replace("{@:packageName}", packageName)
                .replace("{@:hump.className}", Utility.getHumpNameStartLower(className, "", ""));
    }

    private String buildFetch(Template template, Table table, String className, StringBuilder fieldBodyBuilder, List<Column> columns, String packageName) {
        return template.fetchString
                .replace("{@:className}", className)
                .replace("{@:author}", author)
                .replace("{@:tableComment}", table.getComment())
                .replace("{@:packageName}", packageName)
                .replace("{@:date}", LocalDate.now().toString());
    }

    private String buildCreateOrUploadDTO(Template template, Table table, String className, StringBuilder fieldBodyBuilder, List<Column> columns, String packageName) {
        for (Column j : columns) {
            if (canBuilder(j)) {
                String fieldName = Utility.getHumpNameStartLower(j.name, "c_", "_");
                String jVal = template.dtoFieldString
                        .replace("{@:columnComment}", j.getComment())
                        .replace("{@:columnName}", j.name)
                        .replace("{@:fieldClassType}", getDataClass(j))
                        .replace("{@:fieldName}", fieldName);
                fieldBodyBuilder.append(jVal);
                fieldBodyBuilder.append(System.lineSeparator());
            }
        }
        return template.createOrUpdateDtoString
                .replace("{@:author}", author)
                .replace("{@:className}", className)
                .replace("{@:tableName}", table.name)
                .replace("{@:tableComment}", table.getComment())
                .replace("{@:date}", LocalDate.now().toString())
                .replace("{@:packageName}", packageName)
                .replace("{@:classContent}", fieldBodyBuilder.toString());
    }

    private String buildDetailDTO(Template template, Table table, String className, StringBuilder fieldBodyBuilder, List<Column> columns, String packageName) {
//        for (Column j : columns) {
//            if (canBuilder(j)) {
//                String fieldName = Utility.getHumpNameStartLower(j.name, "c_", "_");
//                String jVal = template.dtoFieldString
//                        .replace("{@:columnComment}", j.getComment())
//                        .replace("{@:columnName}", j.name)
//                        .replace("{@:fieldClassType}", getDataClass(j))
//                        .replace("{@:fieldName}", fieldName);
//                fieldBodyBuilder.append(jVal);
//                fieldBodyBuilder.append(System.lineSeparator());
//            }
//        }
        return template.detailDtoString
                .replace("{@:className}", className)
                .replace("{@:author}", author)
                .replace("{@:tableName}", table.name)
                .replace("{@:tableComment}", table.getComment())
                .replace("{@:date}", LocalDate.now().toString())
                .replace("{@:packageName}", packageName)
                .replace("{@:classContent}", fieldBodyBuilder.toString());
    }

//    private String buildVO(Template template, Table table, String className, StringBuilder fieldBodyBuilder, List<Column> columns, String packageName) {
//        for (Column j : columns) {
//            if (canBuilder(j)) {
//                String fieldName = Utility.getHumpNameStartLower(j.name, "c_", "_");
//                String jVal = template.voFieldString
//                        .replace("{@:columnComment}", j.getComment())
//                        .replace("{@:columnName}", j.name)
//                        .replace("{@:fieldClassType}", getDataClass(j))
//                        .replace("{@:fieldName}", fieldName);
//                fieldBodyBuilder.append(jVal);
//                fieldBodyBuilder.append(System.lineSeparator());
//            }
//        }
//        return template.voString
//                .replace("{@:className}", className)
//                .replace("{@:tableName}", table.name)
//                .replace("{@:tableComment}", table.getComment())
//                .replace("{@:date}", LocalDate.now().toString())
//                .replace("{@:packageName}", packageName)
//                .replace("{@:classContent}", fieldBodyBuilder.toString());
//
//    }

    private String buildLogic(Template template, Table table, String className, StringBuilder fieldBodyBuilder, List<Column> columns, String packageName) {
        String uniMethod = null;
        String uniKeyValue = null;
        String entityKeyName = "?";
        {
            Column uniColumn = null;
            for (Column column : columns) {
                if (column.name.equalsIgnoreCase("c_id")) {
                    entityKeyName = getDataClass(column);
                }

                if (column.getIsUni()) {
                    uniColumn = column;
                    break;
                }
            }
            if (uniColumn != null) {
                String uniMethodTemplate = "public {@:className} getEntityByDataId(String value){ return {@:hump.className}Dao.getEntityByDataId(value); }";
                String uniKeyValueTemplate = String.format("if (ObjectUtils.isEmpty(dto.get%s())) {entity.%s = UUID.randomUUID().toString().toUpperCase();}",
                        Utility.getHumpNameStartUpper(uniColumn.name, "c_", "_"), Utility.getHumpNameStartLower(uniColumn.name, "c_", "_"));

                uniMethod = uniMethodTemplate;
                uniKeyValue = uniKeyValueTemplate;
            }
        }
        return template.logicString
                .replace("{@:method.getEntityByDataId}", uniMethod == null ? "" : uniMethod)
                .replace("{@:author}", author)
                .replace("{@:uniqueKeyValue}", uniKeyValue == null ? "" : uniKeyValue)
                .replace("{@:className}", className)
                .replace("{@:tableComment}", table.getComment())
                .replace("{@:date}", LocalDate.now().toString())
                .replace("{@:entityKeyName}", entityKeyName)
                .replace("{@:packageName}", packageName)
                .replace("{@:hump.className}", Utility.getHumpNameStartLower(className, "", ""));
    }

    private String buildDaoImpl(Template template, Table table, String className, StringBuilder fieldBodyBuilder, List<Column> columns, String packageName) {
        String uniMethod = null;
        String entityKeyName = "?";
        {
            Column uniColumn = null;
            for (Column column : columns) {

                if (column.name.equalsIgnoreCase("c_id")) {
                    entityKeyName = getDataClass(column);
                }

                if (column.getIsUni()) {
                    uniColumn = column;
                    break;
                }
            }
            String uniMethodTemplate = "@Override\n" +
                    "public {@:className} getEntityByDataId(String value) { return getEntityByColumnEqValue(new KeyValue<>(\"{@:uniColumnName}\", value)); }";
            if (uniColumn != null) {
                uniMethod = StringUtils.replace(uniMethodTemplate, "{@:uniColumnName}", uniColumn.name);
            }
        }
        StringBuilder tableBuilder = new StringBuilder();

        String[] tableSplit = table.name.split("_");
        for (int i = 0; i < tableSplit.length; i++) {
            tableBuilder.append(tableSplit[i].substring(0, 1));
        }


        return template.daoImplString
                .replace("{@:method.getEntityByDataId}", uniMethod == null ? "" : uniMethod)
                .replace("{@:author}", author)
                .replace("{@:tableComment}", table.getComment())
                .replace("{@:tableName}", table.name)
                .replace("{@:tableNameAcronym}", tableBuilder.toString())
                .replace("{@:date}", LocalDate.now().toString())
                .replace("{@:packageName}", packageName)
                .replace("{@:entityKeyName}", entityKeyName)
                .replace("{@:className}", className);
    }

    private String buildDao(Template template, Table table, String className, StringBuilder fieldBodyBuilder, List<Column> columns, String packageName) {
        String uniMethod = null;
        String entityKeyName = "?";
        {
            Column uniColumn = null;
            for (Column column : columns) {
                if (column.name.equalsIgnoreCase("c_id")) {
                    entityKeyName = getDataClass(column);
                }

                if (column.getIsUni()) {
                    uniColumn = column;
                    break;
                }
            }
            String uniMethodTemplate = "{@:className} getEntityByDataId(String value);";
            if (uniColumn != null) {
                uniMethod = uniMethodTemplate;
            }
        }

        return template.daoString.replace("{@:method.getEntityByDataId}", uniMethod == null ? "" : uniMethod)
                .replace("{@:author}", author)
                .replace("{@:tableComment}", table.getComment())
                .replace("{@:date}", LocalDate.now().toString())
                .replace("{@:packageName}", packageName)
                .replace("{@:className}", className)
                .replace("{@:entityKeyName}", entityKeyName)
                .replace("{@:hump.className}", Utility.getHumpNameStartLower(className, "", ""));
    }

    private String buildEntity(Template template, Table table, String className, StringBuilder fieldBodyBuilder, List<Column> columns, String packageName) {

        boolean implementIHaveGuid = false;

        for (Column j : columns) {
            if (canBuilder(j)) {
                String fieldName = Utility.getHumpNameStartLower(j.name, "c_", "_");
                String jVal = template.entityFieldString.replace("{@:columnComment}", j.getComment())
                        .replace("{@:columnDataType}", getTypeName(j))
                        .replace("{@:author}", author)
//                        .replace("{@:columnIsKey}", j.getIsKey() ? "true" : "false")
//                        .replace("{@:columnCanUpd}", j.canUpdate() ? "true" : "false")
//                        .replace("{@:columnCanIns}", j.canInsert() ? "true" : "false")
                        .replace("{@:columnName}", j.name)
                        .replace("{@:fieldClassType}", getDataClass(j))
                        .replace("{@:defaultValue}", getDefaultValue(j.getTypeEnum(), j.columnDefault))
                        .replace("{@:fieldName}", fieldName);
                fieldBodyBuilder.append(jVal);
                fieldBodyBuilder.append(System.lineSeparator());

                if (fieldName.equalsIgnoreCase("guidId")) {
                    implementIHaveGuid = true;
                }
            }
        }

        return template.entityString
                .replace("{@:implements}", implementIHaveGuid ? "implements IHaveGuid" : "")
                .replace("{@:author}", author)
                .replace("{@:className}", className)
                .replace("{@:tableName}", table.name)
                .replace("{@:tableComment}", table.getComment())
                .replace("{@:date}", LocalDate.now().toString())
                .replace("{@:packageName}", packageName)
                .replace("{@:classContent}", fieldBodyBuilder.toString());
    }

    private String getTypeName(Column column) {
        Class<?> dataClass = column.getTypeEnum().getDataClass();
        if (dataClass != null) {
            return column.getTypeEnum().name();
        } else {
            switch (column.dataType.toLowerCase()) {
                case "geometry":
                    return DbTypeEnum.OTHER.name();
                default:
                    return DbTypeEnum.NULL.name();
            }
        }
    }

    /**
     * 默认值
     *
     * @param dataType      数据类型
     * @param columnDefault
     * @return
     */
    private String getDefaultValue(DbTypeEnum dataType, String columnDefault) {
        StringBuffer strBuilder = new StringBuffer();
        if (ObjectUtils.isNotEmpty(columnDefault)) {
            // 需要加单引号的类型
            if (
                    dataType.getDataClass() == String.class ||
                            dataType.getDataClass() == Character.class ||
                            dataType.getDataClass() == java.util.UUID.class ||
                            dataType.getDataClass() == LocalDate.class ||
                            dataType.getDataClass() == LocalTime.class ||
                            dataType.getDataClass() == LocalDateTime.class
            ) {
                strBuilder.append(String.format(" = '%s'", columnDefault));
            } else {
                strBuilder.append(String.format(" = %s ", columnDefault));
            }
        }

        return strBuilder.toString();
    }


    private void saveCodeInPath(String schemaName, String className, String iVal, String modelName) throws IOException {
        File file = new File(String.format("%s/generate/%s/%s/", Cfg.getGeneratePath(), schemaName, modelName));

        if (modelName.contains(".")) {
            String[] folderArr = modelName.split("\\.");
            file = new File(String.format("%s/generate/%s/%s/%s/", Cfg.getGeneratePath(), schemaName, folderArr[0], folderArr[1]));
        }

        if (!file.exists()) {
            file.mkdirs();
        }

        String filePath = file.getPath();
        File source = new File(String.format("%s/%s.java", filePath, className));
        if (!source.exists()) {
            source.createNewFile();
        }
        FileCopyUtils.copy(iVal.getBytes(), source);
    }


    @SneakyThrows
    private static String getDataClass(Column column) {
        Class<?> dataClass = column.getTypeEnum().getDataClass();
        if (dataClass != null) {
            return dataClass.getSimpleName();
        } else {
            switch (column.dataType.toLowerCase()) {
                case "geometry":
                    return Geometry.class.getSimpleName();
                default:
                    throw new Exception(String.format("数据库【%s】表【%s】列【%s】数据类型【%s】没有对应的java类型错误。",
                            column.schemaName, column.tableName, column.name, column.dataType));
            }
        }
    }

    public static final String[] notBuildColumn = new String[]{"c_id", "c_create_time", "c_create_id", "c_update_time", "c_update_id", "c_db_status"};

    private static boolean canBuilder(Column column) {
        for (String i : notBuildColumn) {
            if (StringUtils.equalsIgnoreCase(column.name, i)) {
                return false;
            }
        }
        return true;
    }
}
