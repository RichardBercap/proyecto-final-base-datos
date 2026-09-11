import { createApp } from 'vue'
import App from '@/App.vue'
import { pinia } from '@/plugins/pinia'
import router from '@/router'
import '@/styles/index.css'

createApp(App).use(pinia).use(router).mount('#app')
