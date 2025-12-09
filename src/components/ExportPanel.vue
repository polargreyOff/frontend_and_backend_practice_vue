<template>
  <div class="export-panel card">
    <h3>📤 Экспорт палитры</h3>
    
    <div class="format-selection">
      <div class="format-tabs">
        <button 
          v-for="format in formats" 
          :key="format.id"
          class="format-tab"
          :class="{ active: selectedFormat === format.id }"
          @click="selectedFormat = format.id"
        >
          {{ format.name }}
        </button>
      </div>
      
      <div class="format-options">
        <!-- CSS Options -->
        <div v-if="selectedFormat === 'css'" class="format-option">
          <div class="option-group">
            <label>
              <input type="checkbox" v-model="cssOptions.prefix"> 
              Добавить префикс:
            </label>
            <input 
              v-model="cssOptions.prefixText" 
              class="prefix-input"
              placeholder="palette-"
              :disabled="!cssOptions.prefix"
            >
          </div>
          <div class="option-group">
            <label>
              <input type="checkbox" v-model="cssOptions.comments"> 
              Добавить комментарии
            </label>
          </div>
          <div class="option-group">
            <label>
              <input type="checkbox" v-model="cssOptions.minify"> 
              Минифицировать код
            </label>
          </div>
        </div>
        
        <!-- SCSS Options -->
        <div v-else-if="selectedFormat === 'scss'" class="format-option">
          <div class="option-group">
            <label>
              <input type="checkbox" v-model="scssOptions.variables"> 
              SCSS переменные
            </label>
          </div>
          <div class="option-group">
            <label>
              <input type="checkbox" v-model="scssOptions.mixins"> 
              Добавить миксины
            </label>
          </div>
          <div class="option-group">
            <label>
              <input type="checkbox" v-model="scssOptions.functions"> 
              Функции для цвета
            </label>
          </div>
        </div>
        
        <!-- Tailwind Options -->
        <div v-else-if="selectedFormat === 'tailwind'" class="format-option">
          <div class="option-group">
            <label>
              <input type="checkbox" v-model="tailwindOptions.extend"> 
              Extend конфигурации
            </label>
          </div>
          <div class="option-group">
            <label>
              <input type="checkbox" v-model="tailwindOptions.plugin"> 
              Как плагин
            </label>
          </div>
        </div>
        
        <!-- JSON Options -->
        <div v-else-if="selectedFormat === 'json'" class="format-option">
          <div class="option-group">
            <label>
              <input type="checkbox" v-model="jsonOptions.prettify"> 
              Форматированный JSON
            </label>
          </div>
          <div class="option-group">
            <label>
              <input type="checkbox" v-model="jsonOptions.includeMetadata"> 
              Включить метаданные
            </label>
          </div>
        </div>
        
        <!-- SVG Options -->
        <div v-else-if="selectedFormat === 'svg'" class="format-option">
          <div class="option-group">
            <label>Ширина палитры:</label>
            <input 
              type="range" 
              v-model="svgOptions.width" 
              min="100" 
              max="800" 
              step="50"
              class="range-input"
            >
            <span>{{ svgOptions.width }}px</span>
          </div>
          <div class="option-group">
            <label>Высота цвета:</label>
            <input 
              type="range" 
              v-model="svgOptions.colorHeight" 
              min="20" 
              max="100" 
              step="5"
              class="range-input"
            >
            <span>{{ svgOptions.colorHeight }}px</span>
          </div>
          <div class="option-group">
            <label>
              <input type="checkbox" v-model="svgOptions.showValues"> 
              Показать HEX значения
            </label>
          </div>
        </div>
      </div>
    </div>
    
    <div class="export-preview">
      <h4>Предпросмотр:</h4>
      <div class="preview-wrapper">
        <pre class="code-preview">{{ generatedCode }}</pre>
        
        <div v-if="selectedFormat === 'svg'" class="svg-preview" v-html="svgPreview">
        </div>
      </div>
    </div>
    
    <div class="export-actions">
      <button @click="copyCode" class="btn btn-primary">
        📋 Копировать код
      </button>
      <button @click="downloadCode" class="btn btn-secondary">
        ⬇️ Скачать файл
      </button>
      <button @click="sharePalette" class="btn btn-outline">
        🔗 Поделиться
      </button>
    </div>
    
    <div v-if="showShareLink" class="share-link">
      <div class="share-link-content">
        <input 
          :value="shareLink" 
          readonly 
          class="link-input"
          ref="linkInput"
        >
        <button @click="copyShareLink" class="btn btn-primary">
          Копировать ссылку
        </button>
      </div>
      <p class="share-hint">
        Ссылка действительна 30 дней
      </p>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { copyToClipboard } from '../composables/useColorUtils'

