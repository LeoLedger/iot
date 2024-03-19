package hw.topevery.basis.wapi;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import hw.topevery.basis.device.IApprovalExtendShelfLifeDao;
import hw.topevery.basis.device.logic.EmailLogic;
import hw.topevery.basis.device.logic.approval.listener.ApprovalExtendLifeListener;
import hw.topevery.basis.device.logic.device.DeviceSimLogic;
import hw.topevery.basis.device.schedule.AlarmSchedule;
import hw.topevery.basis.device.schedule.DeviceSmartSchedule;
import hw.topevery.basis.device.schedule.RentDeviceCostSchedue;

@SpringBootTest
public class JobTests {

    @Autowired
    AlarmSchedule alarmSchedule;

    @Autowired
    EmailLogic emailLogic;

    @Autowired
    private RentDeviceCostSchedue rentDeviceCostSchedue;

    @Autowired
    private IApprovalExtendShelfLifeDao dao;

    @Autowired
    private ApprovalExtendLifeListener listener;



    @Autowired
    DeviceSimLogic logic;

    @Autowired
    DeviceSmartSchedule smartSchedule;

    @Test
    public void smartSchedule() {
        smartSchedule.getDeviceCommunicationTime();
    }


    @Test
    public void test() {
//        List<ApprovalExtendShelfLifeStatisticsDetailDto> list = dao.getDevicesByGuidId("97306dfc-1e90-11ec-aa2b-2325c4b40a58");
//        System.out.println(list);

//        JobContext jobContext = new RunnerJobContext(new Job(new JobDetails("", "", "", new ArrayList<>())));
//        logic.publishGenCostEvent();
    }

    @Test
    void try_invoke_job_api() {



//        UserSession userSession = new UserSession();
//        userSession.setCostCenterId("ab818961-0957-11ec-9886-000c29bb1339");
//
//        ApprovalExtendShelfLife entity = new ApprovalExtendShelfLife();
//        entity.setGuidId("97306dfc-1e90-11ec-aa2b-2325c4b40a58");
//        entity.setCode("TYYB20210926057");
//        entity.setPurchaseSupplierId("08a0e355-ba31-11eb-9dc0-00163e044960");
//        entity.setPurchaseSupplierName("深圳市来源电子有限公司");
//        listener.generateExtendLifeStatistics(entity,userSession);

        //alarmSchedule.contractDueToAlarm();

//        alarmSchedule.deviceDueToAlarm();

        // alarmSchedule.accreditDueToAlarm();
        //emailLogic.sendAttachmentsMail("534868767@qq.com","测试","测试","C:\\Users\\53486\\Desktop\\枚举表.xls");
//        // 一次性任务。
//        JobId id = BackgroundJob.enqueue(() -> {
//            System.out.println("调用成功。");
//        });
//
//        // 延时任务。
//        BackgroundJob.schedule(LocalDateTime.now().plusSeconds(30),() ->{
//            System.out.println("30S 后调用。");
//        });
//
//        // 依赖注入 DeviceSimLogic
//        // id = BackgroundJob.enqueue(DeviceSimLogic::syncStatus);
//
//        // 周期任务。
//        BackgroundJob.<DeviceSimLogic>scheduleRecurrently("device-sim-async-status", Cron.daily(3), s ->{
//            s.syncStatus(JobContext.Null);
//        });

        //BackgroundJob.scheduleRecurrently("contract-due-to-alarm", "0 6 16 * * ?", AlarmSchedule::contractDueToAlarm);

    }
}
