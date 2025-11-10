/**
 * 数据适配器 - 将不同格式的数据转换为组件需要的统一格式
 */
export class GraphDataAdapter {
  constructor(config = {}) {
    this.config = {
      // 节点字段映射配置
      nodeMapping: {
        id: ['id', 'nodeId', 'key'],
        name: ['name', 'label', 'title', 'text'],
        group: ['group', 'type', 'category', 'level'],
        description: ['description', 'desc', 'detail'],
        ...config.nodeMapping
      },
      // 链接字段映射配置
      linkMapping: {
        source: ['source', 'from', 'start'],
        target: ['target', 'to', 'end'],
        type: ['type', 'relation', 'relationship', 'edgeType'],
        details: ['details', 'label', 'name', 'description'],
        ...config.linkMapping
      },
      ...config
    }
  }

  /**
   * 从对象中获取值，支持多个可能的字段名
   */
  getValue(obj, possibleKeys, defaultValue = '') {
    for (const key of possibleKeys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        return obj[key]
      }
    }
    return defaultValue
  }

  /**
   * 适配单个节点数据
   */
  adaptNode(rawNode) {
    const mapping = this.config.nodeMapping
    return {
      id: this.getValue(rawNode, mapping.id),
      name: this.getValue(rawNode, mapping.name),
      group: this.getValue(rawNode, mapping.group),
      description: this.getValue(rawNode, mapping.description),
      // 保留原始数据中的其他字段
      ...rawNode
    }
  }

  /**
   * 适配节点数组
   */
  adaptNodes(rawNodes) {
    if (!Array.isArray(rawNodes)) {
      return []
    }
    return rawNodes.map(node => this.adaptNode(node))
  }

  /**
   * 适配单个链接数据
   */
  adaptLink(rawLink, nodeMap) {
    const mapping = this.config.linkMapping
    
    // 处理 source 和 target，可能是 ID 或对象
    let source = this.getValue(rawLink, mapping.source)
    let target = this.getValue(rawLink, mapping.target)
    
    // 如果是对象，提取 ID
    if (typeof source === 'object' && source !== null) {
      source = source.id || source.nodeId || source
    }
    if (typeof target === 'object' && target !== null) {
      target = target.id || target.nodeId || target
    }

    return {
      source: source,
      target: target,
      type: this.getValue(rawLink, mapping.type),
      details: this.getValue(rawLink, mapping.details),
      // 保留原始数据中的其他字段
      ...rawLink
    }
  }

  /**
   * 适配链接数组
   */
  adaptLinks(rawLinks, nodeMap = {}) {
    if (!Array.isArray(rawLinks)) {
      return []
    }
    return rawLinks.map(link => this.adaptLink(link, nodeMap))
  }

  /**
   * 完整数据适配
   * @param {Object} rawData - 原始数据
   * @returns {Object} 适配后的数据 { nodes: [], links: [], metadata: {} }
   */
  adapt(rawData) {
    if (!rawData) {
      return { nodes: [], links: [], metadata: {} }
    }

    // 处理不同的数据格式
    let nodes = []
    let links = []
    let metadata = {}

    // 如果数据已经是标准格式
    if (rawData.nodes && rawData.links) {
      nodes = this.adaptNodes(rawData.nodes)
      links = this.adaptLinks(rawData.links)
      metadata = rawData.metadata || {}
    }
    // 如果数据使用 vertices 和 edges
    else if (rawData.vertices && rawData.edges) {
      nodes = this.adaptNodes(rawData.vertices)
      links = this.adaptLinks(rawData.edges)
      metadata = rawData.metadata || {}
    }
    // 如果数据是数组格式 [nodes, links]
    else if (Array.isArray(rawData) && rawData.length === 2) {
      nodes = this.adaptNodes(rawData[0])
      links = this.adaptLinks(rawData[1])
    }
    // 如果数据直接包含在 data 字段中
    else if (rawData.data) {
      return this.adapt(rawData.data)
    }
    // 其他格式，尝试直接适配
    else {
      nodes = this.adaptNodes(rawData.nodes || rawData.vertices || [])
      links = this.adaptLinks(rawData.links || rawData.edges || [])
      metadata = rawData.metadata || rawData.info || {}
    }

    return {
      nodes,
      links,
      metadata
    }
  }
}

/**
 * 默认数据适配器实例
 */
export const defaultAdapter = new GraphDataAdapter()

