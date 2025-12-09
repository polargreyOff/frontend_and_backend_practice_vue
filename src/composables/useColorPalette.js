import { ref, computed } from 'vue'

export function useColorPalette() {
  const currentPalette = ref([])
  
  // Генерация цветов на основе различных схем
  const generatePalette = (baseColor = '#41b883', type = 'analogous', count = 5, locked = []) => {
    const colors = []
    const baseHsl = hexToHsl(baseColor)
    
    for (let i = 0; i < count; i++) {
      if (locked[i] && currentPalette.value[i]) {
        colors.push(currentPalette.value[i])
        continue
      }
      
      let hue, saturation, lightness
      
      switch (type) {
        case 'monochromatic':
          hue = baseHsl.h
          saturation = baseHsl.s
          lightness = 20 + (i * (60 / (count - 1)))
          break
          
        case 'analogous':
          hue = (baseHsl.h + (i - Math.floor(count / 2)) * 30) % 360
          saturation = baseHsl.s
          lightness = baseHsl.l
          break
          
        case 'triadic':
          hue = (baseHsl.h + i * 120) % 360
          saturation = baseHsl.s
          lightness = baseHsl.l
          break
          
        case 'complementary':
          hue = i % 2 === 0 ? baseHsl.h : (baseHsl.h + 180) % 360
          saturation = baseHsl.s
          lightness = baseHsl.l
          break
          
        default: // random
          hue = Math.floor(Math.random() * 360)
          saturation = 40 + Math.random() * 40
          lightness = 30 + Math.random() * 40
      }
      
      // Гарантируем хорошую насыщенность и светлоту
      saturation = Math.min(Math.max(saturation, 40), 80)
      lightness = Math.min(Math.max(lightness, 25), 75)
      
      colors.push(hslToHex(hue, saturation, lightness))
    }
    
    currentPalette.value = colors
  }
  
  // Случайная палитра
  const generateRandomPalette = (count = 5, locked = []) => {
    const colors = []
    
    for (let i = 0; i < count; i++) {
      if (locked[i] && currentPalette.value[i]) {
        colors.push(currentPalette.value[i])
        continue
      }
      
      const hue = Math.floor(Math.random() * 360)
      const saturation = 40 + Math.random() * 40
      const lightness = 30 + Math.random() * 40
      
      colors.push(hslToHex(hue, saturation, lightness))
    }
    
    currentPalette.value = colors
  }
  
  // Обновление конкретного цвета
  const updateColorInPalette = (index, color) => {
    if (index >= 0 && index < currentPalette.value.length) {
      const newPalette = [...currentPalette.value]
      newPalette[index] = color
      currentPalette.value = newPalette
    }
  }
  
  // Вспомогательные функции преобразования цветов
  const hexToHsl = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return null
    
    const r = parseInt(result[1], 16) / 255
    const g = parseInt(result[2], 16) / 255
    const b = parseInt(result[3], 16) / 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h, s, l = (max + min) / 2
    
    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      
      h /= 6
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }
  
  const hslToHex = (h, s, l) => {
    h /= 360
    s /= 100
    l /= 100
    
    let r, g, b
    
    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
      }
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }
    
    const toHex = x => {
      const hex = Math.round(x * 255).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }
  
  return {
    currentPalette,
    generatePalette,
    generateRandomPalette,
    updateColorInPalette
  }
}