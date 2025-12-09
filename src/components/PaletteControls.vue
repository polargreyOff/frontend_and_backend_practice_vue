<template>
  <div class="palette-controls card">
    <h3>🎛️ Расширенные настройки</h3>
    
    <div class="controls-grid">
      <!-- Тип палитры -->
      <div class="control-group">
        <label class="control-label">
          <span class="control-icon">🎨</span>
          Тип палитры
        </label>
        <div class="palette-types">
          <button
            v-for="type in paletteTypes"
            :key="type.id"
            class="type-btn"
            :class="{ 
              active: selectedType === type.id,
              [type.class]: true 
            }"
            @click="selectType(type.id)"
            :title="type.description"
          >
            <span class="type-icon">{{ type.icon }}</span>
            <span class="type-name">{{ type.name }}</span>
          </button>
        </div>
      </div>
      
      <!-- Настройка цветовых параметров -->
      <div class="control-group">
        <label class="control-label">
          <span class="control-icon">⚙️</span>
          Параметры цвета
        </label>
        <div class="color-params">
          <div class="param-item">
            <label>Насыщенность</label>
            <div class="slider-container">
              <input
                type="range"
                v-model="saturation"
                min="20"
                max="100"
                step="5"
                class="range-slider"
                @input="updateColorParams"
              >
              <span class="slider-value">{{ saturation }}%</span>
            </div>
          </div>
          
          <div class="param-item">
            <label>Яркость</label>
            <div class="slider-container">
              <input
                type="range"
                v-model="lightness"
                min="10"
                max="90"
                step="5"
                class="range-slider"
                @input="updateColorParams"
              >
              <span class="slider-value">{{ lightness }}%</span>
            </div>
          </div>
          
          <div class="param-item">
            <label>Разброс оттенков</label>
            <div class="slider-container">
              <input
                type="range"
                v-model="hueSpread"
                min="10"
                max="180"
                step="10"
                class="range-slider"
                @input="updateColorParams"
              >
              <span class="slider-value">{{ hueSpread }}°</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Настройки "настроения" -->
      <div class="control-group">
        <label class="control-label">
          <span class="control-icon">😊</span>
          Настроение палитры
        </label>
        <div class="mood-selector">
          <button
            v-for="mood in moods"
            :key="mood.id"
            class="mood-btn"
            :class="{ active: selectedMood === mood.id }"
            @click="selectMood(mood.id)"
            :style="mood.style"
          >
            <span class="mood-icon">{{ mood.icon }}</span>
            <span class="mood-name">{{ mood.name }}</span>
          </button>
        </div>
      </div>
      
      <!-- Дополнительные опции -->
      <div class="control-group">
        <label class="control-label">
          <span class="control-icon">🔧</span>
          Дополнительные опции
        </label>
        <div class="advanced-options">
          <label class="option-checkbox">
            <input type="checkbox" v-model="options.harmonize" @change="updateOptions">
            <span class="checkmark"></span>
            <span class="option-text">Автогармонизация</span>
          </label>
          
          <label class="option-checkbox">
            <input type="checkbox" v-model="options.preserveLuminosity" @change="updateOptions">
            <span class="checkmark"></span>
            <span class="option-text">Сохранять яркость</span>
          </label>
          
          <label class="option-checkbox">
            <input type="checkbox" v-model="options.includeNeutrals" @change="updateOptions">
            <span class="checkmark"></span>
            <span class="option-text">Добавить нейтральные</span>
          </label>
          
          <label class="option-checkbox">
            <input type="checkbox" v-model="options.autoContrast" @change="updateOptions">
            <span class="checkmark"></span>
            <span class="option-text">Автоконтраст</span>
          </label>
        </div>
      </div>
      
      <!-- Предустановки -->
      <div class="control-group">
        <label class="control-label">
          <span class="control-icon">⭐</span>
          Предустановки
        </label>
        <div class="presets">
          <button
            v-for="preset in presets"
            :key="preset.name"
            class="preset-btn"
            @click="applyPreset(preset)"
            :style="preset.style"
            :title="preset.description"
          >
            <span class="preset-colors">
              <span
                v-for="color in preset.colors"
                :key="color"
                class="preset-color-dot"
                :style="{ backgroundColor: color }"
              ></span>
            </span>
            <span class="preset-name">{{ preset.name }}</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Быстрые действия -->
    <div class="quick-actions">
      <button @click="randomizeAll" class="action-btn randomize">
        <span>🎲 Полная рандомизация</span>
      </button>
      
      <button @click="resetToDefaults" class="action-btn reset">
        <span>🔄 Сбросить настройки</span>
      </button>
      
      <button @click="saveAsPreset" class="action-btn save">
        <span>💾 Сохранить пресет</span>
      </button>
      
      <button @click="copySettings" class="action-btn copy">
        <span>📋 Копировать настройки</span>
      </button>
    </div>
    
    <!-- Статус сохранения -->
    <div v-if="showSaveStatus" class="save-status" :class="saveStatusClass">
      {{ saveStatusMessage }}
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useLocalStorage } from '../composables/useLocalStorage'
import { copyToClipboard } from '../composables/useColorUtils'

