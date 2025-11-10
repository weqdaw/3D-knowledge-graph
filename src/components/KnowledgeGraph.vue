<template>
  <div class="knowledge-graph">
    <div id="graph-container"></div>
    
    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="panel-header">
       {{ finalGraphTitle }}
      </div>
      <div class="panel-body">
        {{ finalDescription }}
      </div>
      <!-- 添加搜索部分 -->
      <div class="search-section">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            :placeholder="searchPlaceholder" 
            @input="handleSearch"
          />
          <span class="search-icon">🔍</span>
        </div>
        <div class="search-results" v-if="searchResults.length > 0">
          <div 
            v-for="node in searchResults" 
            :key="node.id" 
            class="search-result-item"
            @click="focusSearchResult(node)"
          >
            <span class="result-name">{{ node.name }}</span>
            <span class="result-type">{{ typeNames[node.group] }}</span>
          </div>
        </div>
      </div>

      <div class="upload-section">
        <!-- <div class="file-info" v-if="selectedFiles && selectedFiles.length">
          已选择 {{ selectedFiles.length }} 个文件
        </div>
        <div class="upload-buttons">
          <label class="upload-button">
            选择Java文件
            <input type="file" multiple accept=".java" @change="handleFileUpload" :disabled="isLoading" />
          </label>
          <label class="upload-button folder">
            选择文件夹
            <input 
              type="file" 
              webkitdirectory 
              directory 
              multiple 
              @change="handleFolderUpload" 
              :disabled="isLoading" 
            />
          </label>
        </div> -->
        <!-- <button class="analyze-button" @click="uploadFiles" :disabled="isLoading || !selectedFiles">
          <span class="spinner" v-if="isLoading"></span>
          {{ isLoading ? '分析中...' : '开始分析' }}
        </button> -->
      </div>

      <div class="view-controls">
        <button @click="zoomIn" :disabled="isLoading">
          <span class="icon">🔍+</span>放大
        </button>
        <button @click="zoomOut" :disabled="isLoading">
          <span class="icon">🔍-</span>缩小
        </button>
        <button @click="resetView" :disabled="isLoading">
          <span class="icon">↺</span>重置视图
        </button>
      </div>

      <!-- 图例说明 -->
      <div class="legend">
        <div class="legend-title">图例说明</div>
        <div class="legend-item" v-for="(color, type) in nodeColors" :key="type">
          <span class="color-dot" :style="{ backgroundColor: color }"></span>
          <span class="type-name">{{ typeNames[type] }}</span>
        </div>
         <!-- 图表容器 -->
 
        
   
      </div>
      <el-card v-if="showChart && chartConfig.enabled" class="chart-card">
          <div id="weekChart" class="chart"></div>
        </el-card>
     
    </div>

    <!-- 错误提示 -->
    <div class="error-message" v-if="error">
      {{ error }}
      <button class="close-error" @click="error = null">×</button>
    </div>

    <!-- 节点详情面板 -->
    <div 
      class="node-details" 
      v-if="selectedNode"
      :style="{ left: detailsPanelPos.x + 'px', top: detailsPanelPos.y + 'px' }"
      @mousedown="startDrag($event, 'details')"
    >
    <div class="detail-item" v-if="selectedNode.relatedLinks && selectedNode.relatedLinks.length">
  <strong>连接关系：</strong>
  <div 
    v-for="(link, index) in selectedNode.relatedLinks" 
    :key="index" 
    class="link-info"
  >
    {{ link.type }}: {{ link.details }}
    <span class="link-direction">
      ({{ link.target.id === selectedNode.id ? '←' : '→' }} {{ link.target.id === selectedNode.id ? link.source.name : link.target.name }})
    </span>
  </div>
