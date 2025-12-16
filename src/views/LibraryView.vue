<template>
  <div class="library-view">
    <div class="library-header card">
      <h2>📚 Библиотека палитр</h2>
      <div class="search-controls">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            placeholder="Поиск по названию или цветам..."
            class="search-input"
          >
          <span class="search-icon">🔍</span>
        </div>
        <div class="filter-controls">
          <select v-model="filterType" class="filter-select">
            <option value="">Все типы</option>
            <option value="analogous">Аналогичные</option>
            <option value="monochromatic">Монохромные</option>
            <option value="triadic">Триады</option>
            <option value="complementary">Комплементарные</option>
            <option value="random">Случайные</option>
          </select>
          <button @click="sortByDate = !sortByDate" class="sort-btn">
            {{ sortByDate ? '🔼 По дате' : '🔽 По дате' }}
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="filteredPalettes.length === 0" class="empty-library card">
      <div class="empty-content">
        <div class="empty-icon">🎨</div>
        <h3>Библиотека пуста</h3>
        <p>Сохраните свои первые палитры чтобы они появились здесь</p>
        <router-link to="/" class="btn btn-primary">
          Создать палитру
        </router-link>
      </div>
    </div>
    
    <div v-else class="palettes-grid">
      <div 
        v-for="palette in filteredPalettes" 
        :key="palette.id"
        class="palette-card card"
      >
        <div class="palette-card-header">
          <h3>{{ palette.name }}</h3>
          <div class="palette-actions">
            <button 
              @click="loadPalette(palette)" 
              class="action-btn"
              title="Загрузить"
            >
              ⬇️
            </button>
            <button 
              @click="editPaletteName(palette)" 
              class="action-btn"
              title="Редактировать"
            >
              ✏️
            </button>
            <button 
              @click="exportPalette(palette)" 
              class="action-btn"
              title="Экспортировать"
            >
              📤
            </button>
            <button 
              @click="deletePalette(palette.id)" 
              class="action-btn delete"
              title="Удалить"
            >
              🗑️
            </button>
          </div>
        </div>
        
        <div class="palette-colors">
          <div 
            v-for="(color, index) in palette.colors" 
            :key="index"
            class="color-preview"
            :style="{ backgroundColor: color }"
            :title="color"
          >
            <span class="color-hex">{{ color }}</span>
          </div>
        </div>
        
        <div class="palette-info">
          <div class="info-row">
            <span class="info-label">Тип:</span>
            <span class="info-value">{{ getTypeLabel(palette.type) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Цветов:</span>
            <span class="info-value">{{ palette.colors.length }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Создано:</span>
            <span class="info-value">{{ formatDate(palette.createdAt) }}</span>
          </div>
        </div>
        
        <div class="palette-tags">
          <span class="tag type-tag">{{ getTypeLabel(palette.type) }}</span>
          
        </div>
      </div>
    </div>
    
    <!-- Модальное окно редактирования -->
    <div v-if="editingPalette" class="modal-overlay">
      <div class="modal card">
        <div class="modal-header">
          <h3>Редактировать палитру</h3>
          <button @click="editingPalette = null" class="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Название палитры</label>
            <input 
              v-model="editingPalette.name" 
              class="modal-input"
              placeholder="Введите название..."
            >
          </div>
          <div class="form-group">
            <label>Цвета палитры</label>
            <div class="editing-colors">
              <div 
                v-for="(color, index) in editingPalette.colors" 
                :key="index"
                class="editing-color"
              >
                <div 
                  class="color-box"
                  :style="{ backgroundColor: color }"
                ></div>
                <input 
                  v-model="editingPalette.colors[index]" 
                  class="color-input"
                  type="color"
                >
                <button 
                  @click="removeColorFromPalette(index)"
                  class="remove-color-btn"
                >
                  ✕
                </button>
              </div>
            </div>
            <button @click="addColorToPalette" class="btn btn-outline">
              + Добавить цвет
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="saveEditedPalette" class="btn btn-primary">
            Сохранить
          </button>
          <button @click="editingPalette = null" class="btn btn-outline">
            Отмена
          </button>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно экспорта -->
    <div v-if="exportingPalette" class="modal-overlay">
      <div class="modal card export-modal">
        <div class="modal-header">
          <h3>Экспорт палитры</h3>
          <button @click="exportingPalette = null" class="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <div class="export-format-selector">
            <button 
              v-for="format in exportFormats" 
              :key="format.id"
              class="format-btn"
              :class="{ active: exportFormat === format.id }"
              @click="exportFormat = format.id"
            >
              {{ format.name }}
            </button>
          </div>
          
          <div class="export-preview">
            <h4>Предпросмотр:</h4>
            <pre class="code-block">{{ exportCode }}</pre>
          </div>
          
          <div class="export-actions">
            <button @click="copyExportCode" class="btn btn-primary">
              📋 Копировать код
            </button>
            <button @click="downloadExport" class="btn btn-secondary">
              ⬇️ Скачать файл
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocalStorage } from '../composables/useLocalStorage'
import { formatColor, copyToClipboard } from '../composables/useColorUtils'

export default {
  name: 'LibraryView',
  
  setup() {
    const router = useRouter()
    const searchQuery = ref('')
    const filterType = ref('')
    const sortByDate = ref(true)
    const editingPalette = ref(null)
    const exportingPalette = ref(null)
    const exportFormat = ref('css')
    
    const { getItem: getSavedPalettes, setItem: savePalettes } = useLocalStorage('vue-palettes', [])
    const savedPalettes = ref([])
    
    const exportFormats = [
      { id: 'css', name: 'CSS Variables' },
      { id: 'scss', name: 'SCSS Variables' },
      { id: 'tailwind', name: 'Tailwind Config' },
      { id: 'json', name: 'JSON' }
    ]
    
    // Загрузка палитр при монтировании
    onMounted(() => {
      savedPalettes.value = getSavedPalettes()
    })
    
    // Фильтрация и поиск
    const filteredPalettes = computed(() => {
      let result = [...savedPalettes.value]
      
      // Фильтрация по типу
      if (filterType.value) {
        result = result.filter(p => p.type === filterType.value)
      }
      
      // Поиск по названию или цветам
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(p => 
          p.name.toLowerCase().includes(query) ||
          p.colors.some(color => color.toLowerCase().includes(query))
        )
      }
      
      // Сортировка
      result.sort((a, b) => {
        if (sortByDate.value) {
          return new Date(b.createdAt) - new Date(a.createdAt)
        }
        return a.name.localeCompare(b.name)
      })
      
      return result
    })
    
    // Экспорт кода
    const exportCode = computed(() => {
      if (!exportingPalette.value) return ''
      
      const palette = exportingPalette.value
      
      switch (exportFormat.value) {
        case 'css':
          return generateCSSVariables(palette)
        case 'scss':
          return generateSCSSVariables(palette)
        case 'tailwind':
          return generateTailwindConfig(palette)
        case 'json':
          return JSON.stringify(palette, null, 2)
        default:
          return ''
      }
    })
    
    // Вспомогательные функции
    const getTypeLabel = (type) => {
      const labels = {
        analogous: 'Аналогичная',
        monochromatic: 'Монохромная',
        triadic: 'Триада',
        complementary: 'Комплементарная',
        random: 'Случайная'
      }
      return labels[type] || type
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    // Генерация CSS переменных
    const generateCSSVariables = (palette) => {
      let css = `/* ${palette.name} - CSS Variables */\n:root {\n`
      
      palette.colors.forEach((color, index) => {
        css += `  --color-${index + 1}: ${color};\n`
      })
      
      css += '}\n\n/* Usage example */\n.example {\n'
      css += `  background-color: var(--color-1);\n`
      css += `  color: var(--color-2);\n`
      css += '}'
      
      return css
    }
    
    const generateSCSSVariables = (palette) => {
      let scss = `// ${palette.name} - SCSS Variables\n`
      
      palette.colors.forEach((color, index) => {
        scss += `$color-${index + 1}: ${color};\n`
      })
      
      scss += '\n// Usage example\n.example {\n'
      scss += `  background-color: $color-1;\n`
      scss += `  color: $color-2;\n`
      scss += '}'
      
      return scss
    }
    
    const generateTailwindConfig = (palette) => {
      let config = `// ${palette.name} - Tailwind Config\nmodule.exports = {\n`
      config += '  theme: {\n'
      config += '    extend: {\n'
      config += '      colors: {\n'
      config += `        'palette': {\n`
      
      palette.colors.forEach((color, index) => {
        config += `          '${index + 1}': '${color}',\n`
      })
      
      config += '        }\n'
      config += '      }\n'
      config += '    }\n'
      config += '  }\n'
      config += '}'
      
      return config
    }
    
    // Методы
    const loadPalette = (palette) => {
      localStorage.setItem('currentPalette', JSON.stringify(palette))
      router.push('/')
    }
    
    const editPaletteName = (palette) => {
      editingPalette.value = { ...palette }
    }
    
    const saveEditedPalette = () => {
      const index = savedPalettes.value.findIndex(p => p.id === editingPalette.value.id)
      if (index !== -1) {
        savedPalettes.value[index] = { ...editingPalette.value }
        savePalettes(savedPalettes.value)
      }
      editingPalette.value = null
    }
    
    const addColorToPalette = () => {
      if (editingPalette.value) {
        editingPalette.value.colors.push('#41b883')
      }
    }
    
    const removeColorFromPalette = (index) => {
      if (editingPalette.value && editingPalette.value.colors.length > 1) {
        editingPalette.value.colors.splice(index, 1)
      }
    }
    
    const exportPalette = (palette) => {
      exportingPalette.value = palette
    }
    
    const copyExportCode = async () => {
      await copyToClipboard(exportCode.value)
      alert('Код скопирован в буфер обмена!')
    }
    
    const downloadExport = () => {
      const blob = new Blob([exportCode.value], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${exportingPalette.value.name.replace(/\s+/g, '-').toLowerCase()}.${exportFormat.value}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
    
    const deletePalette = (id) => {
      if (confirm('Удалить эту палитру?')) {
        savedPalettes.value = savedPalettes.value.filter(p => p.id !== id)
        savePalettes(savedPalettes.value)
      }
    }
    
    return {
      searchQuery,
      filterType,
      sortByDate,
      editingPalette,
      exportingPalette,
      exportFormat,
      exportFormats,
      savedPalettes,
      filteredPalettes,
      exportCode,
      getTypeLabel,
      formatDate,
      loadPalette,
      editPaletteName,
      saveEditedPalette,
      addColorToPalette,
      removeColorFromPalette,
      exportPalette,
      copyExportCode,
      downloadExport,
      deletePalette
    }
  }
}
</script>

<style scoped>
.library-view {
  width: 100%;
}

.library-header {
  margin-bottom: 2rem;
}

.library-header h2 {
  margin-bottom: 1.5rem;
  color: #34495e;
}

.search-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-box {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #41b883;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.5rem;
  border: 2px solid #e8e8e8;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
  color: #2c3e50;
  min-width: 150px;
}

.sort-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #e8e8e8;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-btn:hover {
  border-color: #41b883;
}

/* Панель с палитрами */
.empty-library {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-content {
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-content h3 {
  color: #34495e;
  margin-bottom: 0.5rem;
}

.empty-content p {
  color: #7f8c8d;
  margin-bottom: 1.5rem;
}

/* Сетка палитр */
.palettes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.palette-card {
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  cursor: pointer;
}

.palette-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.palette-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.palette-card-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #34495e;
  flex: 1;
  word-break: break-word;
}

.palette-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.action-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s ease;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.action-btn:hover {
  opacity: 1;
  background: rgba(52, 73, 94, 0.1);
}

.action-btn.delete:hover {
  background: rgba(231, 76, 60, 0.1);
}

.palette-colors {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2px;
  margin-bottom: 1rem;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
}

.color-preview {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.color-preview:hover {
  flex: 2;
  z-index: 1;
}

.color-hex {
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.color-preview:hover .color-hex {
  opacity: 1;
}

.palette-info {
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  font-size: 0.9rem;
}

.info-label {
  color: #7f8c8d;
  font-weight: 500;
}

.info-value {
  color: #34495e;
  font-weight: 500;
}

.palette-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: auto;
}

.tag {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.type-tag {
  background: rgba(65, 184, 131, 0.1);
  color: #41b883;
}

.color-tag {
  background: rgba(52, 73, 94, 0.1);
  color: #34495e;
}

/* Модальные окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: white;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e8e8e8;
}

.modal-header h3 {
  margin: 0;
  color: #34495e;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.7;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.modal-close:hover {
  opacity: 1;
  background: rgba(52, 73, 94, 0.1);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e8e8e8;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #34495e;
}

.modal-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e8e8e8;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.modal-input:focus {
  outline: none;
  border-color: #41b883;
}

.editing-colors {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.editing-color {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.color-box {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  border: 2px solid #e8e8e8;
}

.color-input {
  flex: 1;
  height: 40px;
  border: 2px solid #e8e8e8;
  border-radius: 6px;
  cursor: pointer;
  padding: 2px;
}

.remove-color-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #e74c3c;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.remove-color-btn:hover {
  background: rgba(231, 76, 60, 0.1);
}

/* Экспорт модалка */
.export-modal {
  max-width: 800px;
}

.export-format-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.format-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #e8e8e8;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.format-btn:hover {
  border-color: #41b883;
}

.format-btn.active {
  background: #41b883;
  color: white;
  border-color: #41b883;
}

.export-preview {
  margin-bottom: 1.5rem;
}

.export-preview h4 {
  margin-bottom: 0.5rem;
  color: #34495e;
}

.code-block {
  background: #f8f9fa;
  border: 2px solid #e8e8e8;
  border-radius: 6px;
  padding: 1rem;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
}

.export-actions {
  display: flex;
  gap: 1rem;
}

/* Адаптивность */
@media (max-width: 768px) {
  .palettes-grid {
    grid-template-columns: 1fr;
  }
  
  .export-actions {
    flex-direction: column;
  }
  
  .modal {
    max-height: 80vh;
  }
}
</style>