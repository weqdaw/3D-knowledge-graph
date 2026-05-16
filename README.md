# Knowledge Graph Visualization Frontend Project

A general-purpose knowledge graph visualization component based on Vue.js, supporting features such as 3D force-directed graph display, node search, and chart statistics. The component adopts a fully configurable design, making it suitable for knowledge graph visualization needs of any content.

## Features

- **Fully Configurable:** Configure data sources, node types, charts, etc. via Props without modifying component code.
  
- **3D Force-Driven Graph:** Interactive 3D graph visualization based on `3d-force-graph` and `Three.js`.
  
- **Node Search:** Supports real-time search and highlighting of nodes.
  
- **Data Statistics Charts:** Integrates with ECharts, supporting the display of related data statistics.
  
- **Multiple Data Sources:** Supports API, static data, and functional data sources.
  
- **Custom Node Types:** Flexible configuration of node types, colors, and names.
  

## Technology Stack

- **Framework:** Vue.js 2.6.14
  
- **Route:** Vue Router 3.4.9
  
- **UI Components:** Element UI 2.15.14
  
- **3D Graphics:**
  
- 3d-force-graph 1.73.5
  
- Three.js 0.152.2
  
- **Charts:** ECharts 5.6.0
  
- **HTTP Requests**: Axios 1.8.1
  
- **Build Tools**: Vue CLI 5.0
  

## Installation

### Environment Requirements

Node.js >= 12.x

npm >= 6.x or yarn >= 1.x

### Install Dependencies

Using npm:

```bash
npm install
```

Or using yarn:

```bash
yarn install
```

## Quick Start

### Development Mode

Start the development server (default port: 7800):

```bash
npm run serve
# or
yarn serve
```

Access `http://localhost:7800` to view the application.

### Production Build

```bash
npm run build
# or
yarn build
```

The build artifacts will be output to the `dist/` directory.

## Usage Guidelines

### Basic Usage

```vue
<script>
import KnowledgeGraph from './components/KnowledgeGraph.vue'
export default {
components: {
KnowledgeGraph
},
data() {
return {
// Data source configuration
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
// Node type configuration
nodeTypeConfig: {
types: {
firstNode: { name: 'Level 1 node', color: '#4ecdc4' },
secondNode: { name: 'Level 2 node', color: '#ff6b6b' }
}
},
// Chart configuration
chartConfig: {
enabled: true,
type: 'api',
url: 'http://localhost:8080/api/chart/:id',
title: 'Data Statistics',
nameKey: 'name',
dataKey: 'value'
}
}
},
methods: {
handleNodeClick(node) {
console.log('Node clicked:', node)
}
}
}
</script>
```

### Example Code

The project provides several usage examples, located in the `src/examples/` directory:

**CourseGraphExample.vue** - Course knowledge graph example (API data source)

**GenericGraphExample.vue** - Generic knowledge graph example (static data source)

**CustomGraphExample.vue** - Custom data source example (functional data source)

**AppWithCourseExample.vue** - Complete application example

## Project Structure

```
knowledge-graph-frontend/
├── public/ # Static resources
│ ├── index.html # HTML template
│ └── favicon.ico # Website icon
├── src/
│ ├── api/ # API interface
│ │ └── neo4j/ # Neo4j related interfaces
│ ├── assets/ # Resource files
│ ├── components/ # Vue Components
│ │ └── KnowledgeGraph.vue # Core knowledge graph component
│ ├── examples/ # Usage examples
│ │ ├── CourseGraphExample.vue
│ │ ├── GenericGraphExample.vue
│ │ ├── CustomGraphExample.vue
│ │ └── AppWithCourseExample.vue
│ ├── router/ # Routing configuration
│ │ └── index.js
│ ├── utils/ # Utility class
│ │ ├── dataAdapter.js # Data adapter
│ │ └── dataFetcher.js # Data fetcher
│ ├── App.vue # Root component
│ ├── main.js # Entry file
│ └── courseLineInfo.vue # Course details page
├── babel.config.js # Babel Configuration
├── jsconfig.json # JavaScript configuration
├── package.json # Project dependencies
├── vue.config.js # Vue CLI configuration
├── README.md # Project description (this file)
├── README_CONFIG.md # Configuration usage guide
└── TRANSFORMATION_SUMMARY.md # Transformation summary document
```

