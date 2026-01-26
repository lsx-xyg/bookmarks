// src/router/index.ts
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw
} from 'vue-router';
import Home from '../views/Home.vue';
import NavigationPage from '../views/NavigationPage.vue';
import SearchPage from '../views/SearchPage.vue';
import AdminPage from '../views/AdminPage.vue';
import SpecialComponent from '../views/SpecialComponent.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/navigation'
  },
  {
    path: '/navigation',
    name: 'Navigation',
    component: NavigationPage
  },
  {
    path: '/search',
    name: 'Search',
    component: SearchPage
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPage
  },
  {
    path: '/special-page',
    name: 'Special',
    components: {
      default: Home, // 默认显示的组件
      special: SpecialComponent // 只在这个路径下显示的组件
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
