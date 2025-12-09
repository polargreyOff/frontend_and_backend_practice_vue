<template>
  <div id="app">
    <header class="app-header">
      <h1>Vue 3 Практика — Основы</h1>
    </header>

    <nav class="navigation">
      <router-link to="/reactive" class="nav-button">Пример 1: Реактивность</router-link>
      <router-link to="/conditional" class="nav-button">Пример 2: Списки и условия</router-link>
      <router-link to="/events" class="nav-button">Пример 3: События</router-link>
      <router-link to="/usercards" class="nav-button">Пример 4: Компоненты и пропсы</router-link>
      <router-link to="/searchexample" class="nav-button">Пример 5: Поиск и кастомные элементы</router-link>
    </nav>

    <main class="main-content">
      <router-view />
    </main>

    <footer class="app-footer">
      <p>Vue 3 + Vite • Практика 28</p>
    </footer>
  </div>
</template>

<script>
export default { name: 'App' }
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f9f9f9;
  color: #2c3e50;
}
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.app-header {
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}
.navigation {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
}
.nav-button {
  padding: 0.75rem 1.5rem;
  border: 2px solid #42b883;
  background-color: transparent;
  color: #42b883;
  border-radius: 25px;
  text-decoration: none;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}
.nav-button:hover,
.nav-button.router-link-active {
  background-color: #42b883;
  color: white;
  transform: translateY(-2px);
}
.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
.app-footer {
  background-color: #2c3e50;
  color: white;
  text-align: center;
  padding: 1rem;
  margin-top: auto;
}
</style>