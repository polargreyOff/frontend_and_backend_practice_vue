<template>
  <div class="palette-generator">
    <!-- Панель управления -->
    <div class="control-panel card">
      <div class="control-section">
        <h3>⚙️ Настройки генерации</h3>
        <div class="controls-grid">
          <div class="control-item">
            <label>Количество цветов</label>
            <div class="btn-group">
              <button 
                v-for="num in [3, 5, 7]" 
                :key="num"
                class="btn-number"
                :class="{ active: colorsCount === num }"
                @click="colorsCount = num"
              >
                {{ num }}
              </button>
            </div>
          </div>
          
          <div class="control-item">
            <label>Тип палитры</label>
            <select v-model="paletteType" class="select-input">
              <option value="analogous">Аналогичная</option>
              <option value="monochromatic">Монохромная</option>
              <option value="triadic">Триада</option>
              <option value="complementary">Комплементарная</option>
              <option value="random">Случайная</option>
            </select>
          </div>
          
          <div class="control-item">
            <label>Формат отображения</label>
            <div class="btn-group">
              <button 
                v-for="format in ['HEX', 'RGB', 'HSL']" 
                :key="format"
                class="btn-format"
                :class="{ active: displayFormat === format }"
                @click="displayFormat = format"
              >
                {{ format }}
              </button>
            </div>
          </div>
          
          <div class="control-item">
            <label>Базовый цвет</label>
            <div class="color-picker-wrapper">
              <input 
                type="color" 
                v-model="baseColor" 
                class="color-picker"
              >
              <span class="color-value">{{ baseColor }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <button @click="generatePalette" class="btn btn-primary">
          <span>🎨 Сгенерировать палитру</span>
        </button>
        <button @click="generateRandom" class="btn btn-secondary">
          <span>🎲 Случайная палитра</span>
        </button>
        <button @click="saveCurrentPalette" class="btn btn-outline" :disabled="!currentPalette.length">
          <span>💾 Сохранить</span>
        </button>
      </div>
    </div>
    
    <!-- Основная палитра -->
    <div class="palette-main card">
      <div class="palette-header">
        <h2>Текущая палитра</h2>
        <div class="palette-actions">
          <button @click="lockAll" class="btn-icon" title="Закрепить все">
            🔒
          </button>
          <button @click="unlockAll" class="btn-icon" title="Открепить все">
            🔓
          </button>
          <button @click="copyPalette" class="btn-icon" title="Копировать все цвета">
            📋
          </button>
        </div>
      </div>
      
      <div class="colors-grid">
        <ColorCard 
          v-for="(color, index) in currentPalette" 
          :key="index"
          :color="color"
          :index="index"
          :format="displayFormat"
          :locked="lockedColors[index]"
          @toggle-lock="toggleColorLock(index)"
          @copy="copyToClipboard"
          @change-color="updateColor"
        />
      </div>
      
      <div v-if="!currentPalette.length" class="empty-palette">
        <p>🎨 Нажмите "Сгенерировать палитру" чтобы начать</p>
      </div>
    </div>
    
    <!-- Preview и сохранение -->
    <div class="preview-section">
      <div class="preview-card card">
        <h3>🖼️ Предпросмотр</h3>
        <div class="preview-container" :style="{ backgroundColor: previewBg }">
          <div class="preview-ui">
            <div class="preview-header" :style="{ backgroundColor: currentPalette[0] || '#41b883' }">
              <h4 :style="{ color: getContrastColor(currentPalette[0] || '#41b883') }">
                Vue Palette
              </h4>
            </div>
            <div class="preview-content">
              <button class="preview-btn" :style="{
                backgroundColor: currentPalette[1] || '#34495e',
                color: getContrastColor(currentPalette[1] || '#34495e')
              }">
                Кнопка
              </button>
              <div class="preview-card-ui" :style="{
                backgroundColor: currentPalette[2] || '#ffffff',
                borderColor: currentPalette[3] || '#e8e8e8'
              }">
                <h5>Карточка</h5>
                <p>Пример текста в интерфейсе</p>
              </div>
            </div>
          </div>
        </div>
        <div class="preview-controls">
          <button @click="togglePreviewBg" class="btn btn-outline">
            {{ previewBg === '#ffffff' ? '🌙 Тёмный фон' : '☀️ Светлый фон' }}
          </button>
        </div>
      </div>
      
      <div class="save-card card">
        <h3 class="library-link"><RouterLink to="/library">📚 Библиотека</RouterLink></h3>
        <PaletteLibrary 
          :palettes="savedPalettes"
          @load-palette="loadPalette"
          @delete-palette="deletePalette"
        />
      </div>
    </div>
    
    <!-- Уведомления -->
    <transition name="slide-up">
      <div v-if="notification.show" class="notification" :class="notification.type">
        {{ notification.message }}
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import ColorCard from './ColorCard.vue'
import PaletteLibrary from './PaletteLibrary.vue'
import { useColorPalette } from '../composables/useColorPalette'
import { useLocalStorage } from '../composables/useLocalStorage'
import { getContrastColor, copyToClipboard as copy } from '../composables/useColorUtils'
import { RouterLink } from 'vue-router'

