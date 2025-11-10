# 知识图谱组件配置化改造总结

## 改造完成情况

✅ **已完成所有改造任务**

### 1. 核心组件改造 ✅

**文件：`src/components/KnowledgeGraph.vue`**

- ✅ 添加了完整的 Props 配置接口
- ✅ 支持四种数据源类型：`api`、`static`、`function`、`websocket`
- ✅ 配置化节点类型和颜色
- ✅ 配置化图表功能
- ✅ 事件回调机制（`onNodeClick`、`onNodeRightClick`、`onNodeDetailClick`）
- ✅ 使用 computed 属性动态获取节点配置
- ✅ 移除所有硬编码的业务逻辑

### 2. 工具类创建 ✅

**文件：`src/utils/dataAdapter.js`**
- ✅ 数据适配器类，支持多种数据格式
- ✅ 自动字段映射（支持 `id/nodeId/key`、`name/label/title` 等）
- ✅ 灵活的节点和链接适配

**文件：`src/utils/dataFetcher.js`**
- ✅ 数据获取器类，统一处理不同数据源
- ✅ 支持 URL、Props、Query 三种参数来源
- ✅ 支持路径参数和查询参数
- ✅ 支持响应数据路径提取

### 3. 示例文件创建 ✅

**文件：`src/examples/CourseGraphExample.vue`**
- ✅ 课程知识图谱完整示例
- ✅ 展示 API 数据源配置
- ✅ 展示事件回调使用

**文件：`src/examples/GenericGraphExample.vue`**
- ✅ 通用知识图谱示例
- ✅ 展示静态数据源使用
- ✅ 展示自定义节点类型配置

**文件：`src/examples/CustomGraphExample.vue`**
- ✅ 自定义数据源示例
- ✅ 展示函数式数据获取
- ✅ 展示完整的自定义配置

### 4. 主应用更新 ✅

**文件：`src/App.vue`**
- ✅ 更新为使用新的配置化组件
- ✅ 展示完整的配置示例
- ✅ 保持向后兼容的业务逻辑

### 5. 文档创建 ✅

**文件：`README_CONFIG.md`**
- ✅ 完整的配置使用指南
- ✅ 所有 Props 的详细说明
- ✅ 多种使用场景示例
- ✅ 数据格式要求说明
- ✅ 迁移指南

## 主要改造点

### 1. Props 配置接口

组件现在通过 Props 接收所有配置：

```javascript
props: {
  dataSource: Object,        // 数据源配置（必需）
  nodeTypeConfig: Object,     // 节点类型配置
  chartConfig: Object,        // 图表配置
  onNodeClick: Function,      // 节点点击回调
  onNodeRightClick: Function, // 节点右键回调
  onNodeDetailClick: Function,// 节点详情回调
  initialData: Object,        // 静态数据
  graphTitle: String,         // 图谱标题
  description: String,       // 图谱描述
  searchPlaceholder: String,  // 搜索占位符
  showChart: Boolean          // 是否显示图表
}
```

### 2. 数据源配置化

**之前（硬编码）：**
```javascript
async init() {
  const classTypeId = urlParams.get('classId');
  const response = await axios.get(`http://localhost:8080/courseOutline/graph/${classTypeId}`);
  // ...
}
```

**现在（配置化）：**
```javascript
dataSource: {
  type: 'api',
  url: 'http://localhost:8080/courseOutline/graph/:classTypeId',
  params: {
    classTypeId: { key: 'classId', source: 'url' }
  }
}
```

### 3. 节点类型配置化

**之前（硬编码）：**
```javascript
typeNames: {
  firstNode: '一级知识点',
  secondNode: '二级知识点'
}
nodeColors: {
  firstNode: '#4ecdc4',
  secondNode: '#ff6b6b'
}
```

**现在（配置化）：**
```javascript
nodeTypeConfig: {
  types: {
    firstNode: { name: '一级知识点', color: '#4ecdc4' },
    secondNode: { name: '二级知识点', color: '#ff6b6b' }
  }
}
```

### 4. 事件回调化

**之前（硬编码业务逻辑）：**
```javascript
handleNodeRightClick(node, event) {
  if(this.selectedNode.parentId != 0) {
    window.location.href = `http://localhost:80/graph/courseLineInfo/?id=${this.selectedNode.id}`;
  }
}
```

**现在（回调函数）：**
```javascript
// 组件内部
if (this.onNodeRightClick) {
  this.onNodeRightClick(node, event)
}

// 使用组件时
<KnowledgeGraph
  :on-node-right-click="handleNodeRightClick"
/>
```

## 使用方式对比

### 之前的使用方式
```vue
<template>
  <KnowledgeGraph />
</template>
```
- ❌ 硬编码在组件内部
- ❌ 只能用于课程场景
- ❌ 无法自定义配置

### 现在的使用方式
```vue
<template>
  <KnowledgeGraph
    :data-source="dataSource"
    :node-type-config="nodeConfig"
    :chart-config="chartConfig"
    :on-node-click="handleClick"
  />
</template>
```
- ✅ 完全配置化
- ✅ 适用于任意场景
- ✅ 高度可定制

## 支持的数据源类型

1. **API 数据源** - 从 HTTP API 获取数据
2. **静态数据源** - 直接传入数据对象
3. **函数式数据源** - 通过自定义函数获取数据
4. **WebSocket 数据源** - 实时数据流（预留接口）

## 配置灵活性

- ✅ 支持路径参数（`:id`）
- ✅ 支持查询参数
- ✅ 支持从 URL、Props、Query 获取参数
- ✅ 支持响应数据路径提取（`data.data`）
- ✅ 支持自定义字段映射
- ✅ 支持自定义请求头和其他 axios 配置

## 向后兼容性

- ✅ 保持了原有的功能特性
- ✅ 图表功能可配置启用/禁用
- ✅ 所有原有功能都可通过配置实现
- ✅ 提供了完整的迁移指南

## 文件结构

```
src/
├── components/
│   └── KnowledgeGraph.vue      # 主组件（已改造）
├── utils/
│   ├── dataAdapter.js           # 数据适配器（新建）
│   └── dataFetcher.js           # 数据获取器（新建）
├── examples/
│   ├── CourseGraphExample.vue   # 课程示例（新建）
│   ├── GenericGraphExample.vue  # 通用示例（新建）
│   └── CustomGraphExample.vue    # 自定义示例（新建）
├── App.vue                      # 主应用（已更新）
└── README_CONFIG.md              # 配置文档（新建）
```

## 下一步建议

1. **测试验证**：测试各种配置场景，确保功能正常
2. **性能优化**：如果数据量大，考虑添加虚拟滚动或分页
3. **扩展功能**：可以添加更多图表类型、导出功能等
4. **类型定义**：如果使用 TypeScript，可以添加类型定义文件
5. **单元测试**：为核心功能添加单元测试

## 总结

通过这次改造，知识图谱组件从**特定场景的专用组件**转变为**通用的可配置组件**，可以适用于任意内容的知识图谱可视化需求。组件现在具有：

- 🎯 **高度可配置**：所有功能都可通过 Props 配置
- 🔌 **灵活的数据源**：支持多种数据获取方式
- 🎨 **可定制样式**：节点类型、颜色完全可配置
- 🔄 **事件驱动**：通过回调函数处理业务逻辑
- 📚 **完整文档**：提供详细的使用指南和示例

改造完成！🎉