export default {
  name: 'PaletteControls',
  
  emits: [
    'type-change',
    'params-change',
    'mood-change',
    'options-change',
    'preset-apply',
    'randomize',
    'reset'
  ],
  
  setup(props, { emit }) {
    const { getItem: getSettings, setItem: saveSettings } = useLocalStorage('palette-settings', {})
    
    // Типы палитр
    const paletteTypes = ref([
      { 
        id: 'analogous', 
        name: 'Аналогичная', 
        icon: '🎨',
        description: 'Цвета рядом на цветовом круге',
        class: 'type-analogous'
      },
      { 
        id: 'monochromatic', 
        name: 'Монохромная', 
        icon: '🎯',
        description: 'Оттенки одного цвета',
        class: 'type-monochromatic'
      },
      { 
        id: 'triadic', 
        name: 'Триада', 
        icon: '⚖️',
        description: 'Три равноудалённых цвета',
        class: 'type-triadic'
      },
      { 
        id: 'complementary', 
        name: 'Комплементарная', 
        icon: '🔄',
        description: 'Противоположные цвета',
        class: 'type-complementary'
      },
      { 
        id: 'split-complementary', 
        name: 'Раздельная', 
        icon: '🎭',
        description: 'Основной цвет + два соседних к комплементарному',
        class: 'type-split'
      },
      { 
        id: 'tetradic', 
        name: 'Тетрада', 
        icon: '🧩',
        description: 'Четыре цвета в двух парах комплементарных',
        class: 'type-tetradic'
      },
      { 
        id: 'square', 
        name: 'Квадратная', 
        icon: '🔲',
        description: 'Четыре равноудалённых цвета',
        class: 'type-square'
      }
    ])
    
    // Настроения палитр
    const moods = ref([
      { 
        id: 'calm', 
        name: 'Спокойствие', 
        icon: '😌',
        style: { 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }
      },
      { 
        id: 'energetic', 
        name: 'Энергия', 
        icon: '⚡',
        style: { 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white'
        }
      },
      { 
        id: 'professional', 
        name: 'Профессионализм', 
        icon: '💼',
        style: { 
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white'
        }
      },
      { 
        id: 'fresh', 
        name: 'Свежесть', 
        icon: '🌿',
        style: { 
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          color: 'white'
        }
      },
      { 
        id: 'warm', 
        name: 'Теплота', 
        icon: '🔥',
        style: { 
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          color: 'white'
        }
      },
      { 
        id: 'cool', 
        name: 'Прохлада', 
        icon: '❄️',
        style: { 
          background: 'linear-gradient(135deg, #a3bded 0%, #6991c7 100%)',
          color: 'white'
        }
      }
    ])
    
    // Предустановки
    const presets = ref([
      {
        name: 'Vue.js',
        colors: ['#41b883', '#34495e', '#35495e', '#3b8070'],
        style: {
          background: 'linear-gradient(135deg, #41b883 0%, #34495e 100%)',
          color: 'white'
        },
        description: 'Официальные цвета Vue.js',
        settings: {
          type: 'analogous',
          saturation: 60,
          lightness: 50,
          hueSpread: 30,
          mood: 'professional'
        }
      },
      {
        name: 'Material',
        colors: ['#6200ea', '#03dac6', '#ff0266', '#ffde03'],
        style: {
          background: 'linear-gradient(135deg, #6200ea 0%, #03dac6 100%)',
          color: 'white'
        },
        description: 'Material Design цвета',
        settings: {
          type: 'complementary',
          saturation: 70,
          lightness: 60,
          hueSpread: 180,
          mood: 'energetic'
        }
      },
      {
        name: 'Pastel',
        colors: ['#ffd6e7', '#c1f0ff', '#ffefd6', '#d6ffea'],
        style: {
          background: 'linear-gradient(135deg, #ffd6e7 0%, #c1f0ff 100%)',
          color: '#666'
        },
        description: 'Пастельные тона',
        settings: {
          type: 'analogous',
          saturation: 30,
          lightness: 85,
          hueSpread: 60,
          mood: 'calm'
        }
      },
      {
        name: 'Ocean',
        colors: ['#0077b6', '#00b4d8', '#90e0ef', '#caf0f8'],
        style: {
          background: 'linear-gradient(135deg, #0077b6 0%, #90e0ef 100%)',
          color: 'white'
        },
        description: 'Океанские тона',
        settings: {
          type: 'monochromatic',
          saturation: 80,
          lightness: 50,
          hueSpread: 20,
          mood: 'fresh'
        }
      }
    ])
    
    // Состояния
    const selectedType = ref('analogous')
    const selectedMood = ref('professional')
    const saturation = ref(60)
    const lightness = ref(50)
    const hueSpread = ref(30)
    
    const options = ref({
      harmonize: true,
      preserveLuminosity: true,
      includeNeutrals: false,
      autoContrast: true
    })
    
    const showSaveStatus = ref(false)
    const saveStatusMessage = ref('')
    const saveStatusClass = ref('')
    
    // Загрузка сохранённых настроек
    onMounted(() => {
      const saved = getSettings()
      if (saved.selectedType) selectedType.value = saved.selectedType
      if (saved.selectedMood) selectedMood.value = saved.selectedMood
      if (saved.saturation) saturation.value = saved.saturation
      if (saved.lightness) lightness.value = saved.lightness
      if (saved.hueSpread) hueSpread.value = saved.hueSpread
      if (saved.options) options.value = { ...options.value, ...saved.options }
    })
    
    // Сохранение настроек при изменении
    watch([selectedType, selectedMood, saturation, lightness, hueSpread, options], () => {
      saveCurrentSettings()
    }, { deep: true })
    
    // Вычисляемые свойства
    const currentSettings = computed(() => ({
      type: selectedType.value,
      mood: selectedMood.value,
      saturation: saturation.value,
      lightness: lightness.value,
      hueSpread: hueSpread.value,
      options: { ...options.value }
    }))
    
    // Методы
    const selectType = (type) => {
      selectedType.value = type
      emit('type-change', type)
    }
    
    const selectMood = (mood) => {
      selectedMood.value = mood
      emit('mood-change', mood)
    }
    
    const updateColorParams = () => {
      emit('params-change', {
        saturation: saturation.value,
        lightness: lightness.value,
        hueSpread: hueSpread.value
      })
    }
    
    const updateOptions = () => {
      emit('options-change', { ...options.value })
    }
    
    const applyPreset = (preset) => {
      selectedType.value = preset.settings.type
      selectedMood.value = preset.settings.mood
      saturation.value = preset.settings.saturation
      lightness.value = preset.settings.lightness
      hueSpread.value = preset.settings.hueSpread
      
      emit('preset-apply', preset)
      showStatus(`Применён пресет "${preset.name}"`, 'success')
    }
    
    const randomizeAll = () => {
      // Случайный тип палитры
      const randomTypes = ['analogous', 'monochromatic', 'triadic', 'complementary', 'split-complementary', 'tetradic', 'square']
      selectedType.value = randomTypes[Math.floor(Math.random() * randomTypes.length)]
      
      // Случайное настроение
      const randomMoods = ['calm', 'energetic', 'professional', 'fresh', 'warm', 'cool']
      selectedMood.value = randomMoods[Math.floor(Math.random() * randomMoods.length)]
      
      // Случайные параметры
      saturation.value = Math.floor(Math.random() * 60) + 30 // 30-90%
      lightness.value = Math.floor(Math.random() * 60) + 20 // 20-80%
      hueSpread.value = Math.floor(Math.random() * 150) + 30 // 30-180°
      
      emit('randomize', currentSettings.value)
      showStatus('Настройки рандомизированы!', 'success')
    }
    
    const resetToDefaults = () => {
      selectedType.value = 'analogous'
      selectedMood.value = 'professional'
      saturation.value = 60
      lightness.value = 50
      hueSpread.value = 30
      options.value = {
        harmonize: true,
        preserveLuminosity: true,
        includeNeutrals: false,
        autoContrast: true
      }
      
      emit('reset')
      showStatus('Настройки сброшены', 'info')
    }
    
    const saveAsPreset = () => {
      const presetName = prompt('Введите название пресета:', `Пресет ${new Date().toLocaleDateString()}`)
      if (presetName) {
        const newPreset = {
          name: presetName,
          colors: [], // Будет заполнено при генерации
          style: {
            background: 'linear-gradient(135deg, #41b883 0%, #34495e 100%)',
            color: 'white'
          },
          description: 'Пользовательский пресет',
          settings: { ...currentSettings.value }
        }
        
        presets.value.unshift(newPreset)
        showStatus(`Пресет "${presetName}" сохранён`, 'success')
      }
    }
    
    const copySettings = async () => {
      const settingsText = JSON.stringify(currentSettings.value, null, 2)
      await copyToClipboard(settingsText)
      showStatus('Настройки скопированы в буфер', 'success')
    }
    
    const saveCurrentSettings = () => {
      const settings = {
        selectedType: selectedType.value,
        selectedMood: selectedMood.value,
        saturation: saturation.value,
        lightness: lightness.value,
        hueSpread: hueSpread.value,
        options: options.value
      }
      
      saveSettings(settings)
    }
    
    const showStatus = (message, type = 'success') => {
      saveStatusMessage.value = message
      saveStatusClass.value = type
      showSaveStatus.value = true
      
      setTimeout(() => {
        showSaveStatus.value = false
      }, 3000)
    }
    
    return {
      paletteTypes,
      moods,
      presets,
      selectedType,
      selectedMood,
      saturation,
      lightness,
      hueSpread,
      options,
      showSaveStatus,
      saveStatusMessage,
      saveStatusClass,
      selectType,
      selectMood,
      updateColorParams,
      updateOptions,
      applyPreset,
      randomizeAll,
      resetToDefaults,
      saveAsPreset,
      copySettings
    }
  }
}
</script>

