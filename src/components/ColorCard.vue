<template>
  <div class="color-card" :style="{ backgroundColor: color }">
    <div class="card-content">
      <div class="card-header">
        <span class="color-index">#{{ index + 1 }}</span>
        <button 
          @click="$emit('toggle-lock')" 
          class="lock-btn"
          :class="{ locked }"
          :title="locked ? 'Открепить' : 'Закрепить'"
        >
          {{ locked ? '🔒' : '🔓' }}
        </button>
      </div>
      
      <div class="color-info">
        <div class="color-value" :style="{ color: textColor }">
          {{ formattedColor }}
        </div>
        <div class="color-actions">
          <button 
            @click="copyColor" 
            class="action-btn"
            :style="{ color: textColor }"
            title="Копировать"
          >
            📋
          </button>
          <input 
            type="color" 
            :value="color" 
            @input="updateColor"
            class="color-picker-btn"
            title="Изменить цвет"
          >
        </div>
      </div>
    </div>
    
    <div class="card-footer" :style="{ backgroundColor: textColor, color: color }">
      <div class="contrast-info">
        Контраст: {{ contrastRatio }}:1
        <span class="contrast-badge" :class="contrastClass">
          {{ contrastLevel }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { 
  formatColor, 
  getContrastRatio, 
  getWCAGLevel,
  hexToRgb,
  hexToHsl 
} from '../composables/useColorUtils'

export default {
  name: 'ColorCard',
  props: {
    color: {
      type: String,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    format: {
      type: String,
      default: 'HEX'
    },
    locked: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['toggle-lock', 'copy', 'change-color'],
  
  setup(props, { emit }) {
    // Форматированный цвет в выбранном формате
    const formattedColor = computed(() => {
      switch (props.format) {
        case 'RGB':
          const rgb = hexToRgb(props.color)
          return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : props.color
        case 'HSL':
          const hsl = hexToHsl(props.color)
          return hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : props.color
        default:
          return props.color.toUpperCase()
      }
    })
    
    // Цвет текста для контраста
    const textColor = computed(() => {
      const hex = props.color.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16)
      const g = parseInt(hex.substr(2, 2), 16)
      const b = parseInt(hex.substr(4, 2), 16)
      const brightness = (r * 299 + g * 587 + b * 114) / 1000
      return brightness > 128 ? '#000000' : '#ffffff'
    })
    
    // Коэффициент контраста
    const contrastRatio = computed(() => {
      return getContrastRatio(props.color, textColor.value)
    })
    
    const contrastLevel = computed(() => {
      return getWCAGLevel(contrastRatio.value)
    })
    
    const contrastClass = computed(() => {
      return {
        'AAA': 'contrast-aaa',
        'AA': 'contrast-aa',
        'Fail': 'contrast-fail'
      }[contrastLevel.value]
    })
    
    // Методы
    const copyColor = () => {
      emit('copy', props.color, props.format)
    }
    
    const updateColor = (event) => {
      emit('change-color', props.index, event.target.value)
    }
    
    return {
      formattedColor,
      textColor,
      contrastRatio,
      contrastLevel,
      contrastClass,
      copyColor,
      updateColor
    }
  }
}
</script>

<style scoped>
.color-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 180px;
  cursor: pointer;
  position: relative;
}

.color-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.card-content {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.color-index {
  font-weight: 600;
  font-size: 0.9rem;
  opacity: 0.9;
}

.lock-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;
}

.lock-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.lock-btn.locked {
  background: rgba(255, 255, 255, 0.3);
}

.color-info {
  margin-top: auto;
}

.color-value {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  word-break: break-all;
  user-select: all;
}

.color-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.action-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  backdrop-filter: blur(4px);
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.color-picker-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  padding: 2px;
}

.color-picker-btn::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-picker-btn::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}

.card-footer {
  padding: 0.75rem;
  font-size: 0.8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.contrast-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.contrast-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.contrast-aaa {
  background: #27ae60;
  color: white;
}

.contrast-aa {
  background: #f39c12;
  color: white;
}

.contrast-fail {
  background: #e74c3c;
  color: white;
}
</style>