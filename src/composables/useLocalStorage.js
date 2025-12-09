import { ref, watch } from 'vue'

export function useLocalStorage(key, initialValue) {
  const storedValue = localStorage.getItem(key)
  const data = ref(storedValue ? JSON.parse(storedValue) : initialValue)
  
  watch(data, (newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue))
  }, { deep: true })
  
  const getItem = () => data.value
  const setItem = (value) => {
    data.value = value
  }
  const removeItem = () => {
    localStorage.removeItem(key)
    data.value = initialValue
  }
  
  return {
    getItem,
    setItem,
    removeItem,
    data
  }
}