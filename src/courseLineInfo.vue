<template>
  <div class="app-container">
    <!-- 标题 -->
    <div class="title-container">
      <h1 class="course-title">{{ menuInfo.courseMenuName }}</h1>
      <div class="tech-line"></div>
    </div>

    <!-- 选项卡 -->
    <el-card class="info-card">
      <el-tabs v-model="activeTab" class="dark-tabs">
        <el-tab-pane label="课程描述" name="description">
          <div class="description-content">
            <div class="tech-border">
              {{ menuInfo.description }}
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="相关信息" name="informations">
          <div class="information-container">
            <transition-group name="list">
              <div 
                v-for="(info, index) in formattedInformations"
                :key="info"  
                class="information-item"
                :style="getItemStyle(index)"
              >
                {{ info }}
                <div class="tech-glow"></div>
              </div>
            </transition-group>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 数据可视化 -->
    <div class="chart-container">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="chart-card">
            <div class="chart-header">完成情况分析</div>
            <div ref="completedChart" class="chart"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card class="chart-card">
            <div class="chart-header">掌握程度分析</div>
            <div ref="masteryChart" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <!-- 装饰元素 -->
    <div class="tech-decoration top-left"></div>
    <div class="tech-decoration bottom-right"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { menuInfo } from './api/neo4j/graphJsonData'

