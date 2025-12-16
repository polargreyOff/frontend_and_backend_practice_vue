<template>
  <div class="palette-library">
    <div v-if="palettes.length === 0" class="empty-library">
      <p>📚 Библиотека пуста</p>
      <p class="hint">Сохраните свои палитры чтобы они появились здесь</p>
    </div>
    
    <div v-else class="library-list">
      <div 
        v-for="palette in palettes" 
        :key="palette.id"
        class="library-item"
        @click="$emit('load-palette', palette)"
      >
        <div class="item-header">
          <h4>{{ palette.name }}</h4>
          <button 
            @click.stop="$emit('delete-palette', palette.id)"
            class="delete-btn"
            title="Удалить"
          >
            🗑️
          </button>
        </div>
        
        <div class="color-strip">
          <div 
            v-for="(color, index) in palette.colors" 
            :key="index"
            class="color-chip"
            :style="{ backgroundColor: color }"
            :title="color"
          />
        </div>
        
        <div class="item-footer">
          <span class="type-badge">{{ getTypeLabel(palette.type) }}</span>
          <span class="date">{{ formatDate(palette.createdAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaletteLibrary',
  props: {
    palettes: {
      type: Array,
      default: () => []
    }
  },
  
  emits: ['load-palette', 'delete-palette'],
  
  setup() {
    const getTypeLabel = (type) => {
      const labels = {
        analogous: 'Аналог',
        monochromatic: 'Моно',
        triadic: 'Триада',
        complementary: 'Комплем',
        random: 'Случай'
      }
      return labels[type] || type
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU')
    }
    
    return {
      getTypeLabel,
      formatDate
    }
  }
}
</script>

<style scoped>
.palette-library {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.5rem;
  padding: 10px 0;
}

.empty-library {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}

.hint {
  font-size: 0.9rem;
  margin-top: 0.5rem;
  opacity: 0.8;
}

.library-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.library-item {
  padding: 1rem;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.library-item:hover {
  border-color: #41b883;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(65, 184, 131, 0.1);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.item-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 500;
}

.delete-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s ease;
  padding: 0.25rem;
  border-radius: 4px;
}

.delete-btn:hover {
  opacity: 1;
  background: rgba(231, 76, 60, 0.1);
}

.color-strip {
  display: flex;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.color-chip {
  flex: 1;
  transition: flex 0.3s ease;
}

.color-chip:hover {
  flex: 2;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.type-badge {
  background: #e8e8e8;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
  color: #34495e;
}

.date {
  color: #7f8c8d;
}

/* Scrollbar styles */
.palette-library::-webkit-scrollbar {
  width: 8px;
}

.palette-library::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.palette-library::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.palette-library::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>