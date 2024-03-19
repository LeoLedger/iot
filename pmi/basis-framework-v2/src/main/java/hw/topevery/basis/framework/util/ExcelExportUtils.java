package hw.topevery.basis.framework.util;

import cn.afterturn.easypoi.excel.ExcelExportUtil;
import cn.afterturn.easypoi.excel.ExcelImportUtil;
import cn.afterturn.easypoi.excel.entity.ExportParams;
import cn.afterturn.easypoi.excel.entity.ImportParams;
import cn.afterturn.easypoi.excel.entity.enmus.ExcelType;
import com.google.common.base.Throwables;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URLEncoder;
import java.util.List;
import java.util.Map;

/**
 * @description:
 * @author: Chris
 * @since: 2021年04月09日 14:32
 **/
@Slf4j
public class ExcelExportUtils {
    /**
     * 释放easypoi中的ThreadLocal<br/>
     * 注：excelpoi的{@link ExcelExportUtils#closeExportBigExcel()}方法存在缺陷<br/>
     * 需要在try-catch-finally中调用该方法释放ThreadLocal
     */
    public static void release() {
        try {
            // 通过反射释放ThreadLocal
//            Class clazz = ExcelBatchExportServer.class;
//            Field threadLocalField = clazz.getDeclaredField("THREAD_LOCAL");
//            threadLocalField.setAccessible(true);
//            ThreadLocal threadLocal = (ThreadLocal) threadLocalField.get(clazz);
//            threadLocal.remove();
        } catch (Exception e) {
            log.error("ThreadLocal释放失败", e);
        }
    }

    /**
     * 添加excel下载头
     *
     * @param response
     * @param filename
     */
    public static void setDispositionHeader(HttpServletResponse response, String filename) {
        response.setCharacterEncoding("UTF-8");
        response.setHeader("content-Type", "application/vnd.ms-excel");
        try {
            response.setHeader("Content-Disposition", "attachment;filename=" + URLEncoder.encode(filename, "UTF-8"));
        } catch (UnsupportedEncodingException e) {
            log.error("url encode异常", e);
        }
    }

    /**
     * 功能描述：导出Excel，包括文件名以及表名。创建表头
     *
     * @param list           导出的实体类
     * @param title          表头名称
     * @param sheetName      sheet表名
     * @param pojoClass      映射的实体类
     * @param isCreateHeader 是否创建表头
     * @param fileName
     * @param response
     * @return
     */
    public static void exportExcel(List<?> list, String title, String sheetName, Class<?> pojoClass, String fileName, boolean isCreateHeader, HttpServletResponse response) {
        ExportParams exportParams = new ExportParams(title, sheetName);
        exportParams.setCreateHeadRows(isCreateHeader);
        defaultExport(list, pojoClass, fileName, response, exportParams);
    }


    /**
     * 功能描述：导出Excel，包括文件名以及表名,不创建表头
     *
     * @param list      导出的实体类
     * @param title     表头名称
     * @param sheetName sheet表名
     * @param pojoClass 映射的实体类
     * @param fileName
     * @param response
     * @return
     */
    public static void exportExcel(List<?> list, String title, String sheetName, Class<?> pojoClass, String fileName, HttpServletResponse response) {
        defaultExport(list, pojoClass, fileName, response, new ExportParams(title, sheetName));
    }

    /**
     * 功能描述：Map 集合导出
     *
     * @param list     实体集合
     * @param fileName 导出的文件名称
     * @param response
     * @return
     */
    public static void exportExcel(List<Map<String, Object>> list, String fileName, HttpServletResponse response) {
        defaultExport(list, fileName, response);
    }

    /**
     * 功能描述：默认导出方法
     *
     * @param list         导出的实体集合
     * @param fileName     导出的文件名
     * @param pojoClass    pojo实体
     * @param exportParams ExportParams封装实体
     * @param response
     * @return
     */
    private static void defaultExport(List<?> list, Class<?> pojoClass, String fileName, HttpServletResponse response, ExportParams exportParams) {
        Workbook workbook = ExcelExportUtil.exportExcel(exportParams, pojoClass, list);
        if (workbook != null) {
            downLoadExcel(fileName, response, workbook);
        }
    }

    /**
     * 功能描述：Excel导出
     *
     * @param fileName 文件名称
     * @param response
     * @param workbook Excel对象
     * @return
     */
    private static void downLoadExcel(String fileName, HttpServletResponse response, Workbook workbook) {
        try {
            response.setCharacterEncoding("UTF-8");
            response.setHeader("content-Type", "application/vnd.ms-excel");
            response.setHeader("Content-Disposition", "attachment;filename=" + URLEncoder
                    .encode(fileName, "UTF-8"));
            workbook.write(response.getOutputStream());
        } catch (IOException e) {
            Throwables.propagateIfPossible(e);
        }
    }

