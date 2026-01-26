<!-- src/components/navbar/Navbar.vue -->
<template>
  <div class="navbar">
    <div
      :class="['nav-item', 'logo', { active: isActive('/') }]"
      @click="navigate('/')"
    >
      <!-- 这里可以放置一个图标 -->
      <img src="/dog-fish.png" alt="Logo Icon" />
    </div>
    <div
      :class="['nav-item', 'nav-page', { active: isActive('/navigation') }]"
      @click="navigate('/navigation')"
    >
      <!-- 导航页链接 -->
      <a href="#">导航页</a>
    </div>
    <div
      :class="['nav-item', 'search-page', { active: isActive('/search') }]"
      @click="navigate('/search')"
    >
      <!-- 搜索页链接 -->
      <a href="#">搜索页</a>
    </div>
    <div
      :class="['nav-item', 'admin-page', { active: isActive('/admin') }]"
      @click="navigate('/admin')"
    >
      <!-- 后台页链接 -->
      <a href="#">后台页</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// 当前页面的路径
const currentPath = ref<string>(route.path);

// 检查是否为当前页面
const isActive = (path: string) => {
  return currentPath.value === path;
};

// 导航函数
const navigate = (path: string) => {
  router.push(path);
};

onMounted(() => {
  // 监听路由变化，更新当前路径
  router.afterEach((to) => {
    currentPath.value = to.path;
  });
});
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between; /* 确保项目之间有空间 */
  align-items: center;
  width: 100%;
  height: 64px;
  /* margin-bottom: 3rem; */
  background-color: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.175);

  position: fixed;
  top: 0;
  z-index: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  flex-grow: 1; /* 让每个项目都尽量占用可用空间 */
  height: 100%; /* 确保每个项目的高度与导航栏一致 */
  position: relative;
  transition: background-color 0.3s ease;
}

.nav-item.logo img {
  width: 64px;
  height: 64px;
}

.nav-item a {
  text-decoration: none;
  color: inherit;
  display: block;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

/* 下划线光效 */
.nav-item a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #007bff; /* 下划线的颜色 */
  transition: width 0.3s ease;
}

.nav-item a:hover::after {
  width: 100%;
}

/* 背景色悬浮效果 */
.nav-item:hover {
  background-color: rgba(0, 0, 0, 0.05); /* 悬浮时的背景颜色 */
}

/* 激活状态 */
.nav-item.active {
  background-color: rgba(0, 0, 0, 0.1); /* 激活时的背景颜色 */
  font-weight: bold;
}

/* 特殊处理Logo项，避免不必要的悬浮效果 */
.nav-item.logo {
  flex-grow: 0; /* Logo不扩展 */
  padding: 0; /* 去掉内边距 */
}
</style>
