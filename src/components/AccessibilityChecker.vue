<template>
  <div class="accessibility-checker card">
    <h3>🔍 Проверка доступности</h3>
    
    <div class="checker-controls">
      <div class="color-pair">
        <div class="color-input-group">
          <label>Цвет текста</label>
          <div class="color-input-wrapper">
            <input 
              type="color" 
              v-model="textColor" 
              class="color-picker"
            >
            <input 
              type="text" 
              v-model="textColor" 
              class="color-text-input"
              placeholder="#000000"
              @input="validateColor"
            >
          </div>
        </div>
        
        <div class="vs-separator">
          <span>VS</span>
        </div>
        
        <div class="color-input-group">
          <label>Цвет фона</label>
          <div class="color-input-wrapper">
            <input 
              type="color" 
              v-model="backgroundColor" 
              class="color-picker"
            >
            <input 
              type="text" 
              v-model="backgroundColor" 
              class="color-text-input"
              placeholder="#FFFFFF"
              @input="validateColor"
            >
          </div>
        </div>
      </div>
      
      <button @click="swapColors" class="swap-btn" title="Поменять местами">
        🔄
      </button>
    </div>
    
    <div class="result-display">
      <div 
        class="preview-box"
        :style="{ 
          backgroundColor: backgroundColor, 
          color: textColor 
        }"
      >
        <div class="preview-content">
          <h4 :style="{ color: textColor }">Пример текста</h4>
          <p :style="{ color: textColor }">
            Это пример текста для проверки контрастности.
            Размер шрифта: 16px, жирность: нормальная.
          </p>
        </div>
      </div>
      
      <div class="results-grid">
        <div class="result-item">
          <div class="result-label">Коэффициент контраста</div>
          <div class="result-value">{{ contrastRatio.toFixed(2) }}:1</div>
        </div>
        
        <div class="result-item">
          <div class="result-label">WCAG 2.1 AA</div>
          <div class="result-status" :class="aaClass">
            {{ aaPassed ? '✅ Проходит' : '❌ Не проходит' }}
          </div>
        </div>
        
        <div class="result-item">
          <div class="result-label">WCAG 2.1 AAA</div>
          <div class="result-status" :class="aaaClass">
            {{ aaaPassed ? '✅ Проходит' : '❌ Не проходит' }}
          </div>
        </div>
        
        <div class="result-item">
          <div class="result-label">Рекомендация</div>
          <div class="result-recommendation">
            {{ recommendation }}
          </div>
        </div>
      </div>
    </div>
    
    <div class="standards-info">
      <h4>Стандарты WCAG:</h4>
      <ul>
        <li><strong>AA (мин. требования):</strong> 4.5:1 для обычного текста, 3:1 для крупного текста</li>
        <li><strong>AAA (рекомендуется):</strong> 7:1 для обычного текста, 4.5:1 для крупного текста</li>
        <li><strong>UI компоненты:</strong> 3:1 для элементов интерфейса</li>
      </ul>
    </div>
    
    <div class="suggestions">
      <h4>Рекомендации по улучшению:</h4>
      <div class="suggestions-grid">
        <button 
          v-for="suggestion in suggestions" 
          :key="suggestion.label"
          @click="applySuggestion(suggestion)"
          class="suggestion-btn"
          :style="suggestion.style"
        >
          {{ suggestion.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { 
  getContrastRatio, 
  getLuminance,
  getContrastColor 
} from '../composables/useColorUtils'

export default {
  name: 'AccessibilityChecker',
  
  setup() {
    const textColor = ref('#000000')
    const backgroundColor = ref('#FFFFFF')
    
    // Рассчитываем контрастность
    const contrastRatio = computed(() => {
      return getContrastRatio(textColor.value, backgroundColor.value)
    })
    
    // Проверка на соответствие стандартам
    const aaPassed = computed(() => contrastRatio.value >= 4.5)
    const aaaPassed = computed(() => contrastRatio.value >= 7)
    
    const aaClass = computed(() => ({
      'pass': aaPassed.value,
      'fail': !aaPassed.value
    }))
    
    const aaaClass = computed(() => ({
      'pass': aaaPassed.value,
      'fail': !aaaPassed.value
    }))
    
    // Рекомендация
    const recommendation = computed(() => {
      const ratio = contrastRatio.value
      
      if (ratio >= 7) {
        return 'Отличная контрастность! Соответствует всем стандартам.'
      } else if (ratio >= 4.5) {
        return 'Хорошая контрастность. Соответствует минимальным требованиям.'
      } else if (ratio >= 3) {
        return 'Удовлетворительная контрастность. Подходит для крупного текста.'
      } else {
        return 'Низкая контрастность. Рекомендуется улучшить.'
      }
    })
    
    // Предложения по улучшению
    const suggestions = computed(() => {
      const bgLuminance = getLuminance(backgroundColor.value)
      const textLuminance = getLuminance(textColor.value)
      
      return [
        {
          label: 'Темнее текст',
          style: {
            backgroundColor: backgroundColor.value,
            color: getContrastColor(backgroundColor.value)
          },
          action: () => {
            textColor.value = getContrastColor(backgroundColor.value)
          }
        },
        {
          label: 'Светлее фон',
          style: {
            backgroundColor: '#FFFFFF',
            color: '#000000'
          },
          action: () => {
            backgroundColor.value = '#FFFFFF'
          }
        },
        {
          label: 'Темнее фон',
          style: {
            backgroundColor: '#000000',
            color: '#FFFFFF'
          },
          action: () => {
            backgroundColor.value = '#000000'
          }
        },
        {
          label: 'Инвертировать',
          style: {
            backgroundColor: textColor.value,
            color: backgroundColor.value
          },
          action: () => {
            const temp = textColor.value
            textColor.value = backgroundColor.value
            backgroundColor.value = temp
          }
        }
      ]
    })
    
    // Методы
    const validateColor = (event) => {
      const input = event.target.value
      const hexRegex = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/
      
      if (!hexRegex.test(input)) {
        event.target.value = event.target.value.startsWith('#') ? '#000000' : '#000000'
      }
    }
    
    const swapColors = () => {
      const temp = textColor.value
      textColor.value = backgroundColor.value
      backgroundColor.value = temp
    }
    
    const applySuggestion = (suggestion) => {
      suggestion.action()
    }
    
    return {
      textColor,
      backgroundColor,
      contrastRatio,
      aaPassed,
      aaaPassed,
      aaClass,
      aaaClass,
      recommendation,
      suggestions,
      validateColor,
      swapColors,
      applySuggestion
    }
  }
}
</script>

<style scoped>
.accessibility-checker {
  margin-top: 2rem;
}

.accessibility-checker h3 {
  margin-bottom: 1.5rem;
  color: #34495e;
}

.checker-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.color-pair {
  display: flex;
  gap: 1rem;
  flex: 1;
  align-items: flex-end;
}

.color-input-group {
  flex: 1;
  min-width: 150px;
}

.color-input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #34495e;
  font-size: 0.9rem;
}

.color-input-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.color-picker {
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.color-text-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e8e8e8;
  border-radius: 6px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  min-width: 0;
}

.color-text-input:focus {
  outline: none;
  border-color: #41b883;
}

.vs-separator {
  display: flex;
  align-items: center;
  padding: 0 1rem;
}

.vs-separator span {
  background: #f8f9fa;
  border: 2px solid #e8e8e8;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #34495e;
}

.swap-btn {
  background: none;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.swap-btn:hover {
  border-color: #41b883;
  transform: rotate(180deg);
}

.result-display {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .result-display {
    grid-template-columns: 1fr;
  }
}

.preview-box {
  border-radius: 12px;
  padding: 2rem;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.1);
}

.preview-content {
  max-width: 400px;
  text-align: center;
}

.preview-content h4 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.preview-content p {
  font-size: 1rem;
  line-height: 1.6;
  opacity: 0.9;
}

.results-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
}

.result-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
}

.result-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #34495e;
  font-family: 'Monaco', 'Courier New', monospace;
}

.result-status {
  font-weight: 600;
  font-size: 1rem;
}

.result-status.pass {
  color: #27ae60;
}

.result-status.fail {
  color: #e74c3c;
}

.result-recommendation {
  color: #34495e;
  line-height: 1.5;
}

.standards-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.standards-info h4 {
  margin-bottom: 1rem;
  color: #34495e;
}

.standards-info ul {
  margin: 0;
  padding-left: 1.5rem;
}

.standards-info li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
  color: #2c3e50;
}

.standards-info strong {
  color: #34495e;
}

.suggestions h4 {
  margin-bottom: 1rem;
  color: #34495e;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.suggestion-btn {
  padding: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  text-align: center;
}

.suggestion-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>