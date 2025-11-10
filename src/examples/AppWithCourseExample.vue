<template>
  <div id="app">
    <!-- 使用课程知识图谱示例 -->
    <CourseGraphExample />
  </div>
</template>

<script>
import CourseGraphExample from './CourseGraphExample.vue'

export default {
  name: 'App',
  components: {
    CourseGraphExample
  }
}
</script>

<style>
#app {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  background-color: #ffffff;
}
</style>

