<template>
  <component :is="currentComponent" v-if="currentComponent" />
  <div v-else class="empty">Пример не найден</div>
</template>

<script>
import { defineAsyncComponent, markRaw } from 'vue'

// Импортируем все демо-компоненты
import ReactiveDemo from '../components/ReactiveDemo.vue'
import ConditionalListDemo from '../components/ConditionalListDemo.vue'
import EventComputedDemo from '../components/EventComputedDemo.vue'
import UserCards from '../components/UserCards.vue'
import SearchExample from '../components/SearchExample.vue'

// "Заглушка" для несуществующих примеров
const Example6 = { template: '<div><h2>Пример 6: Заглушка</h2><p>Функционал ещё не реализован.</p></div>' }

export default {
  props: {
    demo: { type: String, required: true }
  },
  computed: {
    currentComponent() {
      const map = {
        reactive: markRaw(ReactiveDemo),
        conditional: markRaw(ConditionalListDemo),
        events: markRaw(EventComputedDemo),
        usercards: markRaw(UserCards),
        searchexample: markRaw(SearchExample),
        example6: markRaw(Example6)
      }
      return map[this.demo]
    }
  }
}
</script>

<style scoped>
.empty {
  padding: 2rem;
  color: #e74c3c;
}
</style>