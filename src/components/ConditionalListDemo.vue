<template>
  <div class="conditional-demo">
    <h2>Пример 2: Списки и условия</h2>
    
    <div class="filters">
      <label>
        <input type="checkbox" v-model="showActiveOnly" />
        Только активные
      </label>
    </div>

    <ul class="user-list">
      <li v-for="user in filteredUsers" :key="user.id" :class="{ inactive: !user.active }">
        {{ user.name }} ({{ user.active ? 'активен' : 'неактивен' }})
      </li>
    </ul>

    <p v-if="filteredUsers.length === 0">Нет подходящих пользователей</p>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'ConditionalListDemo',
  setup() {
    const showActiveOnly = ref(false)

    const users = ref([
      { id: 1, name: 'Анна', active: true },
      { id: 2, name: 'Борис', active: false },
      { id: 3, name: 'Виктор', active: true },
      { id: 4, name: 'Галина', active: false }
    ])

    const filteredUsers = computed(() => {
      return showActiveOnly.value
        ? users.value.filter(u => u.active)
        : users.value
    })

    return { showActiveOnly, filteredUsers }
  }
}
</script>

<style scoped>
.conditional-demo {
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.filters {
  margin-bottom: 1rem;
}
.user-list {
  list-style: none;
}
.user-list li {
  padding: 8px;
  margin: 5px 0;
  background: #f9f9f9;
  border-radius: 4px;
}
.user-list li.inactive {
  color: #999;
  text-decoration: line-through;
}
</style>