package hw.topevery.basis.wapi.pmi.service;

import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.mongodb.client.gridfs.GridFSBuckets;
import com.mongodb.client.gridfs.model.GridFSFile;
import hw.topevery.basis.dal.logic.StorageFileLogic;
import hw.topevery.basis.dal.logic.StorageNodeLogic;
import hw.topevery.basis.device.dto.UploadFileDto;
import hw.topevery.basis.device.enums.CommonFileTypeEnum;
import hw.topevery.basis.device.logic.CommonFileLogic;
import hw.topevery.basis.entity.po.StorageFile;
import hw.topevery.basis.entity.po.StorageNode;
import hw.topevery.basis.wapi.pmi.config.HWProperties;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.MongoDbFactory;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FmpFileService {

    @Autowired
    private StorageFileLogic storageFileService;

    @Autowired
    private StorageNodeLogic storageNodeService;

    @Autowired
    private HWProperties hwProperties;

    @Autowired
    private GridFsTemplate gridFsTemplate;

    @Autowired
    private MongoDbFactory mongoDbFactory;

    @Autowired
    private CommonFileLogic fileLogic;


    public StorageFile getStorageFile(String fileId) {
        return storageFileService.getByFileId(fileId);
    }

    public StorageNode getStorageNode(String nodeId) {
        return storageNodeService.getByNodeId(nodeId);
    }


    public String uploadFile(MultipartFile part, String fileName, Long fileSize) throws Exception {

        return uploadFile(part.getInputStream(), part.getContentType(), fileName);
    }

    public String uploadFile(InputStream inputStream, String contentType, String fileName) throws Exception {


        StorageNode storageNode = storageNodeService.getEntityByCode(hwProperties.fmpCode);
        if (storageNode != null) {

            byte[] fileByte = getFileStreamByte(inputStream);
            StorageFile file = new StorageFile();
            file.setFileId(UUID.randomUUID().toString());
            file.setFileName(fileName);
            file.setFileExt(fileName.substring(fileName.lastIndexOf('.')));
            file.setFileSize((float) fileByte.length);
            file.setCreateTime(LocalDateTime.now());
            file.setUpdateTime(LocalDateTime.now());
            file.setNodeId(storageNode.getNodeId());
            file.setDbStatus(0);
            file.setIsReadonly(0);
            file.setFileHash(getMD5HashCode(new ByteArrayInputStream(fileByte)));

            DBObject metaData = new BasicDBObject();
            metaData.put("code", fileName);
            metaData.put("fileId", file.getFileId());
            metaData.put("_id", file.getFileHash());
            metaData.put("type", file.getFileExt());


            ObjectId mongoId = gridFsTemplate.store(new ByteArrayInputStream(fileByte), file.getFileName(), contentType, metaData);

            file.setFileObjectId(mongoId.toString());

            storageFileService.insert(file);

            return file.getFileId();
        }
        return "";
    }

    public GridFsResource getFileStream(String fileId) {
        GridFsResource gridFsResource = null;
        StorageFile sfile = getStorageFile(fileId);
        if (sfile != null) {
//            StorageNode fileNode = getStorageNode(sfile.getNodeId());
//            if (fileNode != null) {
//
//            }
            Query query = Query.query(Criteria.where("_id").is(sfile.getFileObjectId()));
            // 查询单个文件
            GridFSFile gfsFile = gridFsTemplate.findOne(query);
            if (gfsFile != null) {
                gridFsResource = new GridFsResource(gfsFile, GridFSBuckets.create(mongoDbFactory.getDb()).openDownloadStream(gfsFile.getObjectId()));
            }
        }
        return gridFsResource;
    }

    private String getMD5HashCode(InputStream fis) throws Exception {
        byte[] buffer = new byte[1024];
        MessageDigest complete = MessageDigest.getInstance("MD5");
        int numRead;
        do {
            numRead = fis.read(buffer);
            if (numRead > 0) {
                complete.update(buffer, 0, numRead);
            }
        } while (numRead != -1);

        byte[] b = complete.digest();
        StringBuilder result = new StringBuilder();
        for (byte value : b) {
            result.append(Integer.toString((value & 0xff) + 0x100, 16).substring(1));
        }
        return result.toString();
    }


    private byte[] getFileStreamByte(InputStream fis) throws IOException {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        byte[] buffer = new byte[1024];
        int len;
        while ((len = fis.read(buffer)) > -1) {
            byteArrayOutputStream.write(buffer, 0, len);
        }
        byteArrayOutputStream.flush();
        return byteArrayOutputStream.toByteArray();
    }

    public List<GridFsResource> getFileStreams(String objectId,Integer fileType) {
        List<GridFsResource> list = new ArrayList<>();
        CommonFileTypeEnum commonFileTypeEnum = CommonFileTypeEnum.getEnum(fileType);
        List<UploadFileDto> fileDto = fileLogic.getListDto(objectId, commonFileTypeEnum);
        for (UploadFileDto uploadFileDto : fileDto) {
            list.add(getFileStream(uploadFileDto.getFileId()));
        }
        return list;
    }
}
