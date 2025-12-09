<template>
  <div class="search-example">
    <h2>Пример 5: Поиск и кастомные элементы</h2>
    <SearchInput
      v-model="searchQuery"
      label="Поиск по имени:"
      placeholder="Введите имя пользователя..."
      @search="performSearch"
      @reset="resetSearch"
    />
    <p>Текущий запрос: "{{ searchQuery }}"</p>

    <div v-if="searchResults.length" class="results">
      <h3>Результаты поиска:</h3>
      <ul>
        <li v-for="user in searchResults" :key="user.id">
          {{ user.name }} — {{ user.email }}
        </li>
      </ul>
    </div>
    <div v-else-if="searchQuery" class="no-results">
      Ничего не найдено
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import SearchInput from './SearchInput.vue'

export default {
  name: 'SearchExample',
  components: { SearchInput },
  setup() {
    const searchQuery = ref('')

    const users = ref([
      { id: 1, name: 'Анна', email: 'anna@test.com' },
      { id: 2, name: 'Борис', email: 'boris@test.com' },
      { id: 3, name: 'Виктор', email: 'victor@test.com' },
      { id: 4, name: 'Алексей', email: 'alex@test.com' }
    ])

    const searchResults = computed(() => {
      if (!searchQuery.value) return []
      const q = searchQuery.value.toLowerCase()
      return users.value.filter(user => user.name.toLowerCase().includes(q))
    })

    const performSearch = () => {
      console.log('Выполняем поиск:', searchQuery.value)
    }

    const resetSearch = () => {
      searchQuery.value = ''
    }

    return { searchQuery, searchResults, performSearch, resetSearch }
  }
}
</script>

<style scoped>
.search-example {
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.results ul {
  list-style: none;
  padding: 0;
}
.results li {
  padding: 8px;
  margin: 5px 0;
  background: #f0fff4;
  border-radius: 4px;
}
.no-results {
  color: #e74c3c;
  font-style: italic;
}
</style>