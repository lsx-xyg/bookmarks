<template>
  <div class="site-container" @click="onClick" @mouseenter="onMouseEnter">
    <div class="site-icon">
      <img
        :src="iconSrc"
        :alt="props.site.platform"
        @error="handleImageError"
        ref="siteIconImg"
      />
    </div>
    <div class="site-title">
      {{ props.site.platform }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { SITE } from '../../models/Site';

interface Props {
  site: SITE;
}

const props = defineProps<Props>();
const emit = defineEmits(['click', 'mouseenter']);

// 计算初始的 iconSrc
const iconSrc = computed(() =>
  props.site.f ? '' : props.site.url + 'favicon.ico'
);

// 引用 img 元素
const siteIconImg = ref<HTMLImageElement | null>(null);

// 处理图片加载失败的情况
const handleImageError = () => {
  if (siteIconImg.value) {
    siteIconImg.value.src = props.site.icon || ''; // 回退到 props.site.icon
  }
};

const onClick = () => {
  emit('click', props.site.url);
};

const onMouseEnter = () => {
  emit('mouseenter');
};
</script>

<style scoped>
.site-container {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.175);
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;

  /* Responsive design */
  width: 100%;
  height: auto;
}

.site-container:hover {
  transform: scale(1.2);
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

.site-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 确保图片按比例缩放并完全显示 */
  display: block;
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
</style>