</div>
      <div class="details-header drag-handle">
        <el-button
              
              type="text"
          
              @click="handleIn()"
            
            >详情</el-button>
        <h3>{{ isEditing ? '编辑节点' : selectedNode.name }}</h3>
        
        <div class="header-buttons">

          <!-- <button class="edit-button" @click="toggleEdit" v-if="!isEditing">
            ✏️ 编辑
          </button> -->
          <button class="close-details" @click="selectedNode = null">×</button>
        </div>
      
      </div>
      <div class="details-content">
        <!-- 查看模式 -->
        <div v-if="!isEditing">
          <div class="detail-item">
            <strong>描述：</strong> {{ selectedNode.description }}
          </div>
          <div class="detail-item">
            <strong>类型：</strong> {{ typeNames[selectedNode.group] }}
          </div>
          <!-- <div class="detail-item" v-if="selectedNode.annotations && selectedNode.annotations.length">
            <strong>注解：</strong>
            <div class="annotation-list">
              <span v-for="(ann, index) in selectedNode.annotations" :key="index" class="annotation">
                {{ ann }}
              </span>
            </div>
          </div>
          <div class="detail-item" v-if="selectedNode.modifiers && selectedNode.modifiers.length">
            <strong>修饰符：</strong>
            <span v-for="(mod, index) in selectedNode.modifiers" :key="index" class="modifier">
              {{ mod }}
            </span>
          </div> -->
        </div>
        
        <!-- 编辑模式 -->
        <div v-else class="edit-form">
          <div class="form-group">
            <label>名称：</label>
            <input type="text" v-model="editingNode.name" />
          </div>
          <div class="form-group">
            <label>描述：</label>
            <input type="text" v-model="editingNode.description" />
          </div>
          <div class="form-group">
            <label>类型：</label>
            <select v-model="editingNode.group">
              <option v-for="(name, type) in typeNames" :key="type" :value="type">
                {{ name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>注解：</label>
            <div class="tags-input">
              <input 
                type="text" 
                v-model="newAnnotation"
                @keyup.enter="addAnnotation"
                placeholder="按回车添加注解"
              />
              <div class="tags-container">
                <span 
                  v-for="(ann, index) in editingNode.annotations" 
                  :key="index" 
                  class="annotation editable"
                >
                  {{ ann }}
                  <button class="remove-tag" @click="removeAnnotation(index)">×</button>
                </span>
              </div>
            </div>
          </div>
          <div class="form-group">
            <label>修饰符：</label>
            <div class="tags-input">
              <input 
                type="text" 
                v-model="newModifier"
                @keyup.enter="addModifier"
                placeholder="按回车添加修饰符"
              />
              <div class="tags-container">
                <span 
                  v-for="(mod, index) in editingNode.modifiers" 
                  :key="index" 
                  class="modifier editable"
                >
                  {{ mod }}
                  <button class="remove-tag" @click="removeModifier(index)">×</button>
                </span>
              </div>
            </div>
          </div>
          <div class="edit-actions">
            <button class="save-button" @click="saveChanges">保存</button>
            <button class="cancel-button" @click="cancelEdit">取消</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 元数据面板 -->
    <!-- <div 
      class="metadata-panel" 
      v-if="graphData.metadata"
      :style="{ left: metadataPanelPos.x + 'px', top: metadataPanelPos.y + 'px' }"
      @mousedown="startDrag($event, 'metadata')"
    >
      <div class="metadata-header drag-handle">项目信息</div>
      <div class="metadata-content">
        <div class="metadata-section" v-if="graphData.metadata.patterns.length">
          <h4>设计模式</h4>
          <ul>
            <li v-for="(pattern, index) in graphData.metadata.patterns" :key="index">
              {{ pattern }}
            </li>
          </ul>
        </div>
        <div class="metadata-section" v-if="graphData.metadata.frameworks.length">
          <h4>使用框架</h4>
          <ul>
            <li v-for="(framework, index) in graphData.metadata.frameworks" :key="index">
              {{ framework }}
            </li>
          </ul>
        </div>
        <div class="metadata-section" v-if="graphData.metadata.features.length">
          <h4>特殊功能</h4>
          <ul>
            <li v-for="(feature, index) in graphData.metadata.features" :key="index">
              {{ feature }}
            </li>
          </ul>
        </div>
      </div>
    </div> -->

    <!-- 在 template 中添加平面视图小窗 -->
    <div 
      class="node-relation-panel" 
      v-if="selectedNode"
      :style="{ left: relationPanelPos.x + 'px', top: relationPanelPos.y + 'px' }"
      @mousedown="startDrag($event, 'relation')"
    >
      <div class="panel-header drag-handle">
        <h3>节点关系图</h3>
        <button class="close-panel" @click="closeRelationPanel">×</button>
      </div>
      <div class="relation-svg-container" ref="relationContainer">
        <svg :width="svgWidth" :height="svgHeight">
          <!-- 连线 -->
          <g class="links">
            <line
              v-for="link in nodeRelations.links"
              :key="`${link.source.id}-${link.target.id}`"
              :x1="link.source.x"
              :y1="link.source.y"
              :x2="link.target.x"
              :y2="link.target.y"

              :class="{'is-incoming': link.isIncoming}"
              marker-end="url(#arrowhead)"
            />
          </g>
          <!-- 箭头标记定义 -->
          <defs>
            <marker
              id="arrowhead"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#999"/>
            </marker>
          </defs>
          <!-- 节点 -->
          <g class="nodes">
            <g
              v-for="node in nodeRelations.nodes"
              :key="node.id"
              :transform="`translate(${node.x},${node.y})`"
              class="node"
              :class="{'is-selected': node.id === selectedNode.id}"
            >
              <circle
                r="20"
                :fill="getNodeColor(node.group)"
              />
              <text
                dy=".35em"
                text-anchor="middle"
                :fill="node.id === selectedNode.id ? '#fff' : '#333'"
                font-size="12"
              >
                {{ getShortName(node.name) }}
              </text>
            </g>
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import ForceGraph3D from '3d-force-graph';
import axios from 'axios'
import{MeshBasicMaterial} from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { Mesh } from 'three';
import{Vector3}from'three/src/math/Vector3'
import * as echarts from 'echarts';
import { DataFetcher } from '../utils/dataFetcher';

export default {
  name: 'KnowledgeGraph',
  props: {
    // 数据源配置
    dataSource: {
      type: Object,
      required: true,
      validator(value) {
        return value && ['api', 'static', 'function', 'websocket'].includes(value.type)
      }
    },
    // 节点类型配置
    nodeTypeConfig: {
      type: Object,
      default() {
        return {
          types: {
            firstNode: { name: '一级节点', color: '#4ecdc4' },
            secondNode: { name: '二级节点', color: '#ff6b6b' },
            thirdNode: { name: '三级节点', color: '#45b7d1' },
            forthNode: { name: '四级节点', color: '#ffd93d' },
            fifthNode: { name: '五级节点', color: '#6c5ce7' }
          },
          defaultColor: '#666666'
        }
      }
    },
    // 图表配置
    chartConfig: {
      type: Object,
      default() {
        return {
          enabled: false,
          type: 'api', // 'api' | 'static' | 'function'
          url: null,
          method: 'GET',
          params: {},
          responsePath: null, // 如 'data.data' 用于提取嵌套数据
          chartType: 'bar',
          title: '',
          nameKey: 'name',
          valueKey: 'value'
        }
      }
    },
    // 节点点击回调
    onNodeClick: {
      type: Function,
      default: null
    },
    // 节点右键回调
    onNodeRightClick: {
      type: Function,
      default: null
    },
    // 节点详情点击回调
    onNodeDetailClick: {
      type: Function,
      default: null
    },
    // 初始数据（如果使用静态数据源）
    initialData: {
      type: Object,
      default: null
    },
    // 图谱标题（可选，如果不提供则从数据中获取）
    graphTitle: {
      type: String,
      default: ''
    },
    // 图谱描述（可选，如果不提供则从数据中获取）
    description: {
      type: String,
      default: ''
    },
    // 搜索占位符
    searchPlaceholder: {
      type: String,
      default: '搜索节点...'
    },
    // 是否显示图表
    showChart: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      graphKey: null,
      internalGraphTitle: '',
      internalDescription: '',
      graph: null,
      graphData: {
        nodes: [], // 保持原有的节点数据
        links: []  // 保持原有的链接数据
      },
      dataFetcher: null,
      top5Chart: null,
      selectedFiles: null,
      isLoading: false,
      error: null,
      isBackendActive: false,
      selectedNode: null,
      searchQuery: '',
      searchResults: [],
      svgWidth: 300,
      svgHeight: 200,
      nodeRelations: {
        nodes: [],
        links: []
      },
      isEditing: false,
      editingNode: null,
      newAnnotation: '',
      newModifier: '',
      relationPanelPos: { x: 20, y: 20 },
      detailsPanelPos: { x: 20, y: window.innerHeight - 320 },
      metadataPanelPos: { x: window.innerWidth - 570, y: 20 },
      isDragging: false,
      currentPanel: null,
      dragOffset: { x: 0, y: 0 }
    }
  },
  computed: {
    // 从配置中获取节点颜色映射
    nodeColors() {
      const colors = {}
      if (this.nodeTypeConfig && this.nodeTypeConfig.types) {
        Object.keys(this.nodeTypeConfig.types).forEach(key => {
          colors[key] = this.nodeTypeConfig.types[key].color
        })
      }
      return colors
    },
    // 从配置中获取节点类型名称映射
    typeNames() {
      const names = {}
      if (this.nodeTypeConfig && this.nodeTypeConfig.types) {
        Object.keys(this.nodeTypeConfig.types).forEach(key => {
          names[key] = this.nodeTypeConfig.types[key].name
        })
      }
      return names
    },
    // 最终使用的标题
    finalGraphTitle() {
      return this.graphTitle || this.internalGraphTitle || '知识图谱'
    },
    // 最终使用的描述
    finalDescription() {
      return this.description || this.internalDescription || ''
    }
  },

  methods: {
    // 初始化数据获取器
    initDataFetcher() {
      this.dataFetcher = new DataFetcher({
        adapterConfig: this.dataSource.adapterConfig
      })
    },

    // 获取图谱数据
    async fetchGraphData() {
      this.isLoading = true
      this.error = null

      try {
        // 处理静态数据源
        if (this.dataSource.type === 'static') {
          const data = this.initialData || this.dataSource.data
          if (!data) {
            throw new Error('静态数据源需要提供 initialData 或 dataSource.data')
          }
          const adapted = this.dataFetcher.adapter.adapt(data)
          this.graphData = adapted
          this.internalGraphTitle = adapted.metadata?.graphTitle || adapted.metadata?.title || ''
          this.internalDescription = adapted.metadata?.description || adapted.metadata?.desc || ''
          this.initGraph()
          return
        }

        // 获取参数（从 URL、Props 或 Query）
        const params = {}
        if (this.dataSource.params) {
          Object.keys(this.dataSource.params).forEach(key => {
            const paramConfig = this.dataSource.params[key]
            if (typeof paramConfig === 'string') {
              params[key] = this.dataFetcher.getParamValue(
                paramConfig,
                this.dataSource.paramSource || 'url',
                this.$props,
                this.$route?.query
              )
            } else if (typeof paramConfig === 'object') {
              params[key] = this.dataFetcher.getParamValue(
                paramConfig.key || key,
                paramConfig.source || this.dataSource.paramSource || 'url',
                this.$props,
                this.$route?.query
              )
            }
          })
        }

        // 获取数据
        const adapted = await this.dataFetcher.fetchGraphData(
          this.dataSource,
          this.$props,
          this.$route?.query
        )

        this.graphData = adapted
        this.internalGraphTitle = adapted.metadata?.graphTitle || adapted.metadata?.title || ''
        this.internalDescription = adapted.metadata?.description || adapted.metadata?.desc || ''
        this.initGraph()
      } catch (error) {
        console.error('获取图谱数据失败:', error)
        this.error = '数据加载失败: ' + error.message
      } finally {
        this.isLoading = false
      }
    },

    // 获取图表数据
    async fetchChartData() {
      if (!this.chartConfig || !this.chartConfig.enabled) {
        return
      }

      try {
        // 获取图表参数
        const params = {}
        if (this.chartConfig.params) {
          Object.keys(this.chartConfig.params).forEach(key => {
            const paramConfig = this.chartConfig.params[key]
            if (typeof paramConfig === 'string') {
              params[key] = this.dataFetcher.getParamValue(
                paramConfig,
                this.chartConfig.paramSource || 'url',
                this.$props,
                this.$route?.query
              )
            } else if (typeof paramConfig === 'object') {
              params[key] = this.dataFetcher.getParamValue(
                paramConfig.key || key,
                paramConfig.source || this.chartConfig.paramSource || 'url',
                this.$props,
                this.$route?.query
              )
            }
          })
        }

        const chartData = await this.dataFetcher.fetchChartData(this.chartConfig, params)
        
        if (chartData) {
          // 处理响应路径
          let finalData = chartData
          if (this.chartConfig.responsePath) {
            finalData = this.dataFetcher.extractDataByPath(chartData, this.chartConfig.responsePath)
          }
          
          this.top5Chart = finalData
          if (this.top5Chart) {
            this.$nextTick(() => {
              this.initCharts()
            })
          }
        }
      } catch (error) {
        console.error('获取图表数据时出错:', error)
      }
    },

    // 节点右键点击处理
    handleNodeRightClick(node, event) {
      this.selectedNode = node
      
      // 优先使用传入的回调函数
      if (this.onNodeRightClick) {
        this.onNodeRightClick(node, event)
        return
      }

      // 如果没有回调，执行默认行为（保持向后兼容）
      console.log('右键点击节点:', node)
    },

    // 节点详情点击处理
    handleIn() {
      if (!this.selectedNode) return

      // 优先使用传入的回调函数
      if (this.onNodeDetailClick) {
        this.onNodeDetailClick(this.selectedNode)
        return
      }

      // 如果没有回调，执行默认行为
      console.log('点击节点详情:', this.selectedNode)
    },

    // 初始化
    async init() {
      this.initDataFetcher()
      await this.fetchGraphData()
      
      // 如果启用了图表，加载图表数据
      if (this.showChart && this.chartConfig && this.chartConfig.enabled) {
        await this.fetchChartData()
      }
    },
    initGraph() {
      
      if (this.graph) {
        // 如果已存在图形实例，先销毁它
        const container = document.getElementById('graph-container');
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }

      try {
        this.graph = ForceGraph3D()
          (document.getElementById('graph-container'))
          .graphData(this.graphData)
         
          .nodeLabel('name')
          .nodeColor(node => this.getNodeColor(node.group))
          .linkColor(() => 'rgba(180, 180, 180, 0.2)')
          .linkOpacity(0.4)
          .linkWidth(1)
          .linkDirectionalArrowLength(3)
          // .linkSource(link => link.source.id)  // 如果 source 是节点对象
          // .linkTarget(link => link.target.id)  // 如果 target 是节点对象
          .linkDirectionalArrowRelPos(1)
          .linkDirectionalArrowColor(() => 'rgba(180, 180, 180, 0.6)')
          .linkDirectionalParticles(1)
          .linkDirectionalParticleWidth(2)
          .linkDirectionalParticleColor(() => 'rgba(180, 180, 180, 0.8)')
          .linkDirectionalParticleSpeed(0.004)
          .onNodeClick(node => {
            this.selectedNode = node;
            this.focusNode(node);
            // 触发外部回调
            if (this.onNodeClick) {
              this.onNodeClick(node);
            }
          })
          .onBackgroundClick(() => {
            this.selectedNode = null;
          })
          .backgroundColor('#ffffff')
          .nodeRelSize(6)
          .onNodeRightClick((node, event) => { // 新增右击事件
        event.preventDefault(); // 阻止浏览器默认右键菜单
        this.handleNodeRightClick(node, event);
      })
          .linkLabel(link => `${link.type}: ${link.details}`) // 悬停提示
    .linkThreeObject(link => {
      // 创建3D文本标签
      const label = `${link.type}`;
      const textGeometry = new TextGeometry(label, {
        size: 3,
        height: 0.1
      });
      const textMaterial = new MeshBasicMaterial({ color: 0x666666 });
      const textMesh = new Mesh(textGeometry, textMaterial);
      
      // 计算中间位置
      const startPos = new Vector3(link.source.x, link.source.y, link.source.z);
      const endPos = new Vector3(link.target.x, link.target.y, link.target.z);
      const centerPos = new Vector3().lerpVectors(startPos, endPos, 0.5);
      
      textMesh.position.copy(centerPos);
      return textMesh;
    })
      } catch (error) {
        console.error('初始化图形时出错:', error);
        this.error = '初始化图形失败';
      }
    },
    getNodeColor(group) {
      // 从配置中获取颜色
      if (this.nodeColors[group]) {
        return this.nodeColors[group]
      }
      // 使用默认颜色
      return this.nodeTypeConfig?.defaultColor || '#666666'
    },
    zoomIn() {
      if (this.graph) {
        const distance = this.graph.cameraPosition().z;
        this.graph.cameraPosition({ z: distance * 0.8 });
      }
    },
    zoomOut() {
      if (this.graph) {
        const distance = this.graph.cameraPosition().z;
        this.graph.cameraPosition({ z: distance * 1.2 });
      }
    },
    resetView() {
      if (this.graph) {
        this.graph.cameraPosition({ x: 0, y: 0, z: 1000 });
      }
    },
    focusNode(node) {
      const distance = 100;
      const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
      this.graph.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
        node,
        1000
      );
      this.selectedNode.relatedLinks = this.graphData.links.filter(link => 
    link.source === node.id || link.target === node.id
  );
      this.calculateNodeRelations();
    },
    handleFileUpload(event) {
      this.selectedFiles = Array.from(event.target.files).filter(file => 
        file.name.endsWith('.java')
      );
    },
    handleFolderUpload(event) {
      this.selectedFiles = Array.from(event.target.files).filter(file => 
        file.name.endsWith('.java')
      );
      console.log(`找到 ${this.selectedFiles.length} 个Java文件`);
    },
    async checkBackendStatus() {
      try {
        const response = await fetch('http://localhost:3003/api/health', { 
          method: 'GET',
          timeout: 5000 
        });
        this.isBackendActive = response.ok;
      } catch (error) {
        this.isBackendActive = false;
        console.error('后端连接失败:', error);
      }
    },
    async uploadFiles() {
      if (!this.selectedFiles || this.selectedFiles.length === 0) {
        this.error = '请选择Java文件';
        return;
      }

      this.isLoading = true;
      this.error = null;
      const formData = new FormData();
      
      // 保持文件的目录结构
      for (let file of this.selectedFiles) {
        // 使用相对路径作为文件名
        const relativePath = file.webkitRelativePath || file.name;
        formData.append('files', file, relativePath);
      }

      try {
        const response = await fetch('http://localhost:3003/api/analyze', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(await response.text() || '上传失败');
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        this.graphData = data;
        
      } catch (error) {
        console.error('上传文件时出错:', error);
        this.error = '分析失败: ' + error.message;
      } finally {
        this.isLoading = false;
      }
    },
    handleSearch() {
      this.searchResults = this.graphData.nodes.filter(node => 
        node.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    focusSearchResult(node) {
      this.selectedNode = node;
      this.focusNode(node);
    },
    calculateNodeRelations() {
      if (!this.selectedNode || !this.graphData.links) return;
      
      // 获取直接相关的节点和连接
      const relatedLinks = this.graphData.links.filter(link => 
        link.source.id === this.selectedNode.id || link.target.id === this.selectedNode.id
      );
      
      const nodeIds = new Set();
      nodeIds.add(this.selectedNode.id);
      relatedLinks.forEach(link => {
        nodeIds.add(link.source.id);
        nodeIds.add(link.target.id);
      });

      const nodes = Array.from(nodeIds).map(id => {
        const node = this.graphData.nodes.find(n => n.id === id);
        return {
          ...node,
          x: 0,
          y: 0
        };
      });

      // 计算节点位置
      const centerX = this.svgWidth / 2;
      const centerY = this.svgHeight / 2;
      const radius = 80;
      const angleStep = (2 * Math.PI) / (nodes.length - 1);

      // 将选中的节点放在中心
      const centerNode = nodes.find(n => n.id === this.selectedNode.id);
      centerNode.x = centerX;
      centerNode.y = centerY;

      // 其他节点围绕中心节点均匀分布
      let currentAngle = 0;
      nodes.forEach(node => {
        if (node.id !== this.selectedNode.id) {
          node.x = centerX + radius * Math.cos(currentAngle);
          node.y = centerY + radius * Math.sin(currentAngle);
          currentAngle += angleStep;
        }
      });

      // 处连接
      const links = relatedLinks.map(link => ({
        source: nodes.find(n => n.id === link.source.id),
        target: nodes.find(n => n.id === link.target.id),
        isIncoming: link.target.id === this.selectedNode.id
      }));

      this.nodeRelations = { nodes, links };
    },
    getShortName(name) {
      // 返回类名的简短版本（去掉包名）
      return name.split('.').pop();
    },
    closeRelationPanel() {
      this.selectedNode = null;
      this.nodeRelations = { nodes: [], links: [] };
    },
    toggleEdit() {
      this.isEditing = true;
      this.editingNode = JSON.parse(JSON.stringify(this.selectedNode)); // 深拷贝
    },
    cancelEdit() {
      this.isEditing = false;
      this.editingNode = null;
      this.newAnnotation = '';
      this.newModifier = '';
    },
    addAnnotation() {
      if (this.newAnnotation.trim()) {
        if (!this.editingNode.annotations) {
          this.editingNode.annotations = [];
        }
        this.editingNode.annotations.push(this.newAnnotation.trim());
        this.newAnnotation = '';
      }
    },
    removeAnnotation(index) {
      this.editingNode.annotations.splice(index, 1);
    },
    addModifier() {
      if (this.newModifier.trim()) {
        if (!this.editingNode.modifiers) {
          this.editingNode.modifiers = [];
        }
        this.editingNode.modifiers.push(this.newModifier.trim());
        this.newModifier = '';
      }
    },
    removeModifier(index) {
      this.editingNode.modifiers.splice(index, 1);
    },
    saveChanges() {
      // 更新图中的节点数据
      const nodeIndex = this.graphData.nodes.findIndex(n => n.id === this.selectedNode.id);
      if (nodeIndex !== -1) {
        this.graphData.nodes[nodeIndex] = { 
          ...this.graphData.nodes[nodeIndex],
          ...this.editingNode
        };
        
        // 更选中的节点
        this.selectedNode = this.graphData.nodes[nodeIndex];
        
        // 重新初始化图形
        this.initGraph();
        
        // 聚焦到更新后的节点
        this.focusNode(this.selectedNode);
      }
      
      this.isEditing = false;
      this.editingNode = null;
      this.newAnnotation = '';
      this.newModifier = '';
    },
    startDrag(event, panelType) {
      // 只有点击标题栏才能拖动
      if (!event.target.closest('.drag-handle')) return;
      
      event.preventDefault();
      this.isDragging = true;
      this.currentPanel = panelType;
      
      const panel = event.currentTarget;
      const rect = panel.getBoundingClientRect();
      
      this.dragOffset = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      
      document.addEventListener('mousemove', this.handleDrag);
      document.addEventListener('mouseup', this.stopDrag);
    },
    handleDrag(event) {
      if (!this.isDragging) return;
      
      const newX = event.clientX - this.dragOffset.x;
      const newY = event.clientY - this.dragOffset.y;
      
      // 确保面板不会被拖出视窗
      const maxX = window.innerWidth - 100;
      const maxY = window.innerHeight - 100;
      
      const x = Math.min(Math.max(0, newX), maxX);
      const y = Math.min(Math.max(0, newY), maxY);
      
      // 更新对应面板的位置
      this[`${this.currentPanel}PanelPos`] = { x, y };
    },
    stopDrag() {
      this.isDragging = false;
      document.removeEventListener('mousemove', this.handleDrag);
      document.removeEventListener('mouseup', this.stopDrag);
    },
    initCharts() {
      
      if (!this.top5Chart || !this.top5Chart.top5WeekPoint) {
    console.warn('top5Chart 数据未加载完成');
    return;
  }
      // 销毁旧图表实例
      [ this.weekChart]
        .forEach(chart => chart && chart.dispose());

      // 初始化四个图表
    
     
      const chartTitle = this.chartConfig.title || '数据统计';
      const nameKey = this.chartConfig.nameKey || 'name';
      const chartDataKey = this.chartConfig.dataKey || 'top5WeekPoint';
      
      if (this.top5Chart[chartDataKey]) {
        this.initChart('weekChart', this.top5Chart[chartDataKey], chartTitle, nameKey);
      }
     
    },

    initChart(domId, chartData, title, nameKey) {
      const chartDom = document.getElementById(domId);
      if (!chartDom) return;
      
      const myChart = echarts.init(chartDom);
      const colors = {
        popupChart: '#6ec6ff',
        consolidationChart: '#4dd0e1',
        weekChart: '#ff8a65',
        relationChart: '#aed581'
      };
      
      // 使用配置中的颜色
      const chartColor = this.chartConfig.chartColor || colors[domId] || colors.weekChart;
      
      // 确保数据存在且格式正确
      if (!chartData?.list || !chartData.numberList) return;

      const names = chartData.list.map(item => item[nameKey || this.chartConfig.nameKey || 'name']);
      const values = chartData.numberList.split(',').map(Number);

      const option = {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: '600',
          color: '#2c3e50'
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderColor: '#eee',
        borderWidth: 1,
        textStyle: {
          color: '#666'
        }
      },
      xAxis: {
        type: 'category',
        data: names,
        axisLabel: {
          fontSize: 12,
          color: '#666',
          interval: 0
        },
        axisLine: {
          lineStyle: {
            color: '#e0e0e0'
          }
        },
        axisTick: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          fontSize: 12,
          color: '#666'
        },
        splitLine: {
          lineStyle: {
            color: '#f5f5f5'
          }
        }
      },
      series: [{
        data: values,
        type: 'bar',
        barWidth: '60%',
        itemStyle: {
          color: chartColor,
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.1)'
          }
        }
      }],
      grid: {
        left: '3%',
        right: '3%',
        bottom: '8%',
        containLabel: true
      }
    };

      myChart.setOption(option);
      
      // 保存图表实例引用
      switch(domId) {
        case 'popupChart': this.popupChart = myChart; break;
        case 'consolidationChart': this.consolidationChart = myChart; break;
        case 'weekChart': this.weekChart = myChart; break;
        case 'relationChart': this.relationChart = myChart; break;
      }
    }
  },

 

  mounted() {
    this.init();
  },
  beforeDestroy() {
    // 清理事件监听
    document.removeEventListener('mousemove', this.handleDrag);
    document.removeEventListener('mouseup', this.stopDrag);
    [  this.weekChart]
      .forEach(chart => chart && chart.dispose());
  },
  
}
</script>

