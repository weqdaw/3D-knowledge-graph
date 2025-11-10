// router/index.js
import Vue from 'vue';
import VueRouter from 'vue-router';
import CourseLineInfo from '../courseLineInfo.vue';

Vue.use(VueRouter);

export default new VueRouter({
   mode: 'history',
  routes: [
    
    {
      path: '/graph/courseLineInfo',
      name: 'CourseLineInfo',
      component: CourseLineInfo,
    },
    // 其他路由配置
  ],
});