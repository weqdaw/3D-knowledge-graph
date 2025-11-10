# 知识图谱组件配置化使用指南

## 概述

知识图谱组件已改造为完全配置化的通用组件，支持通过 Props 配置数据源、节点类型、图表、事件回调等，可以适用于任意内容的知识图谱可视化。

## 核心 Props 配置

### 1. dataSource (必需) - 数据源配置

数据源支持四种类型：`api`、`static`、`function`、`websocket`

#### API 数据源

```javascript
{
  type: 'api',
  url: 'http://localhost:8080/api/graph/:id',  // 支持路径参数
  method: 'GET',  // 或 'POST'
  params: {
    id: {
      key: 'classId',  // 参数名
      source: 'url'     // 来源：'url' | 'props' | 'query'
    }
  },
  paramSource: 'url',  // 默认参数来源
  responsePath: 'data.data',  // 响应数据路径（可选）
  headers: {},  // 自定义请求头（可选）
  axiosConfig: {}  // 其他 axios 配置（可选）
}
```

#### 静态数据源

```javascript
{
  type: 'static'
  // 数据通过 initialData prop 传入
}
```

#### 函数式数据源

```javascript
{
  type: 'function',
  fetch: async (props, query) => {
    // 自定义数据获取逻辑
    const data = await yourCustomAPI.getData()
    return data
  }
}
```

### 2. nodeTypeConfig - 节点类型配置

```javascript
{
  types: {
    firstNode: { 
      name: '一级节点',    // 节点类型显示名称
      color: '#4ecdc4'    // 节点颜色
    },
    secondNode: { 
      name: '二级节点', 
      color: '#ff6b6b' 
    },
    // ... 更多节点类型
  },
  defaultColor: '#666666'  // 未匹配类型的默认颜色
}
```

### 3. chartConfig - 图表配置

```javascript
{
  enabled: true,  // 是否启用图表
  type: 'api',     // 'api' | 'static' | 'function'
  url: 'http://localhost:8080/api/chart/:id',
  method: 'GET',
  params: {
    id: {
      key: 'classId',
      source: 'url'
    }
  },
  responsePath: 'data',  // 响应数据路径
  title: '数据统计',      // 图表标题
  nameKey: 'name',        // 数据项名称字段
  valueKey: 'value',      // 数据项值字段
  dataKey: 'top5WeekPoint',  // 图表数据键名
  chartColor: '#ff8a65'   // 图表颜色
}
```

### 4. 事件回调 Props

```javascript
// 节点点击回调
onNodeClick: (node) => {
  console.log('节点被点击:', node)
}

// 节点右键点击回调
onNodeRightClick: (node, event) => {
  console.log('节点被右键点击:', node)
  // 可以阻止默认行为
  event.preventDefault()
}

// 节点详情点击回调
onNodeDetailClick: (node) => {
  console.log('节点详情被点击:', node)
}
```

### 5. 其他 Props

```javascript
{
  initialData: {},           // 静态数据源的初始数据
  graphTitle: '知识图谱',     // 图谱标题（可选）
  description: '描述信息',    // 图谱描述（可选）
  searchPlaceholder: '搜索节点...',  // 搜索框占位符
  showChart: true            // 是否显示图表
}
```

## 使用示例

### 示例 1: 课程知识图谱（API 数据源）

```vue
<template>
  <KnowledgeGraph
    :data-source="courseDataSource"
    :node-type-config="courseNodeConfig"
    :chart-config="courseChartConfig"
    :on-node-right-click="handleNodeRightClick"
  />
</template>

<script>
import KnowledgeGraph from './components/KnowledgeGraph.vue'

export default {
  components: { KnowledgeGraph },
  data() {
    return {
      courseDataSource: {
        type: 'api',
        url: 'http://localhost:8080/courseOutline/graph/:classTypeId',
        method: 'GET',
        params: {
          classTypeId: {
            key: 'classId',
            source: 'url'
          }
        },
        responsePath: 'data.data'
      },
      courseNodeConfig: {
        types: {
          firstNode: { name: '一级知识点', color: '#4ecdc4' },
          secondNode: { name: '二级知识点', color: '#ff6b6b' }
        }
      },
      courseChartConfig: {
        enabled: true,
        type: 'api',
        url: 'http://localhost:8080/neo4j/dataStatis/Top5ChartByClassTypeId/:classTypeId',
        params: {
          classTypeId: { key: 'classId', source: 'url' }
        },
        title: '薄弱知识点排名前五',
        nameKey: 'weakPointName',
        dataKey: 'top5WeekPoint'
      }
    }
  },
  methods: {
    handleNodeRightClick(node, event) {
      if (node.parentId != 0) {
        window.location.href = `http://localhost:80/graph/courseLineInfo/?id=${node.id}`
      }
    }
  }
}
</script>
```

### 示例 2: 通用知识图谱（静态数据源）

```vue
<template>
  <KnowledgeGraph
    :data-source="{ type: 'static' }"
    :initial-data="graphData"
    :node-type-config="nodeConfig"
    :show-chart="false"
  />
</template>

<script>
import KnowledgeGraph from './components/KnowledgeGraph.vue'