<style scoped>
.palette-controls {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px solid #e8e8e8;
}

.palette-controls h3 {
  margin-bottom: 1.5rem;
  color: #34495e;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.control-group {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e8e8e8;
}

.control-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.control-icon {
  font-size: 1.2rem;
}

/* Типы палитр */
.palette-types {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
}

.type-btn {
  padding: 0.75rem 0.5rem;
  border: 2px solid #e8e8e8;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-height: 70px;
}

.type-btn:hover {
  transform: translateY(-2px);
  border-color: #41b883;
}

.type-btn.active {
  border-color: #41b883;
  background: rgba(65, 184, 131, 0.1);
  color: #41b883;
}

.type-icon {
  font-size: 1.5rem;
}

.type-name {
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
}

/* Стили для типов палитр */
.type-analogous {
  border-left-color: #41b883;
}

.type-monochromatic {
  border-left-color: #3498db;
}

.type-triadic {
  border-left-color: #9b59b6;
}

.type-complementary {
  border-left-color: #e74c3c;
}

.type-split {
  border-left-color: #f39c12;
}

.type-tetradic {
  border-left-color: #1abc9c;
}

.type-square {
  border-left-color: #34495e;
}

/* Параметры цвета */
.color-params {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.param-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.param-item label {
  font-weight: 500;
  color: #34495e;
  font-size: 0.9rem;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.range-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(to right, #41b883, #3498db, #9b59b6);
  outline: none;
  opacity: 0.7;
  transition: opacity 0.2s;
  -webkit-appearance: none;
}

.range-slider:hover {
  opacity: 1;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #34495e;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.range-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #34495e;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider-value {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  font-weight: 600;
  color: #34495e;
  min-width: 50px;
}

/* Настроения */
.mood-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 0.5rem;
}

.mood-btn {
  padding: 0.75rem 0.5rem;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-height: 70px;
}

.mood-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.mood-btn.active {
  border-color: white;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.5), 0 4px 8px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

.mood-icon {
  font-size: 1.5rem;
}

.mood-name {
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
}

/* Дополнительные опции */
.advanced-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.option-checkbox:hover {
  background-color: rgba(65, 184, 131, 0.05);
}

.option-checkbox input[type="checkbox"] {
  display: none;
}

.checkmark {
  position: relative;
  width: 20px;
  height: 20px;
  border: 2px solid #41b883;
  border-radius: 4px;
  flex-shrink: 0;
}

.option-checkbox input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #41b883;
  font-weight: bold;
  font-size: 14px;
}

