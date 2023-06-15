import request from '@/utils/request'

//  获取所有教练员列表
export function fetchList(query) {
  return request({
    url: '/singUp/list',
    method: 'get',
    params: query
  })
}
//  阅读统计方法
export function fetchPv(pv) {
  return request({
    url: '/singUp/pv',
    method: 'get',
    params: { pv }
  })
}
//  添加方法
export function createArticle(data) {
  return request({
    url: '/student/addTwo',
    method: 'post',
    data
  })
}

export function deleteArticle(data) {
  return request({
    url: '/singUp/delete',
    method: 'post',
    data
  })
}
