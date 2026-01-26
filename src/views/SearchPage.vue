<template>
  <div class="search-component">
    <h1>搜索平台</h1>
    <div class="floating-search-box">
      <label
        for="search-input"
        style="display: none;"
        :class="{ 'floating-label': searchQuery || isFocused }"
        >请输入平台名称...</label
      >
      <input
        type="text"
        v-model="searchQuery"
        placeholder=""
        @input="filterPlatforms"
        class="search-input"
        id="search-input"
        ref="searchInput"
        @focus="onFocus"
        @blur="onBlur"
      />
      
      <button class="search-button" @click="filterPlatforms()">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
        >
          <path
            d="M15.5 14h-.79l-.28-.28A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.28.28v.79l5 5-5 5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
          />
        </svg>
      </button>
    </div>
    <ul v-if="filteredPlatforms.length">
      <li v-for="platform in filteredPlatforms" :key="platform.platform">
        <Site :site="platform" @click="onSiteClick" />
      </li>
    </ul>
    <p v-else-if="searchQuery">未找到 "{{ searchQuery }}" 的结果</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import type { SITE } from '../models/Site';
import data from '../data/urls.json';
import Site from '../components/site/Site.vue';

const searchQuery = ref('');
const platforms = ref<SITE[]>([]);
const filteredPlatforms = ref<SITE[]>([]);
const isFocused = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);

const fetchPlatforms = async () => {
  platforms.value = data;
  filteredPlatforms.value = []; // 初始时不显示任何结果
};

const filterPlatforms = () => {
  if (!searchQuery.value) {
    filteredPlatforms.value = [];
    return;
  }
  const query = searchQuery.value.toLowerCase();
  filteredPlatforms.value = platforms.value.filter((platform) =>
    platform.platform.toLowerCase().includes(query)
  );
};

const onSiteClick = (url: string) => {
  window.open(url, '_blank');
};

const onFocus = () => {
  isFocused.value = true;
};

const onBlur = () => {
  if (!searchQuery.value) {
    isFocused.value = false;
  }
};

onMounted(async () => {
  fetchPlatforms();
  // 等待组件渲染完成后再聚焦到搜索框
  await nextTick();
  if (searchInput.value) {
    searchInput.value.focus();
  }
});
</script>

<style scoped>
.search-component {
  max-width: 600px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  color: #333;
}

.floating-search-box {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
  transition: all 0.2s ease-in-out;
}

.floating-search-box:hover,
.floating-search-box:focus-within {
  border-color: #007bff;
}

.search-input {
  flex-grow: 1;
  border: none;
  outline: none;
  padding: 10px;
  font-size: 16px;
  width: 100%;
  box-sizing: border-box;
}

.floating-label {
  display: inline !important;
  position: absolute;
  top: -10px; /* Adjust this value to control the floating height */
  left: 10px;
  font-size: 12px;
  color: #aaa;
  pointer-events: none;
  transition: all 0.2s ease-in-out;
  background-color: #fff;
  padding: 0 4px;
}

.search-button {
  background-color: #007bff;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 4px;
}

.search-button svg {
  fill: #fff;
}

.search-button:hover {
  background-color: #0056b3;
}

ul {
  list-style-type: none;
  padding: 0;
  margin-top: 20px;
}

li {
  margin-bottom: 10px;
}

.site-container {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.175);
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
  width: 100%;
  height: auto;
}

.site-icon {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  margin-right: 1rem; /* 图标与标题之间的间距 */
  position: relative;
  overflow: hidden;
  border-radius: 0.25rem;
}

.site-title {
  font-size: 1.25rem;
  line-height: 1.5; /* 设置行高 */
  word-break: break-word; /* 处理长单词或URL换行 */
  flex-grow: 1;
}

/* Media queries for responsiveness */
@media (max-width: 600px) {
  .site-container {
    flex-direction: column;
    text-align: center;
  }

  .site-icon {
    margin-bottom: 0.5rem; /* 图标与标题之间的垂直间距 */
    margin-right: 0;
  }

  .site-title {
    font-size: 1rem;
    line-height: 1.4;
  }
}

p {
  text-align: center;
  color: #666;
  margin-top: 20px;
}
</style>