<style scoped>
.chart-row {
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.chart-card {
  border-radius: 8px;
  transition: all 0.3s;
  border: 1px solid #ebeef5;
  
  &:hover {
    box-shadow: 0 4px 18px rgba(0,0,0,0.08);
  }
  
  ::v-deep .el-card__body {
    padding: 16px;
    height: 440px;
  }
}

.chart {
  height: 400px;
}

@media (max-width: 768px) {
  .chart-card {
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .search-card {
    ::v-deep .el-form-item {
      width: 100%;
      margin-right: 0;
    }
  }
}
.knowledge-graph {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #ffffff;
}

#graph-container {
  width: 100%;
  height: 100%;
}

.control-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 280px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.panel-header {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #2c3e50;
  text-align: center;
}
.panel-body{
  font-size: 12px;

  margin-bottom: 20px;
  color: #2c3e50;
  text-align: center;
}

.search-section {
  margin-bottom: 20px;
  position: relative;
}

.search-box {
  position: relative;
  width: 82%;
}

.search-box input[type="text"] {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid #edf2f7;
  border-radius: 12px;
  font-size: 14px;
  color: #2d3748;
  transition: all 0.3s ease;
  background-color: #f8fafc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.search-box input[type="text"]:focus {
  border-color: #4ecdc4;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.1);
  outline: none;
}

.search-box input[type="text"]::placeholder {
  color: #a0aec0;
  font-size: 13px;
}

.search-icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: 16px;
  pointer-events: none;
  transition: color 0.3s ease;
}

