# 知识图谱可视化前端项目

一个基于 Vue.js 的通用知识图谱可视化组件，支持 3D 力导向图展示、节点搜索、图表统计等功能。组件采用完全配置化的设计，可以适用于任意内容的知识图谱可视化需求。

## ✨ 功能特性

- 🎯 **完全配置化**：通过 Props 配置数据源、节点类型、图表等，无需修改组件代码
- 📊 **3D 力导向图**：基于 `3d-force-graph` 和 `Three.js` 的交互式 3D 图谱可视化
- 🔍 **节点搜索**：支持实时搜索和高亮定位节点
- 📈 **数据统计图表**：集成 ECharts，支持展示关联数据统计
- 🔌 **多种数据源**：支持 API、静态数据、函数式数据源
- 🎨 **自定义节点类型**：灵活配置节点类型、颜色、名称
- 🖱️ **丰富的交互**：节点点击、右键、详情查看等事件回调
- 📱 **响应式设计**：适配不同屏幕尺寸

## 🛠️ 技术栈

- **框架**: Vue.js 2.6.14
- **路由**: Vue Router 3.4.9
- **UI 组件**: Element UI 2.15.14
- **3D 图形**: 
  - 3d-force-graph 1.73.5
  - Three.js 0.152.2
- **图表**: ECharts 5.6.0
- **HTTP 请求**: Axios 1.8.1
- **构建工具**: Vue CLI 5.0

## 📦 安装

### 环境要求

- Node.js >= 12.x
- npm >= 6.x 或 yarn >= 1.x

### 安装依赖

使用 npm:
```bash
npm install
```

或使用 yarn:
```bash
yarn install
```

## 🚀 快速开始

### 开发模式

启动开发服务器（默认端口：7800）:

```bash
npm run serve
# 或
yarn serve
```

访问 `http://localhost:7800` 查看应用。

### 生产构建

```bash
npm run build
# 或
yarn build
```

构建产物将输出到 `dist/` 目录。

### 代码检查

```bash
npm run lint
# 或
yarn lint
```

## 📖 使用指南

### 基础使用

```vue
<template>
  <div id="app">
    <KnowledgeGraph
      :data-source="dataSource"
      :node-type-config="nodeTypeConfig"
      :chart-config="chartConfig"
      :on-node-click="handleNodeClick"
    />
  </div>
</template>

<script>
import KnowledgeGraph from './components/KnowledgeGraph.vue'

export default {
  components: {
    KnowledgeGraph
  },
  data() {
    return {
      // 数据源配置
      dataSource: {
        type: 'api',
        url: 'http://localhost:8080/api/graph/:id',
        method: 'GET',
        params: {
          id: {
            key: 'classId',
            source: 'url'
          }
        },
        responsePath: 'data.data'
      },
      // 节点类型配置
      nodeTypeConfig: {
        types: {
          firstNode: { name: '一级节点', color: '#4ecdc4' },
          secondNode: { name: '二级节点', color: '#ff6b6b' }
        }
      },
      // 图表配置
      chartConfig: {
        enabled: true,
        type: 'api',
        url: 'http://localhost:8080/api/chart/:id',
        title: '数据统计',
        nameKey: 'name',
        dataKey: 'value'
      }
    }
  },
  methods: {
    handleNodeClick(node) {
      console.log('节点被点击:', node)
    }
  }
}
</script>
```

### 配置说明

详细的配置说明请查看 [配置使用指南](./README_CONFIG.md)，包括：

- 数据源配置（API、静态、函数式）
- 节点类型配置
- 图表配置
- 事件回调配置
- 数据格式要求
- 参数获取方式

### 示例代码

项目提供了多个使用示例，位于 `src/examples/` 目录：

- **CourseGraphExample.vue** - 课程知识图谱示例（API 数据源）
- **GenericGraphExample.vue** - 通用知识图谱示例（静态数据源）
- **CustomGraphExample.vue** - 自定义数据源示例（函数式数据源）
- **AppWithCourseExample.vue** - 完整应用示例

## 📁 项目结构

```
knowledge-graph-frontend/
├── public/                 # 静态资源
│   ├── index.html         # HTML 模板
│   └── favicon.ico        # 网站图标
├── src/
│   ├── api/               # API 接口
│   │   └── neo4j/         # Neo4j 相关接口
│   ├── assets/            # 资源文件
│   ├── components/        # Vue 组件
│   │   └── KnowledgeGraph.vue  # 核心知识图谱组件
│   ├── examples/          # 使用示例
│   │   ├── CourseGraphExample.vue
│   │   ├── GenericGraphExample.vue
│   │   ├── CustomGraphExample.vue
│   │   └── AppWithCourseExample.vue
│   ├── router/            # 路由配置
│   │   └── index.js
│   ├── utils/             # 工具类
│   │   ├── dataAdapter.js    # 数据适配器
│   │   └── dataFetcher.js    # 数据获取器
│   ├── App.vue            # 根组件
│   ├── main.js            # 入口文件
│   └── courseLineInfo.vue # 课程详情页面
├── babel.config.js        # Babel 配置
├── jsconfig.json          # JavaScript 配置
├── package.json           # 项目依赖
├── vue.config.js          # Vue CLI 配置
├── README.md              # 项目说明（本文件）
├── README_CONFIG.md       # 配置使用指南
└── TRANSFORMATION_SUMMARY.md  # 改造总结文档
```

