<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <h1>Palette Generator</h1>
        </div>
        
      </div>
    </header>

    <main class="main-content">
      <router-view />
    </main>

    <footer class="app-footer">
      <div class="footer-content">
        <p>Vue 3 + Vite • Генератор палитр</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #f9f9f9 0%, #f0f2f5 100%);
  color: #2c3e50;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header Styles */
.app-header {
  background: linear-gradient(135deg, #41b883 0%, #34495e 100%);
  color: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 10px rgba(52, 73, 94, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.vue-logo {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.app-header h1 {
  font-size: 2.2rem;
  font-weight: 600;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 1rem;
  opacity: 0.9;
  text-align: center;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Footer */
.app-footer {
  background: #34495e;
  color: white;
  padding: 1.5rem;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-links a {
  color: #41b883;
  text-decoration: none;
  margin: 0 0.5rem;
}

.footer-links a:hover {
  text-decoration: underline;
}

/* Utility Classes */
.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e8e8e8;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #41b883 0%, #3aa776 100%);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #3aa776 0%, #349a6b 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(65, 184, 131, 0.3);
}

.btn-secondary {
  background: #34495e;
  color: white;
}

.btn-secondary:hover {
  background: #2c3e50;
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  border: 2px solid #41b883;
  color: #41b883;
}

.btn-outline:hover {
  background: #41b883;
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .app-header h1 {
    font-size: 1.8rem;
  }
  
  .main-content {
    padding: 1rem;
  }
}
</style>