export default {
  data() {
    return {
      id: '',
      menuInfo: {
        courseMenuName: '高级数据结构与算法',
        description: '本课程深入探讨了高级数据结构和算法设计的核心概念与实践应用。通过系统学习树结构、图算法、动态规划等高级主题，培养学生解决复杂问题的能力。课程注重理论与实践结合，包含大量编程练习和项目实践。',
        informations: '课程难度:高级,学时:48课时,适合人群:计算机专业学生,先修要求:基础编程能力,考核方式:项目+考试',
        completedRate: 0.78,
        completedFloorRate: 0.65,
        completedCeilingRate: 0.92,
        masteryRate: 0.72,
        masteryFloorRate: 0.58,
        masteryCeilingRate: 0.88
      },
      activeTab: 'description',
      completedChart: null,
      masteryChart: null
    }
  },
  computed: {
    formattedInformations() {
      return this.menuInfo.informations ? this.menuInfo.informations.split(',') : []
    }
  },
  created() {
    this.id = this.$route.query.id
    console.log(this.id)
    // 模拟数据，实际使用时取消下行注释
    // this.getList()
    this.$nextTick(() => {
      this.initCharts()
    })
  },
  methods: {
    getList() {
      menuInfo(this.id).then(response => {
        this.menuInfo = response.data
        this.$nextTick(() => {
          this.initCharts()
        })
      })
    },
    getItemStyle(index) {
      const directions = [
        { transform: 'translateX(-100%)' },
        { transform: 'translateX(100%)' },
        { transform: 'translateY(-100%)' },
        { transform: 'translateY(100%)' }
      ]
      return directions[index % 4]
    },
    initCharts() {
      // 设置暗色主题
      const darkTheme = {
        backgroundColor: 'transparent',
        textStyle: {
          color: '#ecf5ff'
        },
        title: {
          textStyle: {
            color: '#ecf5ff'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 21, 42, 0.8)',
          borderColor: '#4facfe',
          textStyle: {
            color: '#ecf5ff'
          }
        }
      }

      // 完成率环形图
      this.completedChart = echarts.init(this.$refs.completedChart)
      const completedOption = {
        ...darkTheme,
        title: {
          text: '完成情况',
          left: 'center',
          top: 0,
          textStyle: {
            fontSize: 16,
            fontWeight: 'normal',
            color: '#ecf5ff'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: params => {
            return `${params.name}: ${(params.value * 100).toFixed(1)}%`
          }
        },
        series: [{
          name: '完成率',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            color: '#ecf5ff',
            formatter: params => {
              return `${params.name}\n${(params.value * 100).toFixed(1)}%`
            }
          },
          data: [
            {
              value: this.menuInfo.completedFloorRate,
              name: '最低完成率',
              itemStyle: {color: '#36a3eb'}
            },
            {
              value: this.menuInfo.completedRate,
              name: '平均完成率',
              itemStyle: {color: '#4facfe'}
            },
            {
              value: this.menuInfo.completedCeilingRate,
              name: '最高完成率',
              itemStyle: {color: '#00f2fe'}
            }
          ],
          itemStyle: {
            borderRadius: 10,
            borderColor: '#0f152a',
            borderWidth: 2
          }
        }]
      }

      // 掌握率环形图
      this.masteryChart = echarts.init(this.$refs.masteryChart)
      const masteryOption = {
        ...darkTheme,
        title: {
          text: '掌握情况',
          left: 'center',
          top: 0,
          textStyle: {
            fontSize: 16,
            fontWeight: 'normal',
            color: '#ecf5ff'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: params => {
            return `${params.name}: ${(params.value * 100).toFixed(1)}%`
          }
        },
        series: [{
          name: '掌握率',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            color: '#ecf5ff',
            formatter: params => {
              return `${params.name}\n${(params.value * 100).toFixed(1)}%`
            }
          },
          data: [
            {
              value: this.menuInfo.masteryFloorRate,
              name: '最低掌握率',
              itemStyle: {color: '#7367f0'}
            },
            {
              value: this.menuInfo.masteryRate,
              name: '平均掌握率',
              itemStyle: {color: '#a866ef'}
            },
            {
              value: this.menuInfo.masteryCeilingRate,
              name: '最高掌握率',
              itemStyle: {color: '#e039fd'}
            }
          ],
          itemStyle: {
            borderRadius: 10,
            borderColor: '#0f152a',
            borderWidth: 2
          }
        }]
      }

      this.completedChart.setOption(completedOption)
      this.masteryChart.setOption(masteryOption)
    }},
  beforeDestroy() {
    if (this.completedChart) {
      this.completedChart.dispose()
    }
    if (this.masteryChart) {
      this.masteryChart.dispose()
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
  background-color: #0f152a;
  color: #ecf5ff;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(79, 172, 254, 0.05) 0%, rgba(0, 242, 254, 0.05) 100%),
    linear-gradient(rgba(10, 15, 30, 0.8) 2px, transparent 2px),
    linear-gradient(90deg, rgba(10, 15, 30, 0.8) 2px, transparent 2px);
  background-size: 100% 100%, 30px 30px, 30px 30px;
  background-position: 0 0, 0 0, 0 0;
}

.title-container {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
}

.course-title {
  text-align: center;
  margin-bottom: 10px;
  color: #ecf5ff;
  font-size: 2rem;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(79, 172, 254, 0.5);
  letter-spacing: 1px;
}

.tech-line {
  height: 3px;
  width: 200px;
  background: linear-gradient(90deg, transparent, #4facfe, #00f2fe, transparent);
  margin: 0 auto;
}

.info-card {
  margin-bottom: 20px;
  background-color: rgba(25, 35, 60, 0.7);
  border: 1px solid #2a385a;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.1);
  backdrop-filter: blur(5px);
}

.dark-tabs :deep(.el-tabs__item) {
  color: #8e9dbd;
}

.dark-tabs :deep(.el-tabs__item.is-active) {
  color: #4facfe;
}

.dark-tabs :deep(.el-tabs__active-bar) {
  background-color: #4facfe;
}

.description-content {
  padding: 20px;
  line-height: 1.8;
  color: #c0ccda;
}

.tech-border {
  padding: 15px;
  border: 1px solid rgba(79, 172, 254, 0.3);
  border-radius: 8px;
  position: relative;
  background: rgba(25, 35, 60, 0.3);
}

.tech-border::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #4facfe, transparent, #00f2fe, transparent);
  z-index: -1;
  border-radius: 9px;
  animation: borderGlow 3s linear infinite;
}

.information-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
}

.information-item {
  background: rgba(37, 45, 71, 0.7);
  padding: 12px 24px;
  border-radius: 20px;
  border: 1px solid rgba(79, 172, 254, 0.3);
  position: relative;
  overflow: hidden;
  animation: slideIn 0.5s ease forwards;
  box-shadow: 0 0 15px rgba(0, 242, 254, 0.1);
  transition: all 0.3s ease;
}

.information-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 242, 254, 0.2);
}

.tech-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent, rgba(79, 172, 254, 0.05), transparent);
  animation: shimmer 2s infinite;
}

.chart-container {
  margin-top: 30px;
}

.chart-card {
  margin-bottom: 20px;
  background-color: rgba(25, 35, 60, 0.7);
  border: 1px solid #2a385a;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 242, 254, 0.1);
  position: relative;
  overflow: hidden;
}

.chart-header {
  font-size: 1.1rem;
  padding: 15px;
  color: #4facfe;
  border-bottom: 1px solid rgba(79, 172, 254, 0.3);
  text-align: center;
  font-weight: 500;
}

.chart {
  width: 100%;
  height: 400px;
  padding: 10px;
}

.list-enter-active {
  transition: all 0.5s ease;
}

.list-enter {
  opacity: 0;
  transform: translateY(30px);
}

.tech-decoration {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  z-index: -1;
}

.top-left {
  top: -50px;
  left: -50px;
  background: #00f2fe;
}

.bottom-right {
  bottom: -50px;
  right: -50px;
  background: #7367f0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes borderGlow {
  0% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 0.2;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) rotate(45deg);
  }
}

/* 响应式布局 */
@media (max-width: 768px) {
  .el-col {
    width: 100%;
    margin-bottom: 20px;
  }
}
</style>