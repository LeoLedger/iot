/** 问卷调查接口 */
import request from '@/utils/request'
import { commonExport } from '@/utils'

// 问卷调查导出
export function queryQuestionnaireExport(params) {
  commonExport(params, '/api/Questionnaire/Export')
}

// 问题选项列表
export function getQuestionnaireOption(params) {
  return request({
    url: '/api/QuestionnaireOption',
    method: 'get',
    params
  })
}

// 新增/编辑问题选项列表
export function postQuestionnaireOption(data) {
  return request({
    url: '/api/QuestionnaireOption',
    method: 'post',
    data
  })
}

// 删除问题选项列表
export function deleteQuestionnaireOption(id) {
  return request({
    url: '/api/QuestionnaireOption/' + id,
    method: 'delete'
  })
}

// 问题选项详情
export function getQuestionnaireOptionDetails(id) {
  return request({
    url: '/api/QuestionnaireOption/?configId=' + id,
    method: 'get'
  })
}

// 问卷调查列表
export function getQuestionnaireList(params) {
  return request({
    url: '/api/Questionnaire',
    method: 'get',
    params
  })
}

// 问卷调查详情
export function getQuestionnaireDetails(id) {
  return request({
    url: '/api/Questionnaire/' + id,
    method: 'get'
  })
}

// 问卷调查列表
export function getQuestionnaireConfigure(params) {
  return request({
    url: '/api/QuestionnaireConfigure',
    method: 'get',
    params
  })
}

// 新增或者编辑问卷调查规则配置
export function postQuestionnaireConfigure(data) {
  return request({
    url: '/api/QuestionnaireConfigure',
    method: 'post',
    data
  })
}

// 反馈规则配置
export function deleteQuestionnaireConfigure(id) {
  return request({
    url: '/api/QuestionnaireConfigure/' + id,
    method: 'delete'
  })
}
