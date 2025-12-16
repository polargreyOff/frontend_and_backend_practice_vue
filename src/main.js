import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import LibraryView from './views/LibraryView.vue'

const router = createRouter({
  history: createWebHistory('/frontend_and_backend_practice_vue/'),
  routes: [
    { path: '/', component: HomeView },
    { path: '/library', component: LibraryView }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')