.search-box input[type="text"]:focus + .search-icon {
  color: #4ecdc4;
}

.search-results {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 8px 0;
  max-height: 280px;
  overflow-y: auto;
  z-index: 1000;
  border: 1px solid #edf2f7;
}

.search-result-item {
  padding: 10px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 4px;
  border-radius: 8px;
}

.search-result-item:hover {
  background-color: #f7fafc;
  transform: translateX(2px);
}

.search-result-item:active {
  background-color: #edf2f7;
  transform: translateX(0);
}

.result-name {
  font-size: 14px;
  color: #2d3748;
  font-weight: 500;
  margin-right: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
}

.result-type {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
  background-color: #edf2f7;
  color: #4a5568;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.search-result-item:hover .result-type {
  background-color: #e2e8f0;
}

.upload-section {
  margin-bottom: 20px;
}

.file-info {
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}

.upload-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.upload-button {
  flex: 1;
  padding: 10px;
  background: #4ecdc4;
  color: white;
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
  transition: background 0.3s;
}

.upload-button.folder {
  background: #45b7d1;
}

.upload-button:hover {
  background: #45b7a7;
}

.upload-button.folder:hover {
  background: #3da1b9;
}

.upload-button input[type="file"] {
  display: none;
}

.analyze-button {
  width: 100%;
  padding: 10px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.analyze-button:hover:not(:disabled) {
  background: #ff5252;
}

.analyze-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.view-controls {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.view-controls button {
  padding: 8px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.view-controls button:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.legend {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.legend-title {
  font-weight: bold;
  margin-bottom: 10px;
  color: #2c3e50;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.type-name {
  font-size: 14px;
  color: #495057;
}

.error-message {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #dc3545;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.close-error {
  margin-left: 12px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 18px;
}


.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}


@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.icon {
  margin-right: 6px;
}

.node-details {
  position: absolute;
  left: 20px;
  bottom: 20px;
  width: 300px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 15px;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.details-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-details {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.detail-item {
  margin-bottom: 10px;
}

.annotation-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
}

.annotation {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.modifier {
  margin-right: 8px;
  color: #6c757d;
}

.metadata-panel {
  position: absolute;
  right: 320px;
  top: 20px;
  width: 250px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 15px;
}

.metadata-header {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #2c3e50;
}

.metadata-section {
  margin-bottom: 15px;
}

.metadata-section h4 {
  margin: 0 0 8px 0;
  color: #495057;
  font-size: 14px;
}

.metadata-section ul {
  margin: 0;
  padding-left: 20px;
  color: #6c757d;
  font-size: 13px;
}

.metadata-section li {
  margin-bottom: 4px;
}

.node-relation-panel {
  position: absolute;
  left: 20px;
  top: 20px;
  width: 340px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 15px;
  z-index: 100;
}

.node-relation-panel .panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.node-relation-panel .panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #2c3e50;
}

.close-panel {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 0;
}

.relation-svg-container {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.node {
  cursor: pointer;
}

.node circle {
  transition: all 0.3s;
}

.node.is-selected circle {
  stroke: #2c3e50;
  stroke-width: 2px;
}

.node text {
  pointer-events: none;
  user-select: none;
}

.links line {
  stroke: #999;
  stroke-opacity: 0.6;
  stroke-width: 1px;
}

.links line.is-incoming {
  stroke: #666;
  stroke-dasharray: 3,3;
}

.header-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.edit-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.edit-button:hover {
  background-color: #f0f0f0;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: 500;
  color: #2c3e50;
}

.form-group input,
.form-group select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #4ecdc4;
  outline: none;
}

.tags-input {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.annotation.editable,
.modifier.editable {
  display: flex;
  align-items: center;
  gap: 4px;
}

.remove-tag {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0 2px;
  font-size: 12px;
}

.remove-tag:hover {
  color: #dc3545;
}

.edit-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.save-button,
.cancel-button {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.save-button {
  background-color: #4ecdc4;
  color: white;
}

.save-button:hover {
  background-color: #45b7a7;
}

.cancel-button {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
}

.cancel-button:hover {
  background-color: #e9ecef;
}

/* 添加滚动条样式 */
.search-results::-webkit-scrollbar {
  width: 6px;
}

.search-results::-webkit-scrollbar-track {
  background: #f7fafc;
  border-radius: 3px;
}

.search-results::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.search-results::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* 添加搜索结果为空时的提示样式 */
.search-results:empty::after {
  content: '无搜索结果';
  display: block;
  text-align: center;
  padding: 12px;
  color: #a0aec0;
  font-size: 13px;
}

/* 修改相关面板的样式 */
.node-relation-panel,
.node-details,
.metadata-panel {
  position: absolute;
  user-select: none;
  z-index: 100;
}

.drag-handle {
  cursor: move;
  user-select: none;
}

/* 拖动时的样式 */
.node-relation-panel:active,
.node-details:active,
.metadata-panel:active {
  opacity: 0.95;
  transition: none;
}
</style> 