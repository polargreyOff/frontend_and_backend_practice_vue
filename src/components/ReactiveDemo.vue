<template>
  <div class="reactive-demo">
    <h2>Пример 1: Реактивность</h2>
    <p>Счётчик: {{ count }}</p>
    <button @click="count++" class="btn">+1</button>
    <button @click="count = 0" class="btn secondary">Сброс</button>

    <div class="form-group">
      <label>Ваше имя:</label>
      <input v-model="name" placeholder="Введите имя" class="input" />
      <p v-if="name">Привет, {{ name }}!</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'ReactiveDemo',
  setup() {
    const count = ref(0)
    const name = ref('')

    return { count, name }
  }
}
</script>

<style scoped>
.reactive-demo {
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.btn {
  margin: 10px 5px;
  padding: 8px 16px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn.secondary {
  background-color: #35495e;
}
.form-group {
  margin-top: 20px;
}
.input {
  padding: 8px 12px;
  margin-top: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  max-width: 300px;
}
</style>