export default {
  components: { KnowledgeGraph },
  data() {
    return {
      graphData: {
        nodes: [
          { id: '1', name: '节点1', group: 'category' },
          { id: '2', name: '节点2', group: 'item' }
        ],
        links: [
          { source: '1', target: '2', type: '关联' }
        ]
      },
      nodeConfig: {
        types: {
          category: { name: '分类', color: '#4ecdc4' },
          item: { name: '项目', color: '#ff6b6b' }
        }
      }
    }
  }
}
</script>
```

### 示例 3: 自定义数据源（函数式）

```vue
<template>
  <KnowledgeGraph
    :data-source="customDataSource"
    :node-type-config="nodeConfig"
    :on-node-click="handleNodeClick"
  />
</template>

<script>
import KnowledgeGraph from './components/KnowledgeGraph.vue'

export default {
  components: { KnowledgeGraph },
  data() {
    return {
      customDataSource: {
        type: 'function',
        fetch: async (props, query) => {
          // 自定义数据获取逻辑
          const response = await fetch('/api/custom-graph')
          return await response.json()
        }
      },
      nodeConfig: {
        types: {
          person: { name: '人员', color: '#4ecdc4' },
          org: { name: '组织', color: '#ff6b6b' }
        }
      }
    }
  },
  methods: {
    handleNodeClick(node) {
      console.log('节点点击:', node)
    }
  }
}
</script>
```

## 数据格式要求

### 标准数据格式

组件期望的数据格式如下：

```javascript
{
  nodes: [
    {
      id: '1',                    // 必需：节点唯一标识
      name: '节点名称',            // 必需：节点显示名称
      group: 'firstNode',          // 必需：节点类型（对应 nodeTypeConfig）
      description: '节点描述'      // 可选：节点描述
    }
  ],
  links: [
    {
      source: '1',                // 必需：源节点 ID
      target: '2',                // 必需：目标节点 ID
      type: '关联类型',            // 可选：关联类型
      details: '关联详情'          // 可选：关联详情
    }
  ],
  metadata: {                     // 可选：元数据
    graphTitle: '图谱标题',
    description: '图谱描述'
  }
}
```

### 数据适配器

组件内置了数据适配器，支持以下字段映射：

**节点字段映射：**
- `id`: `['id', 'nodeId', 'key']`
- `name`: `['name', 'label', 'title', 'text']`
- `group`: `['group', 'type', 'category', 'level']`
- `description`: `['description', 'desc', 'detail']`

**链接字段映射：**
- `source`: `['source', 'from', 'start']`
- `target`: `['target', 'to', 'end']`
- `type`: `['type', 'relation', 'relationship', 'edgeType']`
- `details`: `['details', 'label', 'name', 'description']`

如果您的数据使用不同的字段名，可以通过 `adapterConfig` 自定义映射：

```javascript
dataSource: {
  type: 'api',
  url: '...',
  adapterConfig: {
    nodeMapping: {
      id: ['customId', 'nodeId'],
      name: ['customName', 'label']
    }
  }
}
```

## 参数获取方式

组件支持从三种来源获取参数：

1. **URL 参数** (`source: 'url'`)
   - 从 `window.location.search` 中获取
   - 例如：`?classId=123` → `classId = '123'`

2. **Props** (`source: 'props'`)
   - 从组件的 props 中获取
   - 需要在父组件中传递对应的 prop

3. **Query** (`source: 'query'`)
   - 从 Vue Router 的 `$route.query` 中获取
   - 需要配置 Vue Router

## 完整配置示例

查看以下示例文件了解完整的使用方式：

- `src/examples/CourseGraphExample.vue` - 课程知识图谱示例
- `src/examples/GenericGraphExample.vue` - 通用知识图谱示例
- `src/examples/CustomGraphExample.vue` - 自定义数据源示例

## 迁移指南

### 从旧版本迁移

如果您之前使用的是硬编码的课程知识图谱，迁移步骤如下：

1. **替换组件使用方式**
   ```vue
   <!-- 旧方式 -->
   <KnowledgeGraph />
   
   <!-- 新方式 -->
   <KnowledgeGraph
     :data-source="dataSource"
     :node-type-config="nodeConfig"
   />
   ```

2. **配置数据源**
   ```javascript
   dataSource: {
     type: 'api',
     url: 'http://localhost:8080/courseOutline/graph/:classTypeId',
     params: {
       classTypeId: { key: 'classId', source: 'url' }
     }
   }
   ```

3. **配置节点类型**
   ```javascript
   nodeTypeConfig: {
     types: {
       firstNode: { name: '一级知识点', color: '#4ecdc4' },
       // ... 其他类型
     }
   }
   ```

4. **配置事件回调**
   ```javascript
   methods: {
     handleNodeRightClick(node, event) {
       // 原来的业务逻辑
       if (node.parentId != 0) {
         window.location.href = `...`
       }
     }
   }
   ```

## 注意事项

1. **数据源配置是必需的**：必须提供 `dataSource` prop，且 `type` 必须是有效值
2. **节点类型配置**：如果不提供 `nodeTypeConfig`，将使用默认配置
3. **数据格式**：确保数据格式符合要求，或使用适配器配置自定义映射
4. **参数获取**：确保参数来源（URL/Props/Query）正确配置
5. **图表配置**：如果不需要图表，设置 `chartConfig.enabled: false` 或 `showChart: false`

## 技术支持

如有问题，请查看示例文件或联系开发团队。

