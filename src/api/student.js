import request from '@/utils/request'

//  获取所有教练员列表
export function fetchList(query) {
  return request({
    url: '/student/list',
    method: 'get',
    params: query
  })
}
//  阅读统计方法
export function fetchPv(pv) {
  return request({
    url: '/student/pv',
    method: 'get',
    params: { pv }
  })
}
//  添加教练方法
export function createArticle(data) {
  return request({
    url: '/student/addTwo',
    method: 'post',
    data
  })
}
export function updateArticle(data) {
  return request({
    url: '/student/upDate',
    method: 'post',
    data
  })
}
export function deleteArticle(data) {
  return request({
    url: '/student/delete',
    method: 'post',
    data: {
      id: data
    }
  })
}
