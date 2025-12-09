import { createRouter, createWebHistory } from 'vue-router'
import DemoView from '../views/DemoView.vue'

const routes = [
  { path: '/', redirect: '/reactive' },
  { path: '/reactive', component: DemoView, props: { demo: 'reactive' }, name: 'Reactive' },
  { path: '/conditional', component: DemoView, props: { demo: 'conditional' }, name: 'Conditional' },
  { path: '/events', component: DemoView, props: { demo: 'events' }, name: 'Events' },
  { path: '/usercards', component: DemoView, props: { demo: 'usercards' }, name: 'UserCards' },
  { path: '/searchexample', component: DemoView, props: { demo: 'searchexample' }, name: 'SearchExample' },
  { path: '/example6', component: DemoView, props: { demo: 'example6' }, name: 'Example6' },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router