<template>
  <KnowledgeGraph
    :data-source="genericDataSource"
    :node-type-config="genericNodeConfig"
    :chart-config="genericChartConfig"
    :on-node-click="handleNodeClick"
    :on-node-right-click="handleNodeRightClick"
    graph-title="通用知识图谱"
    description="这是一个通用的知识图谱示例"
    :show-chart="false"
  />
</template>

<script>
import KnowledgeGraph from '../components/KnowledgeGraph.vue'

export default {
  name: 'GenericGraphExample',
  components: {
    KnowledgeGraph
  },
  data() {
    return {
      // 通用数据源配置 - 使用静态数据
      genericDataSource: {
        type: 'static'
        // 数据通过 initialData prop 传入
      },
      // 通用节点类型配置
      genericNodeConfig: {
        types: {
          category: { name: '分类', color: '#4ecdc4' },
          item: { name: '项目', color: '#ff6b6b' },
          tag: { name: '标签', color: '#45b7d1' },
          relation: { name: '关系', color: '#ffd93d' }
        },
        defaultColor: '#666666'
      },
      // 通用图表配置（禁用）
      genericChartConfig: {
        enabled: false
      },
      // 示例静态数据
      sampleData: {
        nodes: [
          { id: '1', name: '节点1', group: 'category', description: '这是节点1的描述' },
          { id: '2', name: '节点2', group: 'item', description: '这是节点2的描述' },
          { id: '3', name: '节点3', group: 'tag', description: '这是节点3的描述' },
          { id: '4', name: '节点4', group: 'relation', description: '这是节点4的描述' }
        ],
        links: [
          { source: '1', target: '2', type: '包含', details: '节点1包含节点2' },
          { source: '2', target: '3', type: '关联', details: '节点2关联节点3' },
          { source: '3', target: '4', type: '连接', details: '节点3连接节点4' }
        ],
        metadata: {
          graphTitle: '通用知识图谱',
          description: '这是一个通用的知识图谱示例'
        }
      }
    }
  },
  methods: {
    handleNodeClick(node) {
      console.log('节点点击:', node)
      // 可以在这里添加自定义逻辑
      // 例如：显示节点详情、跳转页面等
    },
    handleNodeRightClick(node, event) {
      console.log('节点右键点击:', node)
      // 可以在这里添加自定义逻辑
      // 例如：显示上下文菜单、复制节点信息等
    }
  }
}
</script>

<style scoped>
/* 可以添加自定义样式 */
</style>