.option-text {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

/* Предустановки */
.presets {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.preset-btn {
  padding: 1rem;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  text-align: left;
}

.preset-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.preset-colors {
  display: flex;
  gap: 0.25rem;
}

.preset-color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.preset-name {
  font-weight: 600;
  font-size: 0.9rem;
  flex: 1;
}

/* Быстрые действия */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.action-btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn.randomize {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-btn.reset {
  background: #34495e;
  color: white;
}

.action-btn.save {
  background: linear-gradient(135deg, #41b883 0%, #3aa776 100%);
  color: white;
}

.action-btn.copy {
  background: #e9ecef;
  color: #34495e;
  border: 2px solid #dee2e6;
}

/* Статус сохранения */
.save-status {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  text-align: center;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.save-status.success {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
  border: 1px solid rgba(39, 174, 96, 0.2);
}

.save-status.info {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
  border: 1px solid rgba(52, 152, 219, 0.2);
}

.save-status.error {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.2);
}

/* Адаптивность */
@media (max-width: 768px) {
  .controls-grid {
    grid-template-columns: 1fr;
  }
  
  .palette-types,
  .mood-selector {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .control-group {
    padding: 1rem;
  }
  
  .type-btn,
  .mood-btn {
    min-height: 60px;
    padding: 0.5rem;
  }
  
  .type-icon,
  .mood-icon {
    font-size: 1.2rem;
  }
  
  .type-name,
  .mood-name {
    font-size: 0.7rem;
  }
}
</style>