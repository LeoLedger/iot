package hw.topevery.basis.dal.util;

import hw.topevery.basis.dal.logic.CompanyLogic;
import hw.topevery.basis.dal.logic.SysDeptInTreeLogic;
import hw.topevery.basis.dal.logic.SysDeptLogic;
import hw.topevery.basis.dal.logic.SysMapLogic;
import hw.topevery.basis.entity.bo.DevCodeVO;
import hw.topevery.basis.entity.dto.DeptDto;
import hw.topevery.basis.entity.model.DeptTree;
import hw.topevery.basis.entity.po.SysCompany;
import hw.topevery.basis.entity.po.SysDept;
import hw.topevery.basis.entity.po.SysMap;
import hw.topevery.basis.framework.Database;
import hw.topevery.basis.framework.enums.DeptTypeEnum;
import hw.topevery.framework.util.ObjectUtil;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 部门工具类
 *
 * @Author: whw
 * @Date: 2020/2/12 10:40
 */
@Component
public class SysCompanyUtil {

    @Autowired
    SysDeptLogic sysDeptLogic;

    @Autowired
    CompanyLogic sysCompanyLogic;

    @Autowired
    SysMapLogic sysMapLogic;

    /**
     * 保存部门
     *
     * @param deptDto
     * @param curUserId
     * @return
     */
    public Boolean saveSysDept(DeptDto deptDto, String curUserId) {
        Database.pmiDbExecute.transactionScope(() -> {
            // 判断部门名称是否已经存在
            if (sysDeptLogic.countDeptByName(deptDto.deptName, deptDto.deptId) > 0) {
                throw new RuntimeException("名称已存在");
            }

            if (StringUtils.isEmpty(deptDto.deptId)) {
                deptDto.deptId = UUID.randomUUID().toString().toUpperCase();
            }

            // 这里处理一下部门表的区域类型
            if (ObjectUtils.isNotEmpty(deptDto.mapId)) {
                updateSysMap(deptDto);
            }

            // 处理部门树
            updateSysDeptTree(deptDto.deptPid);

            // 更新部门devCode
            updateDevCode(deptDto);
            // 如果部门类型为企业，就往公司表里也插入一条记录
            updateSysCompany(deptDto, curUserId);


            sysDeptLogic.saveOrUpdate(curUserId, deptDto);
        });
        return true;

    }

    /**
     * 更新部门DEV_CODE
     *
     * @param deptDto
     */
    private void updateDevCode(DeptDto deptDto) {

        // 生成DEV_CODE
        DevCodeVO codeVO = sysDeptLogic.getDevCode(deptDto.deptPid, deptDto.deptId);

        if (ObjectUtils.isNotEmpty(codeVO)) {
            // 根目录DEV_CODE相同,不进行修改
            if (ObjectUtils.isNotEmpty(deptDto.devCode)) {
                //
                if (deptDto.devCode.length() <= 3) {
                    return;
                }
                String pDevCode = deptDto.devCode.substring(0, deptDto.devCode.length() - 3);
                // 修改后的根部门 dev_code
                String pDevCode2 = codeVO.getLatestDevCode().substring(0, codeVO.getLatestDevCode().length() - 3);
                if (!pDevCode2.equals(pDevCode)) {
                    // 这种情况应该属于部门迁移,那么子部门的DEV_CODE也应该跟着变动
                    List<SysDept> deptList = sysDeptLogic.getAllChildsByDeptId(deptDto.deptId);
                    if (ObjectUtils.isNotEmpty(deptList)) {

                        deptList.forEach(item -> {
                            if (ObjectUtils.isNotEmpty(item.devCode)) {
                                // 修改前面部分
                                item.devCode = String.format("%s%s", pDevCode2, item.devCode.substring(pDevCode2.length(), item.devCode.length()));
                            } else {
                                DevCodeVO codeVO2 = sysDeptLogic.getDevCode(item.deptPid, item.deptId);
                                item.devCode = codeVO2.getLatestDevCode();
                            }
                        });

                        sysDeptLogic.updateBatch(deptList);

                    }

                    deptDto.devCode = codeVO.getLatestDevCode();


                }
            } else {
                deptDto.devCode = codeVO.getLatestDevCode();
            }
        } else {
            deptDto.devCode = "001";
        }
    }

    /**
     * 更新部门树
     *
     * @param pId
     */
    private void updateSysDeptTree(String pId) {
        if (ObjectUtils.isNotEmpty(pId)) {
        }
    }

    /**
     * 更新部门区域类型
     *
     * @param deptDto
     */
    private void updateSysMap(DeptDto deptDto) {
        SysMap sysMap = sysMapLogic.getEntityByDataId(deptDto.mapId);
        if (ObjectUtils.isNotEmpty(sysMap)) {
            deptDto.mapType = sysMap.mapType;
        }
    }

    /**
     * 企业部门生成对应的业务系统 公司信息
     *
     * @param deptDto
     * @param curUserId
     * @return
     */
    public boolean updateSysCompany(DeptDto deptDto, String curUserId) {
        if (DeptTypeEnum.COMPANY.getCode().equals(deptDto.deptType)) {
            SysCompany company = sysCompanyLogic.getEntityByDataId(deptDto.deptId);
            if (company == null) {
                company = new SysCompany();
            }
            //公司ID
            company.companyId = deptDto.deptId;
            //公司名称
            company.name = deptDto.deptName;
            //联系人
            company.contacts = deptDto.deptContracts;
            //联系方式
            company.contactsPhone = deptDto.deptContractsNum;

            sysCompanyLogic.saveOrUpdate(curUserId, company);
        }
        return true;
    }
}
