package hw.topevery.basis.dal.util;

import org.springframework.data.mongodb.gridfs.GridFsResource;

import java.io.*;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class ZipUtils {
    private static final int BUFFER = 1024;


    private boolean rugularZIP(String[] fromFiles, String toFile) {
        File zipFile = new File(toFile);
        byte[] buffer = new byte[BUFFER];
        int readLen = 0;
        try {
            ZipOutputStream zipOut = new ZipOutputStream(new FileOutputStream(zipFile));
            for (String file : fromFiles) {
                File fileWillZip = new File(file);
                if (fileWillZip.exists()) {
                    InputStream inputStream = new BufferedInputStream(new FileInputStream(fileWillZip));
                    String entryName = fileWillZip.getName();
                    zipOut.putNextEntry(new ZipEntry(entryName));
                    while ((readLen = inputStream.read(buffer, 0, BUFFER)) != -1) {
                        zipOut.write(buffer, 0, readLen);
                    }
                    inputStream.close();
                }
            }
            zipOut.close();
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
        return true;
    }

    public static boolean regularZIP(List<GridFsResource> list, String toFile, String pre) {
        File zipFile = new File(toFile);
        byte[] buffer = new byte[BUFFER];
        int readLen = 0;
        try {
            ZipOutputStream zipOut = new ZipOutputStream(new FileOutputStream(zipFile));
            for (GridFsResource gridFsResource : list) {
                InputStream inputStream = new BufferedInputStream(gridFsResource.getInputStream());
                String entryName = pre + gridFsResource.getFilename();
                zipOut.putNextEntry(new ZipEntry(entryName));
                while ((readLen = inputStream.read(buffer, 0, BUFFER)) != -1) {
                    zipOut.write(buffer, 0, readLen);
                }
                inputStream.close();
            }
            zipOut.close();
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
        return true;
    }


}