## 🔧 配置说明

### 数据源类型

组件支持四种数据源类型：

1. **API 数据源** (`type: 'api'`)
   - 从 HTTP API 获取数据
   - 支持路径参数和查询参数
   - 支持自定义请求头和 axios 配置

2. **静态数据源** (`type: 'static'`)
   - 直接传入数据对象
   - 通过 `initialData` prop 传入

3. **函数式数据源** (`type: 'function'`)
   - 通过自定义函数获取数据
   - 支持异步操作

4. **WebSocket 数据源** (`type: 'websocket'`)
   - 实时数据流（预留接口）

### 节点类型配置

```javascript
nodeTypeConfig: {
  types: {
    firstNode: { 
      name: '一级节点',    // 节点类型显示名称
      color: '#4ecdc4'    // 节点颜色（十六进制）
    },
    secondNode: { 
      name: '二级节点', 
      color: '#ff6b6b' 
    }
  },
  defaultColor: '#666666'  // 未匹配类型的默认颜色
}
```

### 图表配置

```javascript
chartConfig: {
  enabled: true,           // 是否启用图表
  type: 'api',             // 数据源类型
  url: 'http://...',       // API 地址
  title: '数据统计',        // 图表标题
  nameKey: 'name',         // 数据项名称字段
  dataKey: 'value',        // 数据项值字段
  chartColor: '#ff8a65'    // 图表颜色
}
```

### 事件回调

组件支持以下事件回调：

- `onNodeClick` - 节点点击事件
- `onNodeRightClick` - 节点右键点击事件
- `onNodeDetailClick` - 节点详情点击事件

## 📊 数据格式

### 标准数据格式

```javascript
{
  nodes: [
    {
      id: '1',                    // 必需：节点唯一标识
      name: '节点名称',            // 必需：节点显示名称
      group: 'firstNode',          // 必需：节点类型
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
  ]
}
```

组件内置数据适配器，支持多种字段映射（如 `id/nodeId/key`、`name/label/title` 等）。

## 🎯 主要功能

### 1. 3D 力导向图

- 基于物理引擎的节点布局
- 支持拖拽、缩放、旋转交互
- 节点高亮和连线动画

### 2. 节点搜索

- 实时搜索节点
- 搜索结果列表展示
- 点击结果定位到节点

### 3. 视图控制

- 放大/缩小视图
- 重置视图
- 自动布局

### 4. 节点详情

- 点击节点显示详情面板
- 展示节点信息和关联关系
- 支持自定义详情内容

### 5. 数据统计图表

- 集成 ECharts 图表
- 支持柱状图、折线图等
- 可配置图表数据源

## 🔍 开发指南

### 本地开发

1. 克隆项目
2. 安装依赖：`npm install` 或 `yarn install`
3. 启动开发服务器：`npm run serve` 或 `yarn serve`
4. 访问 `http://localhost:7800`

### 修改配置

开发服务器默认端口为 7800，可在 `vue.config.js` 中修改：

```javascript
module.exports = {
  devServer: {
    port: 7800  // 修改为你需要的端口
  }
}
```

### 添加新功能

1. 在 `src/components/KnowledgeGraph.vue` 中添加功能
2. 如需配置化，通过 Props 暴露配置项
3. 更新 `README_CONFIG.md` 文档

## ❓ 常见问题

### 1. 启动失败：`vue-cli-service` 找不到

**原因**：依赖未安装或安装不完整

**解决**：
```bash
# 删除 node_modules 和锁文件
rm -rf node_modules package-lock.json yarn.lock

# 重新安装依赖
npm install
# 或
yarn install
```

### 2. 数据加载失败

**检查项**：
- 数据源 URL 是否正确
- 参数配置是否正确
- 后端 API 是否可访问
- 数据格式是否符合要求

### 3. 节点不显示

**检查项**：
- 节点数据格式是否正确
- `nodeTypeConfig` 是否配置
- 节点 `group` 字段是否匹配配置的类型

### 4. 图表不显示

**检查项**：
- `chartConfig.enabled` 是否为 `true`
- `showChart` prop 是否为 `true`
- 图表数据源配置是否正确
