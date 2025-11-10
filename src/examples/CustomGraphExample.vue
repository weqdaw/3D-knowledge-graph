<template>
  <div class="custom-graph-container">
    <h2>自定义知识图谱示例</h2>
    <KnowledgeGraph
      :data-source="customDataSource"
      :node-type-config="customNodeConfig"
      :chart-config="customChartConfig"
      :on-node-click="handleCustomNodeClick"
      :on-node-right-click="handleCustomNodeRightClick"
      :initial-data="customGraphData"
      graph-title="自定义知识图谱"
      description="使用函数式数据源的知识图谱"
      search-placeholder="搜索自定义节点..."
      :show-chart="true"
    />
  </div>
</template>

<script>
import KnowledgeGraph from '../components/KnowledgeGraph.vue'

export default {
  name: 'CustomGraphExample',
  components: {
    KnowledgeGraph
  },
  data() {
    return {
      // 自定义数据源配置 - 使用函数式数据获取
      customDataSource: {
        type: 'function',
        fetch: this.fetchCustomData
      },
      // 自定义节点类型配置
      customNodeConfig: {
        types: {
          person: { name: '人员', color: '#4ecdc4' },
          organization: { name: '组织', color: '#ff6b6b' },
          project: { name: '项目', color: '#45b7d1' },
          technology: { name: '技术', color: '#ffd93d' },
          skill: { name: '技能', color: '#6c5ce7' }
        },
        defaultColor: '#999999'
      },
      // 自定义图表配置
      customChartConfig: {
        enabled: true,
        type: 'function',
        fetch: this.fetchCustomChartData,
        title: '自定义数据统计',
        nameKey: 'name',
        valueKey: 'value',
        chartColor: '#4facfe'
      },
      // 自定义图谱数据（示例）
      customGraphData: null
    }
  },
  methods: {
    // 自定义数据获取函数
    async fetchCustomData(props, query) {
      // 模拟 API 调用
      // 实际使用时，这里可以调用真实的 API
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            nodes: [
              { id: '1', name: '张三', group: 'person', description: '前端开发工程师' },
              { id: '2', name: '李四', group: 'person', description: '后端开发工程师' },
              { id: '3', name: '公司A', group: 'organization', description: '科技公司' },
              { id: '4', name: '项目X', group: 'project', description: 'Web应用项目' },
              { id: '5', name: 'Vue.js', group: 'technology', description: '前端框架' },
              { id: '6', name: 'JavaScript', group: 'skill', description: '编程语言' }
            ],
            links: [
              { source: '1', target: '3', type: '属于', details: '张三属于公司A' },
              { source: '2', target: '3', type: '属于', details: '李四属于公司A' },
              { source: '1', target: '4', type: '参与', details: '张三参与项目X' },
              { source: '2', target: '4', type: '参与', details: '李四参与项目X' },
              { source: '4', target: '5', type: '使用', details: '项目X使用Vue.js' },
              { source: '1', target: '6', type: '掌握', details: '张三掌握JavaScript' },
              { source: '2', target: '6', type: '掌握', details: '李四掌握JavaScript' }
            ],
            metadata: {
              graphTitle: '自定义知识图谱',
              description: '使用函数式数据源的知识图谱'
            }
          })
        }, 500)
      })
    },
    // 自定义图表数据获取函数
    async fetchCustomChartData(params) {
      // 模拟图表数据
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            top5WeekPoint: {
              list: [
                { name: '技能A', value: 85 },
                { name: '技能B', value: 72 },
                { name: '技能C', value: 68 },
                { name: '技能D', value: 55 },
                { name: '技能E', value: 42 }
              ],
              numberList: '85,72,68,55,42'
            }
          })
        }, 300)
      })
    },
    // 自定义节点点击处理
    handleCustomNodeClick(node) {
      console.log('自定义节点点击:', node)
      // 可以显示自定义的详情弹窗
      this.$message({
        message: `点击了节点: ${node.name}`,
        type: 'info'
      })
    },
    // 自定义节点右键处理
    handleCustomNodeRightClick(node, event) {
      console.log('自定义节点右键:', node)
      // 可以显示自定义的上下文菜单
      event.preventDefault()
      this.$message({
        message: `右键点击了节点: ${node.name}`,
        type: 'success'
      })
    }
  }
}
</script>

<style scoped>
.custom-graph-container {
  width: 100%;
  height: 100vh;
  padding: 20px;
}

.custom-graph-container h2 {
  margin-bottom: 20px;
  color: #2c3e50;
}
</style>

