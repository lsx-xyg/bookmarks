<template>
  <div class="site-list-container">
    <div v-for="(site, index) in siteList" :key="index" class="site-item">
      <Site
        :site="site"
        @click="handleClick(site.url)"
        @mouseenter="handleMouseEnter"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import Site from './Site.vue';
import data from '../../data/urls.json';
import type { SITE } from '../../models/Site';

const siteList = reactive<SITE[]>([]);

onMounted(() => {
  Object.assign(siteList, data);
});

// @ts-ignore
const myAudio = new Audio(
  new URL('../../data/audio/a.mp3', import.meta.url).href
);

const handleClick = (url: string) => {
  window.open(url, '_blank'); // 在新标签页打开链接
};

const handleMouseEnter = () => {
  // myAudio.play();
};
</script>

<style scoped>
.site-list-container {
  margin-top: 5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem; /* 设置元素之间的间距 */
  padding: 1rem;
  justify-content: center;
}

.site-item {
  flex: 0 0 calc(20% - 1rem); /* 默认每行五个项目，减去间距 */
  max-width: calc(20% - 1rem);
  box-sizing: border-box;
  margin-right: 2rem;
  margin-bottom: 1rem; /* 添加底部间距 */
  cursor: pointer;
}

/* Media queries for responsiveness */
@media (max-width: 1200px) {
  .site-item {
    flex: 0 0 calc(25% - 1rem); /* 每行四个项目 */
    max-width: calc(25% - 1rem);
  }
}

@media (max-width: 992px) {
  .site-item {
    flex: 0 0 calc(33.3333% - 1rem); /* 每行三个项目 */
    max-width: calc(33.3333% - 1rem);
  }
}

@media (max-width: 768px) {
  .site-item {
    flex: 0 0 calc(50% - 1rem); /* 每行两个项目 */
    max-width: calc(50% - 1rem);
  }
}

@media (max-width: 576px) {
  .site-item {
    flex: 0 0 100%; /* 每行一个项目 */
    max-width: 100%;
  }
}
</style>