## Configuration Instructions

### Data Source Types

The component supports four data source types:

1. **API Data Source** (`type: 'api'`)
  

- Retrieves data from an HTTP API
  
- Supports path parameters and query parameters
  
- Supports custom request headers and axios configuration
  

2. **Static Data Source** (`type: 'static'`)
  

- Directly passes in a data object
  
- Passed in via the `initialData` prop
  

3. **Functional Data Source** (`type: 'function'`)
  

- Retrieves data via a custom function
  
- Supports asynchronous operations
  

4. **WebSocket Data Source** (`type: 'websocket'`)
  

- Real-time data stream (reserved interface)

### Node Type Configuration

```javascript
nodeTypeConfig: {
types: {
firstNode: {
name: 'First-level node', // Node type display name
color: '#4ecdc4' // Node color (hexadecimal)
},
secondNode: {
name: 'Second-level node',
color: '#ff6b6b'
}
},
defaultColor: '#666666' // Default color for unmatched types
}
```

### Chart Configuration

```javascript
chartConfig: {
enabled: true, // Whether to enable charts
type: 'api', // Data source type
url: 'http://...', // API address
title: 'Data Statistics', // Chart title
nameKey: 'name', // Data item name field
dataKey: 'value', // Data item value field
chartColor: '#ff8a65' // Chart color

}
```

### Event Callbacks

The component supports the following event callbacks:

`onNodeClick` - Node click event

`onNodeRightClick` - Node right-click event

`onNodeDetailClick` - Node detail click event

## Data Format

### Standard Data Format

```javascript
{
nodes: [
{
id: '1', // Required: Unique node identifier
name: 'Node name', // Required: Node display name
group: 'firstNode', // Required: Node type
description: 'Node description' // Optional: Node description
}
],
links: [
{
source: '1', // Required: Source node ID
target: '2', // Required: Target node ID
type: 'Relationship Type', // Optional: Relationship Type
Details: 'Relationship Details' // Optional: Relationship Details
}
]
}
```

The component has a built-in data adapter that supports various field mappings (such as `id/nodeId/key`, `name/label/title`, etc.).

## Main Functions

### 1. 3D Force-Directed Graph

- Physics-based node layout
  
- Supports drag-and-drop, zoom, and rotation interactions
  
- Node highlighting and connection animations
  

### 2. Node Search

- Real-time node search
  
- Search result list display
  
- Clicking a result locates the node
  

### 3. View Control

- Zoom in/out of view
  
- Reset view
  
- Auto layout
  

### 4. Node Details

- Clicking a node displays a details panel
  
- Displays node information and relationships
  
- Supports custom details content
  

### 5. Data Statistics Charts

- Integration with ECharts charts
  
- Supports bar charts, line charts, etc.
  
- Configurable chart data source
  

## Development Guide

### Adding New Features

1. Add features to `src/components/KnowledgeGraph.vue`
  
2. For configurability, expose configuration items via Props
  
3. Update `README_CONFIG.md` Documentation
  

## Frequently Asked Questions

### 1. Startup Failure: `vue-cli-service` Not Found

**Reason**: Dependencies not installed or incomplete installation

**Solution**:

```bash
# Delete node_modules and lock file
rm -rf node_modules package-lock.json yarn.lock
# Reinstall dependencies
npm install
# or
yarn install
```

### 2. Data Loading Failure

**Check Items**:

- Is the data source URL correct?
  
- Is the parameter configuration correct?
  
- Is the backend API accessible?
  
- Does the data format meet the requirements?
  

### 3. Nodes Not Displaying

**Check Items** 
- Is the node data format correct?
- Is `nodeTypeConfig` configured?
- Does the node `group` field match the configured type?

### 4. Chart Not Displaying
**Check Items**:
- Is `chartConfig.enabled` set to `true`?
Is the `showChart` prop set to `true`?
Is the chart data source configuration correct?
