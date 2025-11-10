<template>
  <KnowledgeGraph
    :data-source="courseDataSource"
    :node-type-config="courseNodeConfig"
    :chart-config="courseChartConfig"
    :on-node-right-click="handleCourseNodeRightClick"
    :on-node-detail-click="handleCourseNodeDetailClick"
    graph-title="课程知识图谱"
    :show-chart="true"
  />
</template>

<script>
import KnowledgeGraph from '../components/KnowledgeGraph.vue'

export default {
  name: 'CourseGraphExample',
  components: {
    KnowledgeGraph
  },
  data() {
    return {
      // 课程数据源配置
      courseDataSource: {
        type: 'api',
        url: 'http://localhost:8080/courseOutline/graph/:classTypeId',
        method: 'GET',
        // 参数配置：从 URL 查询参数中获取 classId
        params: {
          classTypeId: {
            key: 'classId',
            source: 'url' // 从 URL 参数获取
          }
        },
        paramSource: 'url', // 默认参数来源
        // 响应数据路径（如果数据在 response.data.data 中）
        responsePath: 'data.data'
      },
      // 课程节点类型配置
      courseNodeConfig: {
        types: {
          firstNode: { name: '一级节点', color: '#4ecdc4' },
          secondNode: { name: '二级节点', color: '#ff6b6b' },
          thirdNode: { name: '三级节点', color: '#45b7d1' },
          forthNode: { name: '四级节点', color: '#ffd93d' },
          fifthNode: { name: '五级节点', color: '#6c5ce7' }
        },
        defaultColor: '#666666'
      },
      // 课程图表配置
      courseChartConfig: {
        enabled: true,
        type: 'api',
        url: 'http://localhost:8080/neo4j/dataStatis/Top5ChartByClassTypeId/:classTypeId',
        method: 'GET',
        params: {
          classTypeId: {
            key: 'classId',
            source: 'url'
          }
        },
        responsePath: 'data',
        title: '薄弱节点排名前五',
        nameKey: 'weakPointName',
        dataKey: 'top5WeekPoint',
        chartColor: '#ff8a65'
      }
    }
  },
  methods: {
    // 课程节点右键点击处理
    handleCourseNodeRightClick(node, event) {
      console.log('课程节点右键点击:', node)
      // 如果是课程节点，跳转到详情页
      if (node.parentId != 0) {
        const targetUrl = `http://localhost:80/graph/courseLineInfo/?id=${node.id}`
        window.location.href = targetUrl
      }
    },
    // 课程节点详情点击处理
    handleCourseNodeDetailClick(node) {
      console.log('课程节点详情点击:', node)
      if (node.parentId != 0) {
        const targetUrl = `http://localhost:80/graph/courseLineInfo/?id=${node.id}`
        window.location.href = targetUrl
      }
    }
  }
}
</script>

<style scoped>
/* 可以添加自定义样式 */
</style>