export default {
  name: 'PaletteGenerator',
  components: {
    ColorCard,
    PaletteLibrary
  },
  
  setup() {
    const colorsCount = ref(5)
    const paletteType = ref('analogous')
    const displayFormat = ref('HEX')
    const baseColor = ref('#41b883')
    const previewBg = ref('#ffffff')
    const lockedColors = ref([])
    
    const { 
      currentPalette,
      generatePalette: generate,
      generateRandomPalette,
      updateColorInPalette
    } = useColorPalette()
    
    const { 
      getItem: getSavedPalettes,
      setItem: savePaletteToStorage 
    } = useLocalStorage('vue-palettes', [])
    
    const savedPalettes = ref([])
    const notification = ref({ show: false, message: '', type: 'success' })
    
    // Инициализация
    onMounted(() => {
      savedPalettes.value = getSavedPalettes()
      if (savedPalettes.value.length > 0) {
        loadPalette(savedPalettes.value[0])
      } else {
        generateRandom()
      }
    })
    
    // Генерация палитры
    const generatePalette = () => {
      generate(baseColor.value, paletteType.value, colorsCount.value, lockedColors.value)
      showNotification('Палитра сгенерирована!', 'success')
    }
    
    const generateRandom = () => {
      generateRandomPalette(colorsCount.value, lockedColors.value)
      showNotification('Случайная палитра создана!', 'success')
    }
    
    // Управление блокировкой цветов
    const toggleColorLock = (index) => {
      lockedColors.value[index] = !lockedColors.value[index]
    }
    
    const lockAll = () => {
      lockedColors.value = new Array(colorsCount.value).fill(true)
    }
    
    const unlockAll = () => {
      lockedColors.value = new Array(colorsCount.value).fill(false)
    }
    
    // Обновление цвета
    const updateColor = (index, newColor) => {
      updateColorInPalette(index, newColor)
    }
    
    // Копирование
    const copyToClipboard = async (color, format) => {
      await copy(color, format)
      showNotification('Цвет скопирован!', 'success')
    }
    
    const copyPalette = async () => {
      const text = currentPalette.value.map(c => c).join('\n')
      await navigator.clipboard.writeText(text)
      showNotification('Вся палитра скопирована!', 'success')
    }
    
    // Сохранение/загрузка
    const saveCurrentPalette = () => {
      const palette = {
        id: Date.now(),
        name: `Палитра ${new Date().toLocaleDateString()}`,
        colors: [...currentPalette.value],
        type: paletteType.value,
        createdAt: new Date().toISOString()
      }
      
      savedPalettes.value.unshift(palette)
      savePaletteToStorage(savedPalettes.value)
      showNotification('Палитра сохранена!', 'success')
    }
    
    const loadPalette = (palette) => {
      currentPalette.value = [...palette.colors]
      paletteType.value = palette.type
      colorsCount.value = palette.colors.length
      lockedColors.value = new Array(palette.colors.length).fill(false)
      showNotification('Палитра загружена!', 'success')
    }
    
    const deletePalette = (id) => {
      savedPalettes.value = savedPalettes.value.filter(p => p.id !== id)
      savePaletteToStorage(savedPalettes.value)
      showNotification('Палитра удалена', 'info')
    }
    
    // Preview
    const togglePreviewBg = () => {
      previewBg.value = previewBg.value === '#ffffff' ? '#1a1a1a' : '#ffffff'
    }
    
    // Уведомления
    const showNotification = (message, type = 'success') => {
      notification.value = { show: true, message, type }
      setTimeout(() => {
        notification.value.show = false
      }, 3000)
    }
    
    return {
      colorsCount,
      paletteType,
      displayFormat,
      baseColor,
      previewBg,
      lockedColors,
      currentPalette,
      savedPalettes,
      notification,
      generatePalette,
      generateRandom,
      toggleColorLock,
      lockAll,
      unlockAll,
      updateColor,
      copyToClipboard,
      copyPalette,
      saveCurrentPalette,
      loadPalette,
      deletePalette,
      togglePreviewBg,
      getContrastColor
    }
  }
}
</script>

<style scoped>
.library-link a {
  text-decoration: none;
  color: #34495e;
}
.palette-generator {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.control-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.control-section h3 {
  margin-bottom: 1rem;
  color: #34495e;
  font-size: 1.2rem;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-item label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.btn-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-number, .btn-format {
  padding: 0.5rem 1rem;
  border: 2px solid #e8e8e8;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.btn-number:hover, .btn-format:hover {
  border-color: #41b883;
}

.btn-number.active, .btn-format.active {
  background: #41b883;
  color: white;
  border-color: #41b883;
}

.select-input {
  padding: 0.5rem;
  border: 2px solid #e8e8e8;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
  color: #2c3e50;
  transition: border-color 0.2s ease;
}

.select-input:focus {
  outline: none;
  border-color: #41b883;
}

.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.color-picker {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 0;
}

.color-value {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  color: #34495e;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Palette Main */
.palette-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.palette-header h2 {
  color: #34495e;
  font-size: 1.5rem;
}

.palette-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  padding: 0.5rem;
  border: 2px solid #e8e8e8;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  border-color: #41b883;
  transform: translateY(-1px);
}

.colors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.empty-palette {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
  font-size: 1.1rem;
}

/* Preview Section */
.preview-section {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .preview-section {
    grid-template-columns: 1fr;
  }
}

.preview-card h3, .save-card h3 {
  margin-bottom: 1rem;
  color: #34495e;
}

.preview-container {
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: background-color 0.3s ease;
}

.preview-ui {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preview-header {
  padding: 1rem;
}

.preview-header h4 {
  margin: 0;
  font-weight: 600;
}

.preview-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preview-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.preview-btn:hover {
  transform: translateY(-1px);
}

.preview-card-ui {
  padding: 1rem;
  border: 2px solid;
  border-radius: 8px;
}

.preview-card-ui h5 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.preview-card-ui p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.preview-controls {
  display: flex;
  justify-content: center;
}

/* Notification */
.notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.notification.success {
  background: linear-gradient(135deg, #41b883 0%, #3aa776 100%);
}

.notification.info {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
}

.notification.error {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

@keyframes slideIn {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>