export default {
  name: 'ExportPanel',
  props: {
    palette: {
      type: Object,
      required: true
    }
  },
  
  setup(props) {
    const formats = [
      { id: 'css', name: 'CSS Variables' },
      { id: 'scss', name: 'SCSS Variables' },
      { id: 'tailwind', name: 'Tailwind Config' },
      { id: 'json', name: 'JSON' },
      { id: 'svg', name: 'SVG Preview' }
    ]
    
    const selectedFormat = ref('css')
    const showShareLink = ref(false)
    const shareLink = ref('')
    const linkInput = ref(null)
    
    // Опции для каждого формата
    const cssOptions = ref({
      prefix: true,
      prefixText: 'palette-',
      comments: true,
      minify: false
    })
    
    const scssOptions = ref({
      variables: true,
      mixins: false,
      functions: false
    })
    
    const tailwindOptions = ref({
      extend: true,
      plugin: false
    })
    
    const jsonOptions = ref({
      prettify: true,
      includeMetadata: true
    })
    
    const svgOptions = ref({
      width: 400,
      colorHeight: 60,
      showValues: true
    })
    
    // Генерация кода в зависимости от формата
    const generatedCode = computed(() => {
      switch (selectedFormat.value) {
        case 'css':
          return generateCSS()
        case 'scss':
          return generateSCSS()
        case 'tailwind':
          return generateTailwind()
        case 'json':
          return generateJSON()
        case 'svg':
          return generateSVG()
        default:
          return ''
      }
    })
    
    // SVG preview для отображения
    const svgPreview = computed(() => {
      if (selectedFormat.value !== 'svg') return ''
      return generateSVG(true)
    })
    
    // Генераторы кода
    const generateCSS = () => {
      const { prefix, prefixText, comments, minify } = cssOptions.value
      let css = ''
      
      if (comments) {
        css += `/* ${props.palette.name} - CSS Variables */\n`
        css += '/* Generated by Vue Palette Generator */\n\n'
      }
      
      css += ':root {\n'
      
      props.palette.colors.forEach((color, index) => {
        const varName = prefix ? `${prefixText}color-${index + 1}` : `color-${index + 1}`
        css += minify ? '' : '  '
        css += `--${varName}: ${color};`
        css += minify ? '' : '\n'
      })
      
      css += '}'
      
      if (!minify && comments) {
        css += '\n\n/* Usage example */\n'
        css += '.button {\n'
        css += '  background-color: var(--palette-color-1);\n'
        css += '  color: var(--palette-color-2);\n'
        css += '  border: 2px solid var(--palette-color-3);\n'
        css += '}'
      }
      
      return css
    }
    
    const generateSCSS = () => {
      const { variables, mixins, functions } = scssOptions.value
      let scss = ''
      
      scss += `// ${props.palette.name} - SCSS Variables\n`
      scss += '// Generated by Vue Palette Generator\n\n'
      
      if (variables) {
        props.palette.colors.forEach((color, index) => {
          scss += `$color-${index + 1}: ${color};\n`
        })
        scss += '\n'
      }
      
      if (mixins) {
        scss += '@mixin palette-theme {\n'
        props.palette.colors.forEach((color, index) => {
          scss += `  --color-${index + 1}: #{$${color}};\n`
        })
        scss += '}\n\n'
      }
      
      if (functions) {
        scss += '@function palette-color($index) {\n'
        scss += '  $colors: (\n'
        props.palette.colors.forEach((color, index) => {
          scss += `    ${index + 1}: ${color},\n`
        })
        scss += '  );\n'
        scss += '  @return map-get($colors, $index);\n'
        scss += '}\n'
      }
      
      return scss
    }
    
    const generateTailwind = () => {
      const { extend, plugin } = tailwindOptions.value
      let config = ''
      
      if (plugin) {
        config += `// ${props.palette.name} - Tailwind Plugin\n`
        config += 'const plugin = require("tailwindcss/plugin");\n\n'
        config += 'module.exports = plugin(function({ addBase, theme }) {\n'
        config += '  addBase({\n'
        config += '    ":root": {\n'
        
        props.palette.colors.forEach((color, index) => {
          config += `      "--color-${index + 1}": "${color}",\n`
        })
        
        config += '    }\n'
        config += '  });\n'
        config += '});\n'
      } else {
        config += `// ${props.palette.name} - Tailwind Config\n`
        config += 'module.exports = {\n'
        config += '  theme: {\n'
        
        if (extend) {
          config += '    extend: {\n'
          config += '      colors: {\n'
          config += `        "palette": {\n`
          
          props.palette.colors.forEach((color, index) => {
            config += `          "${index + 1}": "${color}",\n`
          })
          
          config += '        }\n'
          config += '      }\n'
          config += '    }\n'
        } else {
          config += '    colors: {\n'
          config += '      palette: {\n'
          
          props.palette.colors.forEach((color, index) => {
            config += `        ${index + 1}: "${color}",\n`
          })
          
          config += '      }\n'
          config += '    }\n'
        }
        
        config += '  }\n'
        config += '}'
      }
      
      return config
    }
    
    const generateJSON = () => {
      const { prettify, includeMetadata } = jsonOptions.value
      
      const data = {
        name: props.palette.name,
        colors: props.palette.colors
      }
      
      if (includeMetadata) {
        data.metadata = {
          type: props.palette.type,
          createdAt: props.palette.createdAt,
          generatedBy: 'Vue Palette Generator'
        }
      }
      
      return prettify 
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data)
    }
    
    const generateSVG = (asHTML = false) => {
      const { width, colorHeight, showValues } = svgOptions.value
      const colorWidth = width / props.palette.colors.length
      
      let svg = ''
      
      if (!asHTML) {
        svg += `<svg width="${width}" height="${colorHeight + (showValues ? 30 : 0)}" `
        svg += 'xmlns="http://www.w3.org/2000/svg">\n'
      }
      
      props.palette.colors.forEach((color, index) => {
        const x = index * colorWidth
        
        if (asHTML) {
          svg += `<div style="
            position: absolute;
            left: ${x}px;
            top: 0;
            width: ${colorWidth}px;
            height: ${colorHeight}px;
            background-color: ${color};
          "></div>`
        } else {
          svg += `  <rect x="${x}" y="0" `
          svg += `width="${colorWidth}" height="${colorHeight}" `
          svg += `fill="${color}" />\n`
        }
        
        if (showValues) {
          const textX = x + colorWidth / 2
          const textY = colorHeight + 20
          
          if (asHTML) {
            svg += `<div style="
              position: absolute;
              left: ${textX}px;
              top: ${colorHeight + 5}px;
              transform: translateX(-50%);
              font-family: monospace;
              font-size: 12px;
              color: #333;
              text-align: center;
            ">${color}</div>`
          } else {
            svg += `  <text x="${textX}" y="${textY}" `
            svg += 'text-anchor="middle" '
            svg += 'font-family="monospace" '
            svg += 'font-size="12" '
            svg += 'fill="#333">'
            svg += `${color}</text>\n`
          }
        }
      })
      
      if (!asHTML) {
        svg += '</svg>'
      }
      
      return svg
    }
    
    // Методы
    const copyCode = async () => {
      await copyToClipboard(generatedCode.value)
      alert('Код скопирован в буфер обмена!')
    }
    
    const downloadCode = () => {
      const blob = new Blob([generatedCode.value], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${props.palette.name.replace(/\s+/g, '-').toLowerCase()}.${selectedFormat.value}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
    
    const sharePalette = () => {
      const paletteData = {
        name: props.palette.name,
        colors: props.palette.colors,
        type: props.palette.type
      }
      
      const encoded = btoa(JSON.stringify(paletteData))
      shareLink.value = `${window.location.origin}/palette/${encoded}`
      showShareLink.value = true
    }
    
    const copyShareLink = async () => {
      await copyToClipboard(shareLink.value)
      alert('Ссылка скопирована!')
    }
    
    return {
      formats,
      selectedFormat,
      cssOptions,
      scssOptions,
      tailwindOptions,
      jsonOptions,
      svgOptions,
      generatedCode,
      svgPreview,
      showShareLink,
      shareLink,
      linkInput,
      copyCode,
      downloadCode,
      sharePalette,
      copyShareLink
    }
  }
}
</script>

<style scoped>
.export-panel {
  margin-top: 2rem;
}

.export-panel h3 {
  margin-bottom: 1.5rem;
  color: #34495e;
}

.format-selection {
  margin-bottom: 2rem;
}

.format-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.format-tab {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e8e8e8;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 120px;
  text-align: center;
}

.format-tab:hover {
  border-color: #41b883;
  transform: translateY(-1px);
}

.format-tab.active {
  background: #41b883;
  color: white;
  border-color: #41b883;
}

.format-options {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.format-option {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.option-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #34495e;
  min-width: 180px;
}

.prefix-input {
  padding: 0.5rem;
  border: 2px solid #e8e8e8;
  border-radius: 4px;
  font-size: 0.9rem;
  width: 120px;
}

.prefix-input:disabled {
  background: #e8e8e8;
  cursor: not-allowed;
}

.range-input {
  flex: 1;
  max-width: 200px;
}

.export-preview {
  margin-bottom: 2rem;
}

.export-preview h4 {
  margin-bottom: 1rem;
  color: #34495e;
}

.preview-wrapper {
  position: relative;
  min-height: 200px;
}

.code-preview {
  background: #2c3e50;
  color: #ecf0f1;
  border-radius: 8px;
  padding: 1.5rem;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 400px;
  overflow-y: auto;
  margin: 0;
}

.svg-preview {
  position: relative;
  height: 200px;
  width: 100%;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 1rem;
  border: 2px solid #e8e8e8;
}

.export-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.share-link {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.share-link-content {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.link-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e8e8e8;
  border-radius: 6px;
  background: white;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  color: #34495e;
}

.link-input:focus {
  outline: none;
  border-color: #41b883;
}

.share-hint {
  font-size: 0.9rem;
  color: #7f8c8d;
  text-align: center;
  margin: 0;
}

@media (max-width: 768px) {
  .format-tabs {
    flex-direction: column;
  }
  
  .export-actions {
    flex-direction: column;
  }
  
  .share-link-content {
    flex-direction: column;
  }
}
</style>