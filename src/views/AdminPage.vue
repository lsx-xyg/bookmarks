<template>
  <div class="admin-page">
    <div class="admin-header">
      <h1>后台管理</h1>
      
      <!-- 消息提示 -->
      <div v-if="showMessage" :class="['message', messageType]">
        {{ message }}
      </div>
      
      <div class="instructions">
        <p><strong>重要提示：</strong>此页面允许您编辑书签列表。但请注意：</p>
        <ul>
          <li>所有更改仅在当前浏览器会话中有效</li>
          <li>实际的 <code>urls.json</code> 文件不会被修改</li>
          <li>如需永久更改，可使用"导出JSON"按钮复制数据后手动更新</li>
          <li>也可以使用"提交到 GitHub"按钮直接提交更改（需要 GitHub 个人访问令牌）</li>
          <li>可通过拖拽或上下箭头按钮调整站点顺序</li>
        </ul>
      </div>
      
      <div class="admin-controls">
        <button @click="addNewSite" class="btn btn-primary">添加新站点</button>
        <button @click="saveChanges" class="btn btn-success">保存更改</button>
        <button @click="cancelChanges" class="btn btn-secondary">取消</button>
        <button @click="exportData" class="btn btn-info">导出JSON</button>
        <button @click="commitToGithub" class="btn btn-github">提交到 GitHub</button>
      </div>
    </div>
    
    <div class="sites-container-full">
      <div class="sites-grid">
        <div 
          v-for="(site, index) in sites" 
          :key="index" 
          class="site-item"
          draggable="true"
          @dragstart="dragStart($event, index)"
          @dragover.prevent
          @drop="drop($event, index)"
        >
          <div class="site-info">
            <div class="site-details">
              <input 
                v-model="site.platform" 
                placeholder="平台名称" 
                class="site-input"
              />
              <input 
                v-model="site.url" 
                placeholder="URL地址" 
                class="site-input url-input"
              />
              <input 
                v-model="site.icon" 
                placeholder="图标URL（可选）" 
                class="site-input"
              />
            </div>
            <div class="site-actions">
              <button @click="moveUp(index)" class="btn btn-smaller" :disabled="index === 0">↑</button>
              <button @click="moveDown(index)" class="btn btn-smaller" :disabled="index === sites.length - 1">↓</button>
              <button @click="removeSite(index)" class="btn btn-danger">删除</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <div class="add-site-column">
        <h3>新建站点</h3>
        <div class="add-site-form" v-if="newSiteFormVisible">
          <div class="site-details">
            <input 
              v-model="newSite.platform" 
              placeholder="平台名称" 
              class="site-input"
            />
            <input 
              v-model="newSite.url" 
              placeholder="URL地址" 
              class="site-input url-input"
            />
            <input 
              v-model="newSite.icon" 
              placeholder="图标URL（可选）" 
              class="site-input"
            />
          </div>
          <div class="form-actions">
            <button @click="addSiteToMainList" class="btn btn-success">添加到列表</button>
            <button @click="hideNewSiteForm" class="btn btn-secondary">取消</button>
          </div>
        </div>
        <div v-else class="no-new-site">
          <p>暂无新站点</p>
          <small>点击上方"添加新站点"按钮创建新项目</small>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 自定义模态框 -->
  <div v-if="showModal" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ modalTitle }}</h3>
        <button class="modal-close" @click="closeModal">&times;</button>
      </div>
      <div class="modal-body">
        <p>{{ modalContent }}</p>
        <input 
          v-if="modalType === 'prompt'" 
          v-model="modalInputValue" 
          type="text" 
          class="modal-input"
          :placeholder="modalContent.includes('提交消息') ? `Update urls.json - ${new Date().toISOString().split('T')[0]}` : ''"
        />
      </div>
      <div class="modal-footer">
        <button 
          v-if="modalType !== 'alert'" 
          class="btn btn-secondary" 
          @click="handleModalCancel"
        >
          取消
        </button>
        <button 
          :class="modalType === 'alert' ? 'btn btn-primary' : 'btn btn-success'" 
          @click="handleModalConfirm"
        >
          {{ modalType === 'prompt' ? '确定' : '确认' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { SITE } from '../models/Site';
import originalData from '../data/urls.json';

const sites = ref<SITE[]>([]);
let originalSites: SITE[] = [];
const newSiteFormVisible = ref(false);
const newSite = ref({
  platform: '',
  url: 'https://',
  icon: ''
});
// 消息通知相关
const message = ref('');
const showMessage = ref(false);
const messageType = ref<'success' | 'error' | 'info'>('info');

// 模态框相关
const showModal = ref(false);
const modalTitle = ref('');
const modalContent = ref('');
const modalType = ref<'confirm' | 'prompt' | 'alert'>('confirm');
const modalCallback = ref<Function | null>(null);
const modalInputValue = ref('');

// 初始化数据
const init = () => {
  // 深拷贝原始数据以避免直接修改导入的数据
  sites.value = JSON.parse(JSON.stringify(originalData));
  originalSites = JSON.parse(JSON.stringify(originalData));
};

// 显示新站点表单
const addNewSite = () => {
  newSiteFormVisible.value = true;
  newSite.value = {
    platform: '',
    url: 'https://',
    icon: ''
  };
};

// 隐藏新站点表单
const hideNewSiteForm = () => {
  newSiteFormVisible.value = false;
};

// 将新站点添加到主列表
const addSiteToMainList = () => {
  if (!newSite.value.platform.trim()) {
    showMessageFunc('平台名称不能为空！', 'error');
    return;
  }
  
  if (!newSite.value.url.trim() || !isValidUrl(newSite.value.url)) {
    showMessageFunc('请输入有效的URL地址！', 'error');
    return;
  }
  
  sites.value.push({ ...newSite.value });
  newSiteFormVisible.value = false;
  newSite.value = {
    platform: '',
    url: 'https://',
    icon: ''
  };
  showMessageFunc('站点已添加到列表！', 'success');
};

// 删除站点
const removeSite = async (index: number) => {
  const confirmed = await confirmAction('确定要删除这个站点吗？');
  if (confirmed) {
    sites.value.splice(index, 1);
    showMessageFunc('站点已删除', 'info');
  }
};

// 上移站点
const moveUp = (index: number) => {
  if (index > 0) {
    [sites.value[index], sites.value[index - 1]] = [sites.value[index - 1], sites.value[index]];
  }
};

// 下移站点
const moveDown = (index: number) => {
  if (index < sites.value.length - 1) {
    [sites.value[index], sites.value[index + 1]] = [sites.value[index + 1], sites.value[index]];
  }
};

// 显示消息
const showMessageFunc = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
  message.value = msg;
  messageType.value = type;
  showMessage.value = true;
  
  // 3秒后自动隐藏消息
  setTimeout(() => {
    showMessage.value = false;
  }, 3000);
};

// 显示模态框
const showModalFunc = (
  title: string, 
  content: string, 
  type: 'confirm' | 'prompt' | 'alert' = 'confirm',
  callback?: Function,
  inputValue: string = ''
) => {
  modalTitle.value = title;
  modalContent.value = content;
  modalType.value = type;
  modalCallback.value = callback || null;
  modalInputValue.value = inputValue;
  showModal.value = true;
};

// 处理模态框确认
const handleModalConfirm = () => {
  if (modalType.value === 'prompt') {
    // 对于 prompt 类型，传递输入值给回调
    if (modalCallback.value) {
      modalCallback.value(true, modalInputValue.value);
    }
  } else {
    // 对于 confirm 和 alert 类型
    if (modalCallback.value) {
      modalCallback.value(true);
    }
  }
  closeModal();
};

// 处理模态框取消
const handleModalCancel = () => {
  if (modalCallback.value) {
    if (modalType.value === 'prompt') {
      modalCallback.value(false, null);
    } else {
      modalCallback.value(false);
    }
  }
  closeModal();
};

// 关闭模态框
const closeModal = () => {
  showModal.value = false;
  modalInputValue.value = '';
};

// 替代 confirm 的函数
const confirmAction = (msg: string): Promise<boolean> => {
  return new Promise((resolve) => {
    showModalFunc('确认', msg, 'confirm', (result: boolean) => {
      resolve(result);
    });
  });
};

// 替代 prompt 的函数
const promptAction = (msg: string, defaultValue: string = ''): Promise<{ confirmed: boolean, value?: string }> => {
  return new Promise((resolve) => {
    showModalFunc('输入', msg, 'prompt', (confirmed: boolean, value?: string) => {
      if (confirmed) {
        resolve({ confirmed: true, value: value || defaultValue });
      } else {
        resolve({ confirmed: false });
      }
    }, defaultValue);
  });
};

// 替代 alert 的函数
const alertAction = (msg: string): Promise<void> => {
  return new Promise((resolve) => {
    showModalFunc('提示', msg, 'alert', () => {
      resolve();
    });
  });
};

// 验证单个站点数据
const validateSite = (site: SITE): boolean => {
  if (!site.platform.trim()) {
    showMessageFunc('平台名称不能为空！', 'error');
    return false;
  }
  
  if (!site.url.trim() || !isValidUrl(site.url)) {
    showMessageFunc('请输入有效的URL地址！', 'error');
    return false;
  }
  
  return true;
};

// 验证URL格式
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// 保存更改
const saveChanges = async () => {
  // 验证所有站点
  for (const site of sites.value) {
    if (!validateSite(site)) {
      return; // 如果验证失败，则不保存
    }
  }

  const confirmed = await confirmAction(`确定要保存更改吗？\n\n注意：这只是在浏览器中的预览，实际的urls.json文件不会被修改。\n\n共有 ${sites.value.length} 个站点将被保存。`);
  if (confirmed) {
    showMessageFunc('更改已保存（仅在当前浏览器会话中有效）！\n\n注意：由于这是一个部署在 Vercel/GitHub Pages 上的静态网站，实际的urls.json文件无法通过前端直接修改。\n在生产环境中，您需要通过其他方式（如 GitHub 编辑、Pull Request 等）来更新数据文件。', 'success');
  }
};

// 导出数据以便手动更新
const exportData = async () => {
  const jsonData = JSON.stringify(sites.value, null, 2);
  navigator.clipboard.writeText(jsonData).then(() => {
    showMessageFunc('数据已复制到剪贴板！您可以直接粘贴到 src/data/urls.json 文件中并提交到 GitHub。', 'success');
  }).catch(err => {
    console.error('复制失败:', err);
    // 如果复制失败，提供一个弹窗让用户手动复制
    alertAction('复制到剪贴板失败，请手动选择并复制下面的数据');
    // 这里我们可以显示数据供用户手动复制
    const textArea = document.createElement('textarea');
    textArea.value = jsonData;
    textArea.style.position = 'fixed';
    textArea.style.left = '0';
    textArea.style.top = '0';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  });
};

// 提交更改到 GitHub 仓库
const commitToGithub = async () => {
  // 获取当前页面的 URL 以推断仓库信息
  const currentPage = window.location.href;
  const isLocalhost = currentPage.includes('localhost') || currentPage.includes('127.0.0.1');
  
  if (isLocalhost) {
    await alertAction('此功能在本地开发环境中不可用，请部署到 GitHub Pages 后使用。');
    return;
  }
  
  // 获取仓库信息 - 直接通过用户输入
  let repoOwner = '';
  let repoName = '';
  
  const repoInfoResult = await promptAction('请输入仓库信息 (格式: owner/repo):\ne.g., username/repository');
  if (!repoInfoResult.confirmed || !repoInfoResult.value) return;
  
  const repoInfo = repoInfoResult.value;
  const parts = repoInfo.split('/');
  if (parts.length !== 2) {
    await alertAction('仓库信息格式错误，请使用 owner/repo 格式');
    return;
  }
  [repoOwner, repoName] = parts;
  
  // 获取用户的 GitHub token
  const tokenResult = await promptAction('请输入您的 GitHub 个人访问令牌 (Personal Access Token)：\n\n注意：此令牌仅在当前浏览器会话中使用，不会存储或传输到任何地方。');
  if (!tokenResult.confirmed || !tokenResult.value) return;
  
  const token = tokenResult.value;
  
  try {
    // 首先获取当前文件内容和 SHA
    const filePath = 'src/data/urls.json'; // 固定路径
    
    const response = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`找不到文件 ${filePath}，请确认文件是否存在`);
      } else {
        throw new Error(`获取文件信息失败: ${response.statusText}`);
      }
    }
    
    const fileData = await response.json();
    const sha = fileData.sha;
    // 正确处理Unicode字符的base64解码
    const decodeBase64 = (str) => {
      // 解码base64后再进行UTF-8解码
      return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
    };
    const currentContent = decodeBase64(fileData.content); // base64 解码
    
    // 检查内容是否有变化
    const newContent = JSON.stringify(sites.value, null, 2);
    if (currentContent === newContent) {
      await alertAction('没有更改需要提交！');
      return;
    }
    
    // 提交更改
    const commitMsgResult = await promptAction('请输入提交消息:', `Update urls.json - ${new Date().toISOString().split('T')[0]}`);
    if (!commitMsgResult.confirmed || !commitMsgResult.value) return;
    
    const commitMessage = commitMsgResult.value;
    
    // 正确处理Unicode字符的base64编码
    const encodeBase64 = (str) => {
      // 先将字符串转换为UTF-8字节数组，再进行base64编码
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode(parseInt(p1, 16));
      }));
    };
    
    const commitResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        message: commitMessage,
        content: encodeBase64(newContent), // 正确编码包含Unicode字符的内容
        sha: sha
      })
    });
    
    if (commitResponse.ok) {
      await alertAction('成功提交更改到 GitHub 仓库！');
    } else {
      const errorData = await commitResponse.json();
      throw new Error(`提交失败: ${errorData.message || commitResponse.statusText}`);
    }
  } catch (error: any) {
    console.error('GitHub 提交错误:', error);
    await alertAction(`提交失败: ${error.message || '未知错误'}`);
  }
};

