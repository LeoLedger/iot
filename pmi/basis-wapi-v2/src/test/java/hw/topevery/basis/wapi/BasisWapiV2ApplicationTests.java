package hw.topevery.basis.wapi;

import com.fasterxml.uuid.Generators;
import hw.topevery.basis.device.IApprovalDeviceInDeviceDao;
import hw.topevery.basis.device.IApprovalDeviceInProdDao;
import hw.topevery.basis.device.IDeviceInstallDetailsDao;
import hw.topevery.basis.device.IDeviceSmartSpreadDao;
import hw.topevery.basis.device.dto.device.imei_detail_pro;
import hw.topevery.basis.device.logic.DeviceSmartLogic;
import hw.topevery.basis.device.model.DeviceInstallDetails;
import hw.topevery.basis.device.po.DeviceSmartSpread;
import hw.topevery.basis.device.po.approval.ApprovalDeviceInDevice;
import hw.topevery.basis.framework.aop.EnableTransaction;
import hw.topevery.basis.framework.aop.ITransactionManagerAccessor;
import hw.topevery.basis.framework.cache.RedisUtil;
import hw.topevery.basis.framework.util.UUIDGenerator;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@SpringBootTest
class BasisWapiV2ApplicationTests {

//    @Autowired
//    DeviceSmartLogic logic;
//
//    @Autowired
//    IApprovalDeviceInDeviceDao dao;

//    @Autowired
//    EnableTransactionTestClass testClass;

    @Test
    @EnableTransaction
    void contextLoads() {
//        List<imei_detail_pro> list = new ArrayList<>();
//        imei_detail_pro i1 = new imei_detail_pro();
//        i1.setImei("357900080930939");
//        i1.setIpConfig("5e8ed387-d385-48df-93ee-86db1e06c6cf");
//        i1.setType("TY-ECARD3");
//        i1.setExpireDay(168);
//        list.add(i1);
//        logic.batchAuthPro(list);

//        System.out.println("开始==="+System.currentTimeMillis());
//        List<ApprovalDeviceInDevice> l = new ArrayList<>();
//        for (int i=0;i<30000;i++){
//            ApprovalDeviceInDevice t1 = new ApprovalDeviceInDevice();
//            t1.setApprovalDeviceInId(UUID.randomUUID().toString());
//            t1.setApprovalDeviceInProdId(UUID.randomUUID().toString());
//            t1.setContractId(UUID.randomUUID().toString());
//            t1.setProductId(UUID.randomUUID().toString());
//            t1.setProductCategoryId(UUID.randomUUID().toString());
//            t1.setApprovalStatus(0);
//            t1.setSimNumber(UUID.randomUUID().toString());
//            t1.setIccid(UUID.randomUUID().toString());
//
//            l.add(t1);
//        }
//        System.out.println("造数据结束==="+System.currentTimeMillis());
//        try {
//            dao.insertBatch("USER_1905132200390283", l, 30000);
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//        System.out.println("执行结束==="+System.currentTimeMillis());
        // 大概6s


        //=========乐观锁
        // int i = testClass.test();
    }

    @Component
    public static class EnableTransactionTestClass{

//        @Autowired
//        IDeviceInstallDetailsDao deviceInstallDetailsDao;
//        @Autowired
//        ITransactionManagerAccessor managerAccessor;
//
//        @EnableTransaction
//        public int test(){
//            DeviceInstallDetails entity17 = deviceInstallDetailsDao.getEntity(17);
//            DeviceInstallDetails entity18 = deviceInstallDetailsDao.getEntity(18);
//            entity17.setVin("aaabb111");
//            entity18.setVin("aaacc221");
//            DeviceInstallDetails[] arr = {entity17, entity18};
//            try {
//                deviceInstallDetailsDao.updateBatch("sys", Arrays.asList(arr));
//            } catch (Exception e) {
//                e.printStackTrace();
//                managerAccessor.getCurrent().rollback(managerAccessor.getStatus());
//            }
//
//            return 1;
//        }
    }

}
