<template>
  <div class="event-demo">
    <h2>Пример 3: События и вычисляемые свойства</h2>

    <div class="inputs">
      <input v-model="firstName" placeholder="Имя" class="input" />
      <input v-model="lastName" placeholder="Фамилия" class="input" />
    </div>

    <p>Полное имя: <strong>{{ fullName }}</strong></p>
    <p>Длина: {{ fullNameLength }} символов</p>

    <button @click="clear" class="btn">Очистить</button>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'EventComputedDemo',
  setup() {
    const firstName = ref('')
    const lastName = ref('')

    const fullName = computed(() => {
      return `${firstName.value} ${lastName.value}`.trim()
    })

    const fullNameLength = computed(() => fullName.value.length)

    const clear = () => {
      firstName.value = ''
      lastName.value = ''
    }

    return { firstName, lastName, fullName, fullNameLength, clear }
  }
}
</script>

<style scoped>
.event-demo {
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.inputs {
  display: flex;
  gap: 10px;
  margin-bottom: 1rem;
}
.input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex: 1;
}
.btn {
  padding: 8px 16px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>