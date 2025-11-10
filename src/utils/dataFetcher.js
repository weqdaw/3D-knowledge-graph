import axios from 'axios'
import { GraphDataAdapter } from './dataAdapter'

/**
 * 数据获取器 - 支持多种数据源类型
 */
export class DataFetcher {
  constructor(config) {
    this.config = config
    this.adapter = new GraphDataAdapter(config.adapterConfig)
  }

  /**
   * 从 URL 获取参数
   */
  getUrlParam(key) {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get(key)
  }

  /**
   * 从 Props 获取参数
   */
  getPropParam(key, props) {
    return props && props[key]
  }

  /**
   * 从 Query 对象获取参数
   */
  getQueryParam(key, query) {
    return query && query[key]
  }

  /**
   * 获取参数值（支持多种来源）
   */
  getParamValue(key, source, props = null, query = null) {
    if (source === 'url') {
      return this.getUrlParam(key)
    } else if (source === 'props') {
      return this.getPropParam(key, props)
    } else if (source === 'query') {
      return this.getQueryParam(key, query)
    }
    return null
  }

  /**
   * 构建 API URL
   */
  buildApiUrl(config, params = {}) {
    let url = config.url || config.baseUrl || ''
    
    // 处理路径参数
    if (config.pathParams) {
      Object.keys(config.pathParams).forEach(key => {
        const value = params[config.pathParams[key]] || config.pathParams[key]
        url = url.replace(`:${key}`, value).replace(`{${key}}`, value)
      })
    }

    // 处理查询参数
    if (config.queryParams) {
      const queryString = Object.keys(config.queryParams)
        .map(key => {
          const paramKey = config.queryParams[key]
          const value = params[paramKey] || config.queryParams[key]
          return `${key}=${encodeURIComponent(value)}`
        })
        .join('&')
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString
      }
    }

    return url
  }

  /**
   * 从 API 获取数据
   */
  async fetchFromAPI(config, params = {}) {
    try {
      const url = this.buildApiUrl(config, params)
      const method = config.method || 'GET'
      const headers = config.headers || {}
      const requestConfig = {
        method,
        url,
        headers,
        ...config.axiosConfig
      }

      // 处理 POST 数据
      if (method === 'POST' && config.data) {
        requestConfig.data = config.data
      }

      const response = await axios(requestConfig)
      
      // 处理响应数据提取
      if (config.responsePath) {
        return this.extractDataByPath(response.data, config.responsePath)
      }
      
      return response.data
    } catch (error) {
      console.error('API 请求失败:', error)
      throw new Error(`数据获取失败: ${error.message}`)
    }
  }

  /**
   * 从路径提取数据（如 data.data）
   */
  extractDataByPath(obj, path) {
    const keys = path.split('.')
    let result = obj
    for (const key of keys) {
      if (result && typeof result === 'object') {
        result = result[key]
      } else {
        return null
      }
    }
    return result
  }

  /**
   * 获取图谱数据
   */
  async fetchGraphData(dataSource, props = null, query = null) {
    if (!dataSource || !dataSource.type) {
      throw new Error('数据源配置无效：缺少 type 字段')
    }

    let rawData = null

    switch (dataSource.type) {
      case 'api':
        // 获取参数
        const params = {}
        if (dataSource.params) {
          Object.keys(dataSource.params).forEach(key => {
            const paramConfig = dataSource.params[key]
            if (typeof paramConfig === 'string') {
              // 简单配置：直接使用值或从指定来源获取
              params[key] = this.getParamValue(paramConfig, dataSource.paramSource || 'url', props, query)
            } else if (typeof paramConfig === 'object') {
              // 复杂配置：{ key: 'id', source: 'url' }
              params[key] = this.getParamValue(
                paramConfig.key || key,
                paramConfig.source || dataSource.paramSource || 'url',
                props,
                query
              )
            }
          })
        }

        rawData = await this.fetchFromAPI(dataSource, params)
        break

      case 'static':
        rawData = dataSource.data
        break

      case 'function':
        if (typeof dataSource.fetch !== 'function') {
          throw new Error('数据源类型为 function 时，必须提供 fetch 函数')
        }
        rawData = await dataSource.fetch(props, query)
        break

      case 'websocket':
        // WebSocket 需要特殊处理，这里先返回初始数据
        if (dataSource.initialData) {
          rawData = dataSource.initialData
        }
        // WebSocket 连接逻辑应该在组件中处理
        break

      default:
        throw new Error(`不支持的数据源类型: ${dataSource.type}`)
    }

    // 使用适配器转换数据
    return this.adapter.adapt(rawData)
  }

  /**
   * 获取图表数据
   */
  async fetchChartData(chartConfig, params = {}) {
    if (!chartConfig || !chartConfig.enabled) {
      return null
    }

    if (chartConfig.type === 'api') {
      return await this.fetchFromAPI(chartConfig, params)
    } else if (chartConfig.type === 'static') {
      return chartConfig.data
    } else if (chartConfig.type === 'function' && typeof chartConfig.fetch === 'function') {
      return await chartConfig.fetch(params)
    }

    return null
  }
}