// 取消更改
const cancelChanges = async () => {
  const confirmed = await confirmAction('确定要放弃所有更改吗？');
  if (confirmed) {
    init(); // 恢复原始数据
    showMessageFunc('已取消所有更改', 'info');
  }
};

// 拖拽相关变量
let draggedIndex = -1;

// 拖拽开始
const dragStart = (event: DragEvent, index: number) => {
  draggedIndex = index;
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', index.toString());
    event.dataTransfer.effectAllowed = 'move';
  }
};

// 拖拽放置
const drop = (event: DragEvent, targetIndex: number) => {
  if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
    // 移动数组项
    const draggedItem = sites.value[draggedIndex];
    sites.value.splice(draggedIndex, 1);
    sites.value.splice(targetIndex, 0, draggedItem);
  }
  draggedIndex = -1;
};

onMounted(() => {
  init();
});
</script>

<style scoped>
.admin-page {
  max-width: 100%;
  margin: 0;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.admin-header {
  max-width: 800px;
  margin: 3rem auto 20px auto;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.admin-controls {
  margin-bottom: 20px;
  text-align: center;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 0 5px;
  font-size: 14px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-github {
  background-color: #24292e;
  color: white;
}

.btn-smaller {
  padding: 4px 8px;
  font-size: 12px;
}

.sites-container-full {
  display: flex;
  gap: 20px;
  min-height: 400px;
  margin: 20px 20px 0 20px;
  padding: 0;
}

.sites-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  flex: 3;  /* 占据3份空间，比右侧添加列宽 */
  width: 100%;
}

.site-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  background-color: #f9f9f9;
  transition: box-shadow 0.2s;
  height: fit-content;
}

.site-item:hover {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.site-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.site-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.site-input {
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.site-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.url-input {
  font-family: monospace;
}

.site-actions {
  display: flex;
  justify-content: space-between;
  gap: 5px;
}

.divider {
  width: 2px;
  background-color: #ccc;
  min-height: 400px;
}

.add-site-column {
  width: 200px;  /* 窄一些 */
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 20px;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
 /* justify-content: center;*/
  flex: 1;  /* 占据1份空间 */
}

.add-site-form {
  text-align: center;
  width: 80%;
}

.add-site-form small {
  color: #666;
  display: block;
  margin-top: 10px;
}

.no-new-site {
  text-align: center;
  color: #666;
  padding: 20px 0;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.form-actions .btn {
  flex: 1;
}

.sites-list {
  min-height: 200px;
}

.instructions {
  background-color: #e7f3ff;
  border-left: 4px solid #007bff;
  padding: 10px;
  margin-bottom: 20px;
  font-size: 14px;
}

.message {
  padding: 12px 16px;
  margin: 10px 0;
  border-radius: 4px;
  font-weight: 500;
  text-align: center;
  animation: fadeInOut 3s ease-in-out;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.message.info {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-10px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); }
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 10px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2em;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #333;
  background-color: #f5f5f5;
  border-radius: 50%;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin: 0 0 15px 0;
  color: #666;
  line-height: 1.5;
}

.modal-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.modal-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #eee;
  background-color: #fafafa;
  border-radius: 0 0 8px 8px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .sites-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .sites-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .admin-page {
    padding: 10px;
  }
  
  .admin-header {
    max-width: 100%;
  }
  
  .sites-container-full {
    flex-direction: column;
  }
  
  .divider {
    width: 100%;
    height: 2px;
    min-height: auto;
  }
  
  .add-site-column {
    width: 100%;
  }
}
</style>