    /**
     * 功能描述：默认导出方法
     *
     * @param list     导出的实体集合
     * @param fileName 导出的文件名
     * @param response
     * @return
     */
    private static void defaultExport(List<Map<String, Object>> list, String fileName, HttpServletResponse response) {
        Workbook workbook = ExcelExportUtil.exportExcel(list, ExcelType.HSSF);
        downLoadExcel(fileName, response, workbook);
    }


    /**
     * 功能描述：根据文件路径来导入Excel
     *
     * @param filePath   文件路径
     * @param titleRows  表标题的行数
     * @param headerRows 表头行数
     * @param pojoClass  Excel实体类
     * @return
     */
    public static <T> List<T> importExcel(String filePath, Integer titleRows, Integer headerRows, Class<T> pojoClass) {
        //判断文件是否存在
        if (StringUtils.isBlank(filePath)) {
            return null;
        }
        ImportParams params = new ImportParams();
        params.setTitleRows(titleRows);
        params.setHeadRows(headerRows);
        List<T> list = null;
        try {
            list = ExcelImportUtil.importExcel(new File(filePath), pojoClass, params);
        } catch (Exception e) {
            Throwables.propagateIfPossible(e);
        }
        return list;
    }

    /**
     * 功能描述：根据接收的Excel文件来导入Excel,并封装成实体类
     *
     * @param file       上传的文件
     * @param titleRows  表标题的行数
     * @param headerRows 表头行数
     * @param pojoClass  Excel实体类
     * @return
     */
    public static <T> List<T> importExcel(MultipartFile file, Integer titleRows, Integer headerRows, Class<T> pojoClass) {
        if (file == null) {
            return null;
        }
        ImportParams params = new ImportParams();
        params.setTitleRows(titleRows);
        params.setHeadRows(headerRows);
        List<T> list = null;
        try {
            list = ExcelImportUtil.importExcel(file.getInputStream(), pojoClass, params);
        } catch (Exception e) {
            Throwables.propagateIfPossible(e);
        }
        return list;
    }

    /**
     * 功能描述：下载导入模板
     *
     * @param response
     * @param path
     * @return
     */
    public static void downExportTemplate(HttpServletResponse response, String path, String fileName) throws IOException {

        InputStream inputStream = ImportExportUtils.class.getClassLoader().getResourceAsStream(path);
        if (ObjectUtils.isEmpty(inputStream)) {
            throw new RuntimeException("系统中不存在此文件，请联系管理员！");
        }
        XSSFWorkbook excel = new XSSFWorkbook(inputStream);
        OutputStream outputStream = null;
        try {
            fileName = new String(fileName.getBytes("UTF-8"), "ISO8859_1");
            response.setContentType("application/octet-stream");
            response.setCharacterEncoding("UTF-8");
            response.setHeader("Content-Disposition", "attachment;filename=" + fileName);
            outputStream = response.getOutputStream();
            excel.write(outputStream);
        } finally {
            excel.close();
            inputStream.close();
            if(outputStream != null) {
                outputStream.close();
            }
        }
    }

    public static InputStream getTemplate(String path) {
        InputStream inputStream = ImportExportUtils.class.getClassLoader().getResourceAsStream(path);
        return inputStream;
    }

    public static void createCol(XSSFRow row, XSSFSheet sheet, XSSFCellStyle cellStyle, int cols){
        XSSFCell[] firstCell = new XSSFCell[cols];
        for(int i =0;i<cols;i++){
            firstCell[i] = row.createCell(i);
            firstCell[i].setCellValue("");
            firstCell[i].setCellStyle(cellStyle);
        }
    }

    public static void writeOut(String fileName, HttpServletResponse response, XSSFWorkbook excel) throws Exception {
        OutputStream os = null;
        try{
            //解决中文名乱码问题
            fileName = new String(fileName.getBytes("UTF-8"), "ISO8859_1");
            //设置编码、输出文件格式
            response.setContentType("application/octet-stream");
            response.setCharacterEncoding("UTF-8");
            response.setHeader("Content-Disposition", "attachment;filename=" + fileName);
            os = response.getOutputStream();
            excel.write(os);
        }catch(Exception e){
            e.printStackTrace();
        }finally{
            if(excel != null) {
                excel.close();
            }
            if(os != null){
                os.close();
            }
        }
    }

}
