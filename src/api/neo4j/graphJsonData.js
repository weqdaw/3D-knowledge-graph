

// 查询图谱维护列表
export function listMenuVo(query) {
    return request({
      url: '/graphJsonData/neo4jGraphJsonByClassTypeId',
      method: 'get',
      params: query
    })
  }

  export function menuInfo(id) {
    return request({
      url: '/graphJsonData/neo4jGraphJsonByClassTypeId/'+id,
      method: 'get',
    
    })
  }