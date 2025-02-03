<template>
  <NavBar />

  <!-- 主要内容区域 -->
  <router-view></router-view>

  <!-- 特殊页面的命名视图出口 -->
  <router-view name="special"></router-view>
</template>

<script setup lang="ts">
import NavBar from './components/navbar/Navbar.vue';
</script>

<style>
body {
  padding: 0;
  margin: 0;
}
</style>
