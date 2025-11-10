<template>
  <div id="app">
    <!-- 使用配置化的知识图谱组件 -->
    <KnowledgeGraph
      :data-source="dataSource"
      :node-type-config="nodeTypeConfig"
      :chart-config="chartConfig"
      :on-node-right-click="handleNodeRightClick"
      :on-node-detail-click="handleNodeDetailClick"
    />
  </div>
</template>

<script>
import KnowledgeGraph from './components/KnowledgeGraph.vue'

export default {
  name: 'App',
  components: {
    KnowledgeGraph
  },
  data() {
    return {
      // 数据源配置 - API 方式
      dataSource: {
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
        paramSource: 'url',
        // 响应数据路径
        responsePath: 'data.data'
      },
      // 节点类型配置
      nodeTypeConfig: {
        types: {
          firstNode: { name: '一级节点', color: '#4ecdc4' },
          secondNode: { name: '二级节点', color: '#ff6b6b' },
          thirdNode: { name: '三级节点', color: '#45b7d1' },
          forthNode: { name: '四级节点', color: '#ffd93d' },
          fifthNode: { name: '五级节点', color: '#6c5ce7' }
        },
        defaultColor: '#666666'
      },
      // 图表配置
      chartConfig: {
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
    // 节点右键点击处理
    handleNodeRightClick(node, event) {
      this.selectedNode = node
      if (this.selectedNode && this.selectedNode.parentId != 0) {
        const targetUrl = `http://localhost:80/graph/courseLineInfo/?id=${this.selectedNode.id}`
        window.location.href = targetUrl
      }
    },
    // 节点详情点击处理
    handleNodeDetailClick(node) {
      if (node && node.parentId != 0) {
        const targetUrl = `http://localhost:80/graph/courseLineInfo/?id=${node.id}`
        window.location.href = targetUrl
      }
    }
  }
}
</script>

<style>
#app {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  background-color: #ffffff;
}